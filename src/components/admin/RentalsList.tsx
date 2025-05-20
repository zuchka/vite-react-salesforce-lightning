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

interface Rental {
  rental_id: number;
  rental_date: string;
  inventory_id: number;
  customer_id: number;
  return_date: string | null;
  staff_id: number;
  last_update: string;
  customer?: {
    first_name: string;
    last_name: string;
  };
  staff?: {
    first_name: string;
    last_name: string;
  };
  inventory?: {
    film?: {
      title: string;
    };
  };
}

const RentalsList: React.FC = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 25;

  useEffect(() => {
    fetchRentals();
  }, [page, searchTerm]);

  async function fetchRentals() {
    setLoading(true);
    try {
      // Count total rentals for pagination
      const countQuery = supabase
        .from("rental")
        .select("*", { count: "exact", head: true });

      const { count } = await countQuery;
      setTotalCount(count || 0);

      // Fetch rentals with pagination
      let query = supabase
        .from("rental")
        .select(
          `
          *,
          customer:customer_id(
            first_name,
            last_name
          ),
          staff:staff_id(
            first_name,
            last_name
          ),
          inventory:inventory_id(
            film:film_id(
              title
            )
          )
        `,
        )
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order("rental_date", { ascending: false });

      if (searchTerm) {
        // Apply the search term to the joined tables
        query = query.textSearch("rental", `'*${searchTerm}*'`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setRentals(data || []);
    } catch (error) {
      console.error("Error fetching rentals:", error);
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
      property: "rental_id",
      width: "80px",
    },
    {
      label: "Film",
      property: "inventory",
      width: "25%",
      cell: (item) => (
        <DataTableCell>
          {item.inventory?.film?.title || "Unknown"}
        </DataTableCell>
      ),
    },
    {
      label: "Customer",
      property: "customer",
      width: "20%",
      cell: (item) => (
        <DataTableCell>
          {item.customer
            ? `${item.customer.first_name} ${item.customer.last_name}`
            : "Unknown"}
        </DataTableCell>
      ),
    },
    {
      label: "Staff",
      property: "staff",
      width: "15%",
      cell: (item) => (
        <DataTableCell>
          {item.staff
            ? `${item.staff.first_name} ${item.staff.last_name}`
            : "Unknown"}
        </DataTableCell>
      ),
    },
    {
      label: "Rental Date",
      property: "rental_date",
      width: "15%",
      cell: (item) => (
        <DataTableCell>
          {new Date(item.rental_date).toLocaleString()}
        </DataTableCell>
      ),
    },
    {
      label: "Return Date",
      property: "return_date",
      width: "15%",
      cell: (item) => (
        <DataTableCell>
          {item.return_date ? (
            new Date(item.return_date).toLocaleString()
          ) : (
            <span className="slds-badge slds-theme_warning">Not Returned</span>
          )}
        </DataTableCell>
      ),
    },
  ];

  return (
    <div className="slds-p-around_medium">
      <PageHeader
        title="Rentals"
        info={`${totalCount} rentals`}
        icon={<Icon category="standard" name="contract" size="large" />}
      />

      <Card className="admin-box slds-m-top_medium">
        <div className="slds-p-around_medium">
          <div className="slds-grid slds-grid_vertical-align-end slds-m-bottom_medium">
            <div className="slds-col slds-size_1-of-3">
              <Input
                aria-label="Search Rentals"
                id="rental-search"
                placeholder="Search rentals"
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
                assistiveText={{ label: "Loading rentals" }}
              />
            </div>
          ) : (
            <>
              <DataTable
                items={rentals}
                columns={columns}
                id="rentals-datatable"
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

export default RentalsList;
