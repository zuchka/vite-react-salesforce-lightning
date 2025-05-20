import React, { useState } from "react";
import { useTableData } from "../../hooks/useTableData";
import { Tables, Subscription, User } from "../../types/database";
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
} from "@salesforce/design-system-react";
import { supabase } from "../../services/supabaseClient";

const SubscriptionsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [userMap, setUserMap] = useState<Record<string, User>>({});

  const {
    data: subscriptions,
    count,
    loading,
    error,
    page,
    nextPage,
    prevPage,
    refreshData,
    setPage,
  } = useTableData<Subscription>({
    tableName: Tables.SUBSCRIPTIONS,
    orderBy: { column: "start_date", ascending: false },
    filterColumn: isSearching ? "user_id" : undefined,
    filterValue: isSearching ? searchTerm : undefined,
  });

  // Load user data for each subscription
  React.useEffect(() => {
    const loadUserData = async () => {
      if (!subscriptions || subscriptions.length === 0) return;

      // Extract unique user IDs
      const userIds = [...new Set(subscriptions.map((sub) => sub.user_id))];

      // Fetch user data
      const { data: userData, error } = await supabase
        .from(Tables.USERS)
        .select("id, email, first_name, last_name")
        .in("id", userIds);

      if (error) {
        console.error("Error loading user data:", error);
        return;
      }

      // Create a map of user_id to user data
      const userDataMap = (userData || []).reduce(
        (acc, user) => ({
          ...acc,
          [user.id]: user,
        }),
        {},
      );

      setUserMap(userDataMap);
    };

    loadUserData();
  }, [subscriptions]);

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
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  // Subscription status badge
  const SubscriptionStatusBadge = ({ status }: { status: string }) => {
    let variant = "default";

    switch (status) {
      case "active":
        variant = "success";
        break;
      case "canceled":
        variant = "warning";
        break;
      case "past_due":
        variant = "error";
        break;
    }

    return (
      <div className={`slds-badge slds-badge_${variant} slds-text-title_caps`}>
        {status}
      </div>
    );
  };

  return (
    <div className="subscriptions-list">
      <PageHeader
        icon={<Icon category="standard" name="product_consumed" />}
        title="Subscriptions Management"
        info={`${count} subscriptions total`}
        className="admin-page-header"
      />

      <Card className="admin-box slds-m-around_small">
        <div className="slds-p-around_medium">
          <div className="slds-grid slds-gutters slds-m-bottom_medium">
            <div className="slds-col slds-size_3-of-4">
              <Input
                id="subscription-search"
                placeholder="Search by user ID..."
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
                assistiveText={{ label: "Loading Subscriptions" }}
                size="large"
                variant="brand"
              />
            </div>
          ) : error ? (
            <div className="slds-text-color_error slds-p-around_medium">
              Error loading subscriptions: {error.message}
            </div>
          ) : (
            <>
              <DataTable
                items={subscriptions}
                id="subscriptions-table"
                className="admin-table"
              >
                <DataTableColumn
                  key="user"
                  label="User"
                  property="user_id"
                  cell={(props) => (
                    <DataTableCell
                      title={
                        userMap[props.item.user_id]?.email || props.item.user_id
                      }
                    >
                      {userMap[props.item.user_id] ? (
                        <>
                          <div>
                            {userMap[props.item.user_id].first_name}{" "}
                            {userMap[props.item.user_id].last_name}
                          </div>
                          <div className="slds-text-body_small slds-text-color_weak">
                            {userMap[props.item.user_id].email}
                          </div>
                        </>
                      ) : (
                        props.item.user_id
                      )}
                    </DataTableCell>
                  )}
                />
                <DataTableColumn
                  key="plan_id"
                  label="Plan"
                  property="plan_id"
                />
                <DataTableColumn
                  key="status"
                  label="Status"
                  property="status"
                  width="120px"
                  cell={(props) => (
                    <DataTableCell>
                      <SubscriptionStatusBadge status={props.item.status} />
                    </DataTableCell>
                  )}
                />
                <DataTableColumn
                  key="amount"
                  label="Amount"
                  property="amount"
                  width="120px"
                  cell={(props) => (
                    <DataTableCell
                      title={formatCurrency(
                        props.item.amount,
                        props.item.currency,
                      )}
                    >
                      {formatCurrency(props.item.amount, props.item.currency)}
                    </DataTableCell>
                  )}
                />
                <DataTableColumn
                  key="payment_method"
                  label="Payment Method"
                  property="payment_method"
                  width="150px"
                />
                <DataTableColumn
                  key="start_date"
                  label="Start Date"
                  property="start_date"
                  width="120px"
                  cell={(props) => (
                    <DataTableCell title={formatDate(props.item.start_date)}>
                      {formatDate(props.item.start_date)}
                    </DataTableCell>
                  )}
                />
                <DataTableColumn
                  key="end_date"
                  label="End Date"
                  property="end_date"
                  width="120px"
                  cell={(props) => (
                    <DataTableCell title={formatDate(props.item.end_date)}>
                      {formatDate(props.item.end_date)}
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

export default SubscriptionsList;
