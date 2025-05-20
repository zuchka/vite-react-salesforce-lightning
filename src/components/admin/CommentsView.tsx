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
import { fetchComments, type Comment } from "../../services/supabase";

const CommentsView: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const pageSize = 25;

  const loadComments = async (currentPage: number) => {
    try {
      setLoading(true);
      const { data, error, count, hasMore } = await fetchComments(
        currentPage,
        pageSize,
      );

      if (error) {
        throw new Error(error.message);
      }

      setComments(data);
      setTotalCount(count);
      setHasMore(hasMore);
    } catch (err) {
      console.error("Error loading comments:", err);
      setError("Failed to load comments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments(page);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    loadComments(1);
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
      label: "Content",
      property: "content",
      truncate: true,
    },
    {
      label: "User ID",
      property: "user_id",
      truncate: true,
    },
    {
      label: "Video ID",
      property: "video_id",
      truncate: true,
    },
    {
      label: "Created",
      property: "created_at",
      sortable: true,
      cell: (item: Comment) => (
        <DataTableCell title={formatDate(item.created_at)}>
          {formatDate(item.created_at)}
        </DataTableCell>
      ),
    },
    {
      label: "Actions",
      property: "actions",
      cell: (item: Comment) => (
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
      <h1 className="slds-text-heading_large slds-m-bottom_large">Comments</h1>

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
                    id="search-comments"
                    placeholder="Search comments..."
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
                        loadComments(1);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div>
              <Button
                label="Add Comment"
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
                  assistiveText={{ label: "Loading comments" }}
                  size="large"
                  variant="brand"
                />
              </div>
            ) : (
              <>
                <DataTable
                  items={comments}
                  columns={columns}
                  id="comments-table"
                  noRowHover={false}
                  className="slds-table_striped"
                  fixedLayout
                />

                <div className="slds-grid slds-grid_align-spread slds-m-top_medium">
                  <div>
                    <p className="slds-text-color_weak">
                      Showing{" "}
                      {comments.length > 0 ? (page - 1) * pageSize + 1 : 0} to{" "}
                      {(page - 1) * pageSize + comments.length} of {totalCount}{" "}
                      comments
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

export default CommentsView;
