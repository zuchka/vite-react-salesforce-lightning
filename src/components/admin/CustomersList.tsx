import React, { useEffect, useState } from "react";
import {
  Card,
  DataTable,
  DataTableColumn,
  DataTableCell,
  Button,
  ButtonGroup,
  Icon,
  Spinner,
  Input,
} from "@salesforce/design-system-react";
import { fetchCustomers, type Customer } from "../../services/supabase";

const CustomersList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableExists, setTableExists] = useState(true);
  const pageSize = 25;

  const loadCustomers = async (currentPage: number) => {
    try {
      setLoading(true);
      const {
        data,
        error,
        count,
        hasMore,
        tableExists: exists,
      } = await fetchCustomers(currentPage, pageSize);

      setTableExists(exists);

      if (!exists) {
        setError("The customer table does not exist in the database.");
        return;
      }

      if (error) {
        throw new Error(error.message);
      }

      setCustomers(data);
      setTotalCount(count);
      setHasMore(hasMore);
    } catch (err) {
      console.error("Error loading customers:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load customers. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers(page);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    loadCustomers(1);
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNext = () => {
    if (hasMore) {
      setPage(page + 1);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Define the columns for the data table
  const columns: DataTableColumn[] = [
    {
      label: "Customer ID",
      property: "customer_id",
      sortable: true,
    },
    {
      label: "First Name",
      property: "first_name",
      truncate: true,
    },
    {
      label: "Last Name",
      property: "last_name",
      truncate: true,
    },
    {
      label: "Email",
      property: "email",
      truncate: true,
    },
    {
      label: "Active",
      property: "activebool",
      cell: (item: Customer) => (
        <DataTableCell title={item.activebool ? "Yes" : "No"}>
          {item.activebool ? "Yes" : "No"}
        </DataTableCell>
      ),
    },
    {
      label: "Created",
      property: "create_date",
      sortable: true,
      cell: (item: Customer) => (
        <DataTableCell title={formatDate(item.create_date)}>
          {formatDate(item.create_date)}
        </DataTableCell>
      ),
    },
    {
      label: "Actions",
      property: "actions",
      cell: (item: Customer) => (
        <DataTableCell>
          <ButtonGroup variant="list" id={`actions-${item.customer_id}`}>
            <Button
              assistiveText={{ icon: "View" }}
              iconCategory="utility"
              iconName="preview"
              iconVariant="border-filled"
              variant="icon"
              title="View"
            />
            <Button
              assistiveText={{ icon: "Edit" }}
              iconCategory="utility"
              iconName="edit"
              iconVariant="border-filled"
              variant="icon"
              title="Edit"
            />
          </ButtonGroup>
        </DataTableCell>
      ),
    },
  ];

  if (!tableExists) {
    return (
      <div className="slds-p-around_medium">
        <h1 className="slds-text-heading_large slds-m-bottom_large">
          Customers
        </h1>

        <Card className="admin-box">
          <div className="slds-p-around_large slds-text-align_center">
            <Icon
              category="utility"
              name="error"
              size="large"
              className="slds-m-bottom_medium"
              style={{ fill: "#ffb75d", width: "3rem", height: "3rem" }}
            />
            <h2 className="slds-text-heading_medium slds-m-bottom_medium">
              Customer Table Not Found
            </h2>
            <p className="slds-m-bottom_large">
              The customer table doesn't exist in your Supabase database.
            </p>
            <Button
              label="Go to Database Explorer"
              variant="brand"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("changeAdminTab", {
                    detail: { tab: "explore" },
                  }),
                );
              }}
            />
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="slds-p-around_medium">
        <h1 className="slds-text-heading_large slds-m-bottom_large">
          Customers
        </h1>

        <div className="slds-p-around_large admin-box">
          <div
            className="slds-notify slds-notify_alert slds-theme_alert-texture slds-theme_error"
            role="alert"
          >
            <Icon
              category="utility"
              name="error"
              className="slds-m-right_small"
            />
            <h2>{error}</h2>
          </div>
          <div className="slds-text-align_center slds-m-top_large">
            <Button
              label="Retry"
              variant="brand"
              onClick={() => {
                setError(null);
                loadCustomers(1);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="slds-p-around_medium">
      <h1 className="slds-text-heading_large slds-m-bottom_large">Customers</h1>

      <Card className="admin-box">
        <div className="slds-grid slds-grid_vertical">
          <div className="slds-p-around_medium slds-grid slds-grid_align-spread">
            <div className="slds-size_1-of-2">
              <div className="slds-form-element">
                <div className="slds-form-element__control slds-input-has-icon slds-input-has-icon_left-right">
                  <Icon
                    assistiveText={{ label: "Search" }}
                    category="utility"
                    name="search"
                    size="x-small"
                    className="slds-input__icon slds-input__icon_left"
                  />
                  <Input
                    id="search-customers"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    onKeyDown={(event) =>
                      event.key === "Enter" && handleSearch()
                    }
                  />
                  {searchTerm && (
                    <Button
                      assistiveText={{ icon: "Clear" }}
                      iconCategory="utility"
                      iconName="clear"
                      iconVariant="border-filled"
                      variant="icon"
                      className="slds-input__icon slds-input__icon_right"
                      onClick={() => {
                        setSearchTerm("");
                        setPage(1);
                        loadCustomers(1);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div>
              <Button
                label="View Details"
                variant="brand"
                iconCategory="utility"
                iconName="preview"
                iconPosition="left"
              />
            </div>
          </div>

          <div className="slds-p-around_medium">
            {loading ? (
              <div className="slds-is-relative" style={{ height: "200px" }}>
                <Spinner
                  assistiveText={{ label: "Loading customers" }}
                  size="large"
                  variant="brand"
                />
              </div>
            ) : (
              <>
                <DataTable
                  items={customers}
                  columns={columns}
                  id="customers-table"
                  noRowHover={false}
                  className="slds-table_striped"
                  fixedLayout
                />

                <div className="slds-grid slds-grid_align-spread slds-m-top_medium">
                  <div>
                    <p className="slds-text-color_weak">
                      Showing{" "}
                      {customers.length > 0 ? (page - 1) * pageSize + 1 : 0} to{" "}
                      {(page - 1) * pageSize + customers.length} of {totalCount}{" "}
                      customers
                    </p>
                  </div>
                  <div>
                    <ButtonGroup>
                      <Button
                        label="Previous"
                        onClick={handlePrevious}
                        disabled={page <= 1}
                        iconCategory="utility"
                        iconName="chevronleft"
                        iconPosition="left"
                      />
                      <Button
                        label="Next"
                        onClick={handleNext}
                        disabled={!hasMore}
                        iconCategory="utility"
                        iconName="chevronright"
                        iconPosition="right"
                      />
                    </ButtonGroup>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CustomersList;
