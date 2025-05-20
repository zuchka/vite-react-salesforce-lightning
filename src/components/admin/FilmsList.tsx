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
import { fetchFilms, type Film } from "../../services/supabase";

const FilmsList: React.FC = () => {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableExists, setTableExists] = useState(true);
  const pageSize = 25;

  const loadFilms = async (currentPage: number) => {
    try {
      setLoading(true);
      const {
        data,
        error,
        count,
        hasMore,
        tableExists: exists,
      } = await fetchFilms(currentPage, pageSize);

      setTableExists(exists);

      if (!exists) {
        setError("The film table does not exist in the database.");
        return;
      }

      if (error) {
        throw new Error(error.message);
      }

      setFilms(data);
      setTotalCount(count);
      setHasMore(hasMore);
    } catch (err) {
      console.error("Error loading films:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load films. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilms(page);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    loadFilms(1);
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

  // Define the columns for the data table
  const columns: DataTableColumn[] = [
    {
      label: "Title",
      property: "title",
      truncate: true,
    },
    {
      label: "Description",
      property: "description",
      truncate: true,
    },
    {
      label: "Release Year",
      property: "release_year",
      sortable: true,
    },
    {
      label: "Rating",
      property: "rating",
      sortable: true,
    },
    {
      label: "Rental Rate",
      property: "rental_rate",
      sortable: true,
      cell: (item: Film) => (
        <DataTableCell title={`$${item.rental_rate?.toFixed(2) || "0.00"}`}>
          ${item.rental_rate?.toFixed(2) || "0.00"}
        </DataTableCell>
      ),
    },
    {
      label: "Length",
      property: "length",
      sortable: true,
      cell: (item: Film) => (
        <DataTableCell title={`${item.length || "N/A"} min`}>
          {item.length || "N/A"} min
        </DataTableCell>
      ),
    },
    {
      label: "Actions",
      property: "actions",
      cell: (item: Film) => (
        <DataTableCell>
          <ButtonGroup variant="list" id={`actions-${item.film_id}`}>
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
        <h1 className="slds-text-heading_large slds-m-bottom_large">Films</h1>

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
              Film Table Not Found
            </h2>
            <p className="slds-m-bottom_large">
              The film table doesn't exist in your Supabase database.
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
        <h1 className="slds-text-heading_large slds-m-bottom_large">Films</h1>

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
                loadFilms(1);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="slds-p-around_medium">
      <h1 className="slds-text-heading_large slds-m-bottom_large">Films</h1>

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
                    id="search-films"
                    placeholder="Search films..."
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
                        loadFilms(1);
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
                  assistiveText={{ label: "Loading films" }}
                  size="large"
                  variant="brand"
                />
              </div>
            ) : (
              <>
                <DataTable
                  items={films}
                  columns={columns}
                  id="films-table"
                  noRowHover={false}
                  className="slds-table_striped"
                  fixedLayout
                />

                <div className="slds-grid slds-grid_align-spread slds-m-top_medium">
                  <div>
                    <p className="slds-text-color_weak">
                      Showing {films.length > 0 ? (page - 1) * pageSize + 1 : 0}{" "}
                      to {(page - 1) * pageSize + films.length} of {totalCount}{" "}
                      films
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

export default FilmsList;
