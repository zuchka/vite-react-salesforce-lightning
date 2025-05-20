import React, { useState } from "react";
import { useTableData } from "../../hooks/useTableData";
import { Tables, Video } from "../../types/database";
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

const VideosList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const {
    data: videos,
    count,
    loading,
    error,
    page,
    nextPage,
    prevPage,
    refreshData,
    setPage,
  } = useTableData<Video>({
    tableName: Tables.VIDEOS,
    orderBy: { column: "created_at", ascending: false },
    filterColumn: isSearching ? "title" : undefined,
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

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds: number) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Video status badge
  const VideoStatusBadge = ({ status }: { status: string }) => {
    let variant = "default";

    switch (status) {
      case "published":
        variant = "success";
        break;
      case "draft":
        variant = "warning";
        break;
      case "archived":
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
    <div className="videos-list">
      <PageHeader
        icon={<Icon category="standard" name="video" />}
        title="Videos Management"
        info={`${count} videos total`}
        className="admin-page-header"
      />

      <Card className="admin-box slds-m-around_small">
        <div className="slds-p-around_medium">
          <div className="slds-grid slds-gutters slds-m-bottom_medium">
            <div className="slds-col slds-size_3-of-4">
              <Input
                id="video-search"
                placeholder="Search videos by title..."
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
                assistiveText={{ label: "Loading Videos" }}
                size="large"
                variant="brand"
              />
            </div>
          ) : error ? (
            <div className="slds-text-color_error slds-p-around_medium">
              Error loading videos: {error.message}
            </div>
          ) : (
            <>
              <DataTable
                items={videos}
                id="videos-table"
                className="admin-table"
              >
                <DataTableColumn
                  key="thumbnail"
                  label="Thumbnail"
                  property="thumbnail_url"
                  width="80px"
                  cell={(props) => (
                    <DataTableCell>
                      <div className="thumbnail-container">
                        {props.item.thumbnail_url ? (
                          <img
                            src={props.item.thumbnail_url}
                            alt={props.item.title}
                            className="video-thumbnail"
                          />
                        ) : (
                          <div className="video-thumbnail-placeholder">
                            <Icon
                              category="utility"
                              name="video"
                              size="small"
                            />
                          </div>
                        )}
                      </div>
                    </DataTableCell>
                  )}
                />
                <DataTableColumn key="title" label="Title" property="title" />
                <DataTableColumn
                  key="duration"
                  label="Duration"
                  property="duration"
                  width="100px"
                  cell={(props) => (
                    <DataTableCell title={formatDuration(props.item.duration)}>
                      {formatDuration(props.item.duration)}
                    </DataTableCell>
                  )}
                />
                <DataTableColumn
                  key="views"
                  label="Views"
                  property="views"
                  width="100px"
                />
                <DataTableColumn
                  key="status"
                  label="Status"
                  property="status"
                  width="120px"
                  cell={(props) => (
                    <DataTableCell>
                      <VideoStatusBadge status={props.item.status} />
                    </DataTableCell>
                  )}
                />
                <DataTableColumn
                  key="created_at"
                  label="Created"
                  property="created_at"
                  width="120px"
                  cell={(props) => (
                    <DataTableCell title={formatDate(props.item.created_at)}>
                      {formatDate(props.item.created_at)}
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

export default VideosList;
