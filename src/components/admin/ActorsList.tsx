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
import { fetchActors, type Actor } from "../../services/supabase";

const ActorsList: React.FC = () => {
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableExists, setTableExists] = useState(true);
  const pageSize = 25;

  const loadActors = async (currentPage: number) => {
    try {
      setLoading(true);
      const {
        data,
        error,
        count,
        hasMore,
        tableExists: exists,
      } = await fetchActors(currentPage, pageSize);

      setTableExists(exists);

      if (!exists) {
        setError("The actor table does not exist in the database.");
        return;
      }

      if (error) {
        throw new Error(error.message);
      }

      setActors(data);
      setTotalCount(count);
      setHasMore(hasMore);
    } catch (err) {
      console.error("Error loading actors:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load actors. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActors(page);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    loadActors(1);
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
      label: "Actor ID",
      property: "actor_id",
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
      label: "Last Update",
      property: "last_update",
      sortable: true,
      cell: (item: Actor) => (
        <DataTableCell title={formatDate(item.last_update)}>
          {formatDate(item.last_update)}
        </DataTableCell>
      ),
    },
    {
      label: "Actions",
      property: "actions",
      cell: (item: Actor) => (
        <DataTableCell>
          <ButtonGroup variant="list" id={`actions-${item.actor_id}`}>
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
        <h1 className="slds-text-heading_large slds-m-bottom_large">Actors</h1>

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
              Actor Table Not Found
            </h2>
            <p className="slds-m-bottom_large">
              The actor table doesn't exist in your Supabase database.
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
        <h1 className="slds-text-heading_large slds-m-bottom_large">Actors</h1>

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
                loadActors(1);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="slds-p-around_medium">
      <h1 className="slds-text-heading_large slds-m-bottom_large">Actors</h1>

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
                    id="search-actors"
                    placeholder="Search actors..."
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
                        loadActors(1);
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
                  assistiveText={{ label: "Loading actors" }}
                  size="large"
                  variant="brand"
                />
              </div>
            ) : (
              <>
                <DataTable
                  items={actors}
                  columns={columns}
                  id="actors-table"
                  noRowHover={false}
                  className="slds-table_striped"
                  fixedLayout
                />

                <div className="slds-grid slds-grid_align-spread slds-m-top_medium">
                  <div>
                    <p className="slds-text-color_weak">
                      Showing{" "}
                      {actors.length > 0 ? (page - 1) * pageSize + 1 : 0} to{" "}
                      {(page - 1) * pageSize + actors.length} of {totalCount}{" "}
                      actors
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

export default ActorsList;
