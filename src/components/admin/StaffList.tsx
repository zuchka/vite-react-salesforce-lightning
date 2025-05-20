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

interface Staff {
  staff_id: number;
  first_name: string;
  last_name: string;
  address_id: number;
  email: string | null;
  store_id: number;
  active: boolean;
  username: string;
  password: string | null;
  last_update: string;
  picture: string | null;
  address?: {
    address: string;
    address2: string | null;
    district: string;
    city?: {
      city: string;
      country?: {
        country: string;
      };
    };
    postal_code: string | null;
    phone: string;
  };
  rental_count: number;
}

const StaffList: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 25;

  useEffect(() => {
    fetchStaff();
  }, [page]);

  async function fetchStaff() {
    setLoading(true);
    try {
      // Count total staff for pagination
      const { count } = await supabase
        .from("staff")
        .select("*", { count: "exact", head: true });

      setTotalCount(count || 0);

      // Fetch staff with related data
      const { data, error } = await supabase
        .from("staff")
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
        .order("last_name");

      if (error) throw error;

      // Count rentals processed by each staff member
      const staffWithRentalCounts = await Promise.all(
        (data || []).map(async (staffMember) => {
          const { count: rentalCount } = await supabase
            .from("rental")
            .select("*", { count: "exact", head: true })
            .eq("staff_id", staffMember.staff_id);

          return {
            ...staffMember,
            rental_count: rentalCount || 0,
          };
        }),
      );

      setStaff(staffWithRentalCounts);
    } catch (error) {
      console.error("Error fetching staff:", error);
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
      property: "staff_id",
      width: "80px",
    },
    {
      label: "Name",
      property: "first_name",
      width: "20%",
      cell: (item) => (
        <DataTableCell>
          {item.first_name} {item.last_name}
        </DataTableCell>
      ),
    },
    {
      label: "Email/Username",
      property: "email",
      width: "20%",
      cell: (item) => (
        <DataTableCell>
          <div>{item.email || "No email"}</div>
          <div className="slds-text-color_weak">@{item.username}</div>
        </DataTableCell>
      ),
    },
    {
      label: "Location",
      property: "address",
      width: "25%",
      cell: (item) => (
        <DataTableCell>
          <div>
            {item.address?.city?.city}, {item.address?.district}
          </div>
          <div>{item.address?.city?.country?.country}</div>
        </DataTableCell>
      ),
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
      label: "Rentals Processed",
      property: "rental_count",
      width: "15%",
      cell: (item) => <DataTableCell>{item.rental_count}</DataTableCell>,
    },
  ];

  return (
    <div className="slds-p-around_medium">
      <PageHeader
        title="Staff"
        info={`${totalCount} staff members`}
        icon={<Icon category="standard" name="employee" size="large" />}
      />

      <Card className="admin-box slds-m-top_medium">
        <div className="slds-p-around_medium">
          {loading ? (
            <div className="slds-p-around_medium slds-align_absolute-center">
              <Spinner
                size="medium"
                variant="brand"
                assistiveText={{ label: "Loading staff" }}
              />
            </div>
          ) : (
            <>
              <DataTable
                items={staff}
                columns={columns}
                id="staff-datatable"
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

export default StaffList;
