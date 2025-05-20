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

interface Customer {
  customer_id: number;
  store_id: number;
  first_name: string;
  last_name: string;
  email: string;
  address_id: number;
  active: boolean;
  create_date: string;
  last_update: string;
  address?: {
    address: string;
    address2: string | null;
    district: string;
    city: {
      city: string;
      country: {
        country: string;
      };
    };
    postal_code: string | null;
    phone: string;
  };
  rental_count: number;
}

const CustomersList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 25;

  useEffect(() => {
    fetchCustomers();
  }, [page, searchTerm]);

  async function fetchCustomers() {
    setLoading(true);
    try {
      // Count total customers for pagination
      const countQuery = supabase
        .from("customer")
        .select("*", { count: "exact", head: true });

      if (searchTerm) {
        countQuery.or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`,
        );
      }

      const { count } = await countQuery;
      setTotalCount(count || 0);

      // Fetch customers with pagination
      let query = supabase
        .from("customer")
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
          )
        `,
        )
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order("last_name", { ascending: true });

      if (searchTerm) {
        query = query.or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`,
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      // Count rentals for each customer
      const customersWithRentalCount = await Promise.all(
        (data || []).map(async (customer) => {
          const { count: rentalCount } = await supabase
            .from("rental")
            .select("*", { count: "exact", head: true })
            .eq("customer_id", customer.customer_id);

          return {
            ...customer,
            rental_count: rentalCount || 0,
          };
        }),
      );

      setCustomers(customersWithRentalCount);
    } catch (error) {
      console.error("Error fetching customers:", error);
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
      property: "customer_id",
      width: "80px",
    },
    {
      label: "Name",
      property: "first_name",
      width: "15%",
      cell: (item) => (
        <DataTableCell>
          {item.first_name} {item.last_name}
        </DataTableCell>
      ),
    },
    {
      label: "Email",
      property: "email",
      width: "20%",
    },
    {
      label: "Location",
      property: "address",
      width: "25%",
      cell: (item) => (
        <DataTableCell>
          {item.address?.city?.city}, {item.address?.city?.country?.country}
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
      label: "Status",
      property: "active",
      width: "10%",
      cell: (item) => (
        <DataTableCell>
          <span
            className={`slds-badge ${item.active ? "slds-theme_success" : "slds-theme_warning"}`}
          >
            {item.active ? "Active" : "Inactive"}
          </span>
        </DataTableCell>
      ),
    },
    {
      label: "Rentals",
      property: "rental_count",
      width: "10%",
    },
  ];

  return (
    <div className="slds-p-around_medium">
      <PageHeader
        title="Customers"
        info={`${totalCount} customers`}
        icon={<Icon category="standard" name="people" size="large" />}
      />

      <Card className="admin-box slds-m-top_medium">
        <div className="slds-p-around_medium">
          <div className="slds-grid slds-grid_vertical-align-end slds-m-bottom_medium">
            <div className="slds-col slds-size_1-of-3">
              <Input
                aria-label="Search Customers"
                id="customer-search"
                placeholder="Search by name or email"
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
                assistiveText={{ label: "Loading customers" }}
              />
            </div>
          ) : (
            <>
              <DataTable
                items={customers}
                columns={columns}
                id="customers-datatable"
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

export default CustomersList;
