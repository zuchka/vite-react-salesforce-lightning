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
import { fetchUsers, type User } from "../../services/supabase";

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const pageSize = 25;

  const loadUsers = async (currentPage: number) => {
    try {
      setLoading(true);
      const { data, error, count, hasMore } = await fetchUsers(
        currentPage,
        pageSize,
      );

      if (error) {
        throw new Error(error.message);
      }

      setUsers(data);
      setTotalCount(count);
      setHasMore(hasMore);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(page);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    loadUsers(1);
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
      label: "Full Name",
      property: "full_name",
      truncate: true,
    },
    {
      label: "Email",
      property: "email",
      truncate: true,
    },
    {
      label: "Created",
      property: "created_at",
      sortable: true,
      cell: (item: User) => (
        <DataTableCell title={formatDate(item.created_at)}>
          {formatDate(item.created_at)}
        </DataTableCell>
      ),
    },
    {
      label: "Actions",
      property: "actions",
      cell: (item: User) => (
        <DataTableCell>
          <ButtonGroup variant="list" id={`actions-${item.id}`}>
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
            <Button
              assistiveText={{ icon: "Delete" }}
              iconCategory="utility"
              iconName="delete"
              iconVariant="border-filled"
              variant="icon"
              title="Delete"
            />
          </ButtonGroup>
        </DataTableCell>
      ),
    },
  ];

  if (error) {
    return (
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
      </div>
    );
  }

  return (
    <div className="slds-p-around_medium">
      <h1 className="slds-text-heading_large slds-m-bottom_large">Users</h1>

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
                    id="search-users"
                    placeholder="Search users..."
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
                        loadUsers(1);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div>
              <Button
                label="Add User"
                variant="brand"
                iconCategory="utility"
                iconName="add"
                iconPosition="left"
              />
            </div>
          </div>

          <div className="slds-p-around_medium">
            {loading ? (
              <div className="slds-is-relative" style={{ height: "200px" }}>
                <Spinner
                  assistiveText={{ label: "Loading users" }}
                  size="large"
                  variant="brand"
                />
              </div>
            ) : (
              <>
                <DataTable
                  items={users}
                  columns={columns}
                  id="users-table"
                  noRowHover={false}
                  className="slds-table_striped"
                  fixedLayout
                />

                <div className="slds-grid slds-grid_align-spread slds-m-top_medium">
                  <div>
                    <p className="slds-text-color_weak">
                      Showing {users.length > 0 ? (page - 1) * pageSize + 1 : 0}{" "}
                      to {(page - 1) * pageSize + users.length} of {totalCount}{" "}
                      users
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

export default UsersList;
