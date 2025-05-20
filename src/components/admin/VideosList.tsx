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
import { fetchVideos, type Video } from "../../services/supabase";

const VideosList: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableExists, setTableExists] = useState(true);
  const pageSize = 25;

  const loadVideos = async (currentPage: number) => {
    try {
      setLoading(true);
      const {
        data,
        error,
        count,
        hasMore,
        tableExists: exists,
      } = await fetchVideos(currentPage, pageSize);

      setTableExists(exists);

      if (!exists) {
        setError("The videos table does not exist in the database.");
        return;
      }

      if (error) {
        throw new Error(error.message);
      }

      setVideos(data);
      setTotalCount(count);
      setHasMore(hasMore);
    } catch (err) {
      console.error("Error loading videos:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load videos. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos(page);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    loadVideos(1);
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

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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
      label: "Views",
      property: "views",
      sortable: true,
    },
    {
      label: "Duration",
      property: "duration",
      sortable: true,
      cell: (item: Video) => (
        <DataTableCell
          title={item.duration ? formatDuration(item.duration) : "N/A"}
        >
          {item.duration ? formatDuration(item.duration) : "N/A"}
        </DataTableCell>
      ),
    },
    {
      label: "Created",
      property: "created_at",
      sortable: true,
      cell: (item: Video) => (
        <DataTableCell title={formatDate(item.created_at)}>
          {formatDate(item.created_at)}
        </DataTableCell>
      ),
    },
    {
      label: "Actions",
      property: "actions",
      cell: (item: Video) => (
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

  if (!tableExists) {
    return (
      <div className="slds-p-around_medium">
        <h1 className="slds-text-heading_large slds-m-bottom_large">Videos</h1>

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
              Videos Table Not Found
            </h2>
            <p className="slds-m-bottom_large">
              The videos table doesn't exist in your Supabase database. You need
              to create this table to manage videos.
            </p>
            <div
              className="slds-box slds-theme_shade slds-m-bottom_medium"
              style={{
                backgroundColor: "#23243a",
                border: "1px solid #3a3b4d",
                textAlign: "left",
              }}
            >
              <h4 className="slds-text-heading_small slds-m-bottom_small">
                Create Videos Table
              </h4>
              <pre
                style={{
                  color: "#f4f4f6",
                  overflow: "auto",
                  padding: "0.5rem",
                }}
              >
                {`CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  thumbnail_url TEXT,
  duration INTEGER,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  category_id UUID,
  user_id UUID
);`}
              </pre>
            </div>
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
        <h1 className="slds-text-heading_large slds-m-bottom_large">Videos</h1>

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
                loadVideos(1);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="slds-p-around_medium">
      <h1 className="slds-text-heading_large slds-m-bottom_large">Videos</h1>

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
                    id="search-videos"
                    placeholder="Search videos..."
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
                        loadVideos(1);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div>
              <Button
                label="Add Video"
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
                  assistiveText={{ label: "Loading videos" }}
                  size="large"
                  variant="brand"
                />
              </div>
            ) : (
              <>
                <DataTable
                  items={videos}
                  columns={columns}
                  id="videos-table"
                  noRowHover={false}
                  className="slds-table_striped"
                  fixedLayout
                />

                <div className="slds-grid slds-grid_align-spread slds-m-top_medium">
                  <div>
                    <p className="slds-text-color_weak">
                      Showing{" "}
                      {videos.length > 0 ? (page - 1) * pageSize + 1 : 0} to{" "}
                      {(page - 1) * pageSize + videos.length} of {totalCount}{" "}
                      videos
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

export default VideosList;
