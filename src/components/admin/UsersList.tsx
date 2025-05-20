import React, { useState } from "react";
import { useTableData } from "../../hooks/useTableData";
import { Tables, User } from "../../types/database";
import {
  Card,
  DataTable,
  DataTableColumn,
  DataTableCell,
  Button,
  ButtonGroup,
  Input,
  Icon,
  Spinner,
  PageHeader,
  Avatar,
} from "@salesforce/design-system-react";

const UsersList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const {
    data: users,
    count,
    loading,
    error,
    page,
    nextPage,
    prevPage,
    refreshData,
    setPage,
  } = useTableData<User>({
    tableName: Tables.USERS,
    orderBy: { column: "created_at", ascending: false },
    filterColumn: isSearching ? "email" : undefined,
    filterValue: isSearching ? searchTerm : undefined,
  });

  const handleSearch = () => {
    setIsSearching(!!searchTerm);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setIsSearching(false);
    setPage(1);
  };

  const totalPages = Math.ceil(count / 25);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  // User role badge
  const UserRoleBadge = ({ role }: { role: string }) => {
    let variant = "default";

    switch (role) {
      case "admin":
        variant = "error";
        break;
      case "creator":
        variant = "success";
        break;
      case "viewer":
        variant = "default";
        break;
    }

    return (
      <div className={`slds-badge slds-badge_${variant} slds-text-title_caps`}>
        {role}
      </div>
    );
  };

  return (
    <div className="users-list">
      <PageHeader
        icon={<Icon category="standard" name="user" />}
        title="Users Management"
        info={`${count} users total`}
        className="admin-page-header"
      />

      <Card className="admin-box slds-m-around_small">
        <div className="slds-p-around_medium">
          <div className="slds-grid slds-gutters slds-m-bottom_medium">
            <div className="slds-col slds-size_3-of-4">
              <Input
                id="user-search"
                placeholder="Search users by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                iconRight={
                  <Button
                    assistiveText={{ icon: "Search" }}
                    iconCategory="utility"
                    iconName="search"
                    iconVariant="bare"
                    onClick={handleSearch}
                    className="slds-input__icon slds-input__icon_right"
                    variant="icon"
                  />
                }
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="slds-col slds-size_1-of-4 slds-grid slds-grid_align-end">
              <ButtonGroup>
                {isSearching && (
                  <Button
                    label="Clear"
                    onClick={clearSearch}
                    variant="neutral"
                  />
                )}
                <Button
                  label="Refresh"
                  onClick={() => refreshData()}
                  variant="neutral"
                  iconCategory="utility"
                  iconName="refresh"
                  iconPosition="left"
                />
              </ButtonGroup>
            </div>
          </div>

          {loading ? (
            <div
              className="slds-p-around_medium slds-align_absolute-center"
              style={{ height: "200px" }}
            >
              <Spinner
                assistiveText={{ label: "Loading Users" }}
                size="large"
                variant="brand"
              />
            </div>
          ) : error ? (
            <div className="slds-text-color_error slds-p-around_medium">
              Error loading users: {error.message}
            </div>
          ) : (
            <>
              <DataTable items={users} id="users-table" className="admin-table">
                <DataTableColumn
                  key="avatar"
                  label=""
                  property="avatar_url"
                  width="60px"
                  cell={(props) => (
                    <DataTableCell>
                      <Avatar
                        imgAlt={`${props.item.first_name} ${props.item.last_name}`}
                        imgSrc={props.item.avatar_url}
                        title={`${props.item.first_name} ${props.item.last_name}`}
                        variant="user"
                        size="medium"
                      />
                    </DataTableCell>
                  )}
                />
                <DataTableColumn
                  key="name"
                  label="Name"
                  property="first_name"
                  cell={(props) => (
                    <DataTableCell
                      title={`${props.item.first_name} ${props.item.last_name}`}
                    >
                      {props.item.first_name} {props.item.last_name}
                    </DataTableCell>
                  )}
                />
                <DataTableColumn key="email" label="Email" property="email" />
                <DataTableColumn
                  key="role"
                  label="Role"
                  property="role"
                  width="100px"
                  cell={(props) => (
                    <DataTableCell>
                      <UserRoleBadge role={props.item.role} />
                    </DataTableCell>
                  )}
                />
                <DataTableColumn
                  key="subscription"
                  label="Subscription"
                  property="subscription_tier"
                  width="120px"
                />
                <DataTableColumn
                  key="created_at"
                  label="Joined"
                  property="created_at"
                  width="120px"
                  cell={(props) => (
                    <DataTableCell title={formatDate(props.item.created_at)}>
                      {formatDate(props.item.created_at)}
                    </DataTableCell>
                  )}
                />
                <DataTableColumn
                  key="last_sign_in"
                  label="Last Sign In"
                  property="last_sign_in"
                  width="120px"
                  cell={(props) => (
                    <DataTableCell title={formatDate(props.item.last_sign_in)}>
                      {formatDate(props.item.last_sign_in)}
                    </DataTableCell>
                  )}
                />
                <DataTableColumn
                  key="actions"
                  label="Actions"
                  property="id"
                  width="120px"
                  cell={(props) => (
                    <DataTableCell>
                      <ButtonGroup>
                        <Button
                          assistiveText={{ icon: "Edit" }}
                          iconCategory="utility"
                          iconName="edit"
                          iconVariant="border"
                          variant="icon"
                          className="slds-m-right_xx-small"
                        />
                        <Button
                          assistiveText={{ icon: "View" }}
                          iconCategory="utility"
                          iconName="preview"
                          iconVariant="border"
                          variant="icon"
                        />
                      </ButtonGroup>
                    </DataTableCell>
                  )}
                />
              </DataTable>

              <div className="slds-grid slds-grid_align-spread slds-p-vertical_medium">
                <div>
                  <p className="slds-text-body_small">
                    Showing page {page} of {totalPages || 1} ({count} total
                    items)
                  </p>
                </div>
                <div>
                  <ButtonGroup>
                    <Button
                      label="Previous"
                      onClick={prevPage}
                      disabled={page <= 1}
                      variant="neutral"
                      iconCategory="utility"
                      iconName="chevronleft"
                      iconPosition="left"
                    />
                    <Button
                      label="Next"
                      onClick={nextPage}
                      disabled={page >= totalPages}
                      variant="neutral"
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
      </Card>
    </div>
  );
};

export default UsersList;
