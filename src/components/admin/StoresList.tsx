import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  DataTable,
  DataTableColumn,
  DataTableCell,
  Icon,
  PageHeader,
  Spinner,
} from "@salesforce/design-system-react";
import supabase from "../../lib/supabase";

interface Store {
  store_id: number;
  manager_staff_id: number;
  address_id: number;
  last_update: string;
  address?: {
    address: string;
    address2: string | null;
    district: string;
    city_id: number;
    postal_code: string | null;
    phone: string;
    city?: {
      city: string;
      country?: {
        country: string;
      };
    };
  };
  manager?: {
    first_name: string;
    last_name: string;
    email: string | null;
  };
  inventory_count: number;
  customer_count: number;
}

const StoresList: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 25;

  useEffect(() => {
    fetchStores();
  }, [page]);

  async function fetchStores() {
    setLoading(true);
    try {
      // Count total stores for pagination
      const { count } = await supabase
        .from("store")
        .select("*", { count: "exact", head: true });

      setTotalCount(count || 0);

      // Fetch stores with related data
      const { data, error } = await supabase
        .from("store")
        .select(
          `
          *,
          address:address_id(
            address,
            address2,
            district,
            postal_code,
            phone,
            city:city_id(
              city,
              country:country_id(
                country
              )
            )
          ),
          manager:manager_staff_id(
            first_name,
            last_name,
            email
          )
        `,
        )
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;

      // Fetch count of inventory and customers for each store
      const storesWithCounts = await Promise.all(
        (data || []).map(async (store) => {
          // Count inventory items at this store
          const { count: inventoryCount } = await supabase
            .from("inventory")
            .select("*", { count: "exact", head: true })
            .eq("store_id", store.store_id);

          // Count customers registered at this store
          const { count: customerCount } = await supabase
            .from("customer")
            .select("*", { count: "exact", head: true })
            .eq("store_id", store.store_id);

          return {
            ...store,
            inventory_count: inventoryCount || 0,
            customer_count: customerCount || 0,
          };
        }),
      );

      setStores(storesWithCounts);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setLoading(false);
    }
  }

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
      property: "store_id",
      width: "80px",
    },
    {
      label: "Location",
      property: "address",
      width: "25%",
      cell: (item) => (
        <DataTableCell>
          <div>
            {item.address?.address}
            {item.address?.address2 && `, ${item.address.address2}`}
          </div>
          <div>
            {item.address?.city?.city}, {item.address?.district}
          </div>
          <div>{item.address?.city?.country?.country}</div>
        </DataTableCell>
      ),
    },
    {
      label: "Manager",
      property: "manager",
      width: "20%",
      cell: (item) => (
        <DataTableCell>
          {item.manager
            ? `${item.manager.first_name} ${item.manager.last_name}`
            : "Unknown"}
          {item.manager?.email && <div>{item.manager.email}</div>}
        </DataTableCell>
      ),
    },
    {
      label: "Phone",
      property: "phone",
      width: "15%",
      cell: (item) => <DataTableCell>{item.address?.phone}</DataTableCell>,
    },
    {
      label: "Inventory",
      property: "inventory_count",
      width: "15%",
      cell: (item) => (
        <DataTableCell>{item.inventory_count} items</DataTableCell>
      ),
    },
    {
      label: "Customers",
      property: "customer_count",
      width: "15%",
      cell: (item) => (
        <DataTableCell>{item.customer_count} customers</DataTableCell>
      ),
    },
  ];

  return (
    <div className="slds-p-around_medium">
      <PageHeader
        title="Stores"
        info={`${totalCount} stores`}
        icon={<Icon category="standard" name="store" size="large" />}
      />

      <Card className="admin-box slds-m-top_medium">
        <div className="slds-p-around_medium">
          {loading ? (
            <div className="slds-p-around_medium slds-align_absolute-center">
              <Spinner
                size="medium"
                variant="brand"
                assistiveText={{ label: "Loading stores" }}
              />
            </div>
          ) : (
            <>
              <DataTable
                items={stores}
                columns={columns}
                id="stores-datatable"
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

export default StoresList;
