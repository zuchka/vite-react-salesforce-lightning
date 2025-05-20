import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  DataTable,
  DataTableColumn,
  DataTableCell,
  Icon,
  Input,
  PageHeader,
  Spinner,
} from "@salesforce/design-system-react";
import supabase from "../../lib/supabase";

interface Inventory {
  inventory_id: number;
  film_id: number;
  store_id: number;
  last_update: string;
  film?: {
    title: string;
    rental_rate: number;
    replacement_cost: number;
  };
  store?: {
    address?: {
      city?: {
        city: string;
      };
    };
  };
  is_rented: boolean;
}

const InventoryList: React.FC = () => {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 25;

  useEffect(() => {
    fetchInventory();
  }, [page, searchTerm]);

  async function fetchInventory() {
    setLoading(true);
    try {
      // Count total inventory for pagination
      const countQuery = supabase
        .from("inventory")
        .select("*", { count: "exact", head: true });

      const { count } = await countQuery;
      setTotalCount(count || 0);

      // Fetch inventory with pagination
      let query = supabase
        .from("inventory")
        .select(
          `
          *,
          film:film_id(
            title,
            rental_rate,
            replacement_cost
          ),
          store:store_id(
            address:address_id(
              city:city_id(
                city
              )
            )
          )
        `,
        )
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order("inventory_id");

      if (searchTerm) {
        // Join to film to search by title
        query = query.textSearch("film.title", `'${searchTerm}'`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Check if each inventory item is currently rented
      const inventoryWithRentalStatus = await Promise.all(
        (data || []).map(async (item) => {
          // Look for rentals without a return date
          const { data: rentalData } = await supabase
            .from("rental")
            .select("rental_id, return_date")
            .eq("inventory_id", item.inventory_id)
            .is("return_date", null)
            .limit(1);

          return {
            ...item,
            is_rented: rentalData && rentalData.length > 0,
          };
        }),
      );

      setInventory(inventoryWithRentalStatus);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handlePreviousPage = () => {
    setPage(Math.max(0, page - 1));
  };

  const handleNextPage = () => {
    if ((page + 1) * pageSize < totalCount) {
      setPage(page + 1);
    }
  };

  const columns: DataTableColumn[] = [
    {
      label: "ID",
      property: "inventory_id",
      width: "80px",
    },
    {
      label: "Film",
      property: "film",
      width: "30%",
      cell: (item) => (
        <DataTableCell>{item.film?.title || "Unknown"}</DataTableCell>
      ),
    },
    {
      label: "Store",
      property: "store",
      width: "20%",
      cell: (item) => (
        <DataTableCell>
          {item.store?.address?.city?.city
            ? `Store at ${item.store.address.city.city}`
            : `Store ID: ${item.store_id}`}
        </DataTableCell>
      ),
    },
    {
      label: "Status",
      property: "is_rented",
      width: "15%",
      cell: (item) => (
        <DataTableCell>
          <span
            className={`slds-badge ${item.is_rented ? "slds-theme_warning" : "slds-theme_success"}`}
          >
            {item.is_rented ? "Rented Out" : "Available"}
          </span>
        </DataTableCell>
      ),
    },
    {
      label: "Rental Rate",
      property: "rental_rate",
      width: "15%",
      cell: (item) => (
        <DataTableCell>${item.film?.rental_rate.toFixed(2)}</DataTableCell>
      ),
    },
    {
      label: "Replacement Cost",
      property: "replacement_cost",
      width: "15%",
      cell: (item) => (
        <DataTableCell>${item.film?.replacement_cost.toFixed(2)}</DataTableCell>
      ),
    },
  ];

  return (
    <div className="slds-p-around_medium">
      <PageHeader
        title="Inventory"
        info={`${totalCount} items`}
        icon={<Icon category="standard" name="box" size="large" />}
      />

      <Card className="admin-box slds-m-top_medium">
        <div className="slds-p-around_medium">
          <div className="slds-grid slds-grid_vertical-align-end slds-m-bottom_medium">
            <div className="slds-col slds-size_1-of-3">
              <Input
                aria-label="Search Inventory"
                id="inventory-search"
                placeholder="Search by film title"
                onChange={handleSearch}
                value={searchTerm}
                iconLeft={
                  <Icon
                    assistiveText={{
                      icon: "Search",
                    }}
                    name="search"
                    size="x-small"
                    category="utility"
                  />
                }
              />
            </div>
          </div>

          {loading ? (
            <div className="slds-p-around_medium slds-align_absolute-center">
              <Spinner
                size="medium"
                variant="brand"
                assistiveText={{ label: "Loading inventory" }}
              />
            </div>
          ) : (
            <>
              <DataTable
                items={inventory}
                columns={columns}
                id="inventory-datatable"
                bordered
                striped
                noRowHover
              />

              <div className="slds-grid slds-grid_align-center slds-m-top_medium">
                <Button
                  label="Previous"
                  onClick={handlePreviousPage}
                  disabled={page === 0}
                  iconCategory="utility"
                  iconName="chevronleft"
                  iconPosition="left"
                  className="slds-m-right_small"
                />
                <span className="slds-align-middle slds-p-vertical_x-small">
                  Page {page + 1} of {Math.ceil(totalCount / pageSize)}
                </span>
                <Button
                  label="Next"
                  onClick={handleNextPage}
                  disabled={(page + 1) * pageSize >= totalCount}
                  iconCategory="utility"
                  iconName="chevronright"
                  iconPosition="right"
                  className="slds-m-left_small"
                />
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InventoryList;
