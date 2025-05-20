import React, { useEffect, useState } from "react";
import { Card, Icon, Spinner, Button } from "@salesforce/design-system-react";
import {
  fetchStats,
  fetchTableNames,
  type Video,
} from "../../services/supabase";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<{
    counts: { videos: number; users: number; comments: number };
    topVideos: Video[];
    error: any;
    tablesExist?: {
      videos: boolean;
      users: boolean;
      comments: boolean;
    };
  }>({
    counts: { videos: 0, users: 0, comments: 0 },
    topVideos: [],
    error: null,
    tablesExist: {
      videos: false,
      users: false,
      comments: false,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allTables, setAllTables] = useState<string[]>([]);
  const [showDbExplorer, setShowDbExplorer] = useState(false);

  useEffect(() => {
    const getStats = async () => {
      try {
        setLoading(true);

        // Fetch all tables in the database to see what's available
        const { tables, error: tablesError } = await fetchTableNames();
        if (tablesError) {
          console.error("Error fetching tables:", tablesError);
        } else {
          setAllTables(tables);
        }

        const result = await fetchStats();
        setStats(result);

        // If no tables exist that we expect, show a message
        if (
          result.tablesExist &&
          !result.tablesExist.videos &&
          !result.tablesExist.users &&
          !result.tablesExist.comments
        ) {
          setShowDbExplorer(true);
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError(
          "Failed to load dashboard statistics. Please try again later.",
        );
      } finally {
        setLoading(false);
      }
    };

    getStats();
  }, []);

  if (loading) {
    return (
      <div
        className="slds-is-relative slds-p-around_large"
        style={{ height: "400px" }}
      >
        <Spinner
          assistiveText={{ label: "Loading dashboard data" }}
          size="large"
          variant="brand"
        />
      </div>
    );
  }

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

  // If we should show database explorer guidance
  if (showDbExplorer) {
    return (
      <div className="slds-p-around_medium">
        <h1 className="slds-text-heading_large slds-m-bottom_large">
          Dashboard Overview
        </h1>

        <Card className="admin-box slds-m-bottom_large">
          <div className="slds-p-around_medium">
            <div className="slds-grid slds-grid_align-center">
              <div className="slds-col slds-size_1-of-1 slds-medium-size_3-of-4 slds-text-align_center">
                <Icon
                  category="utility"
                  name="database"
                  size="large"
                  className="slds-m-bottom_medium"
                  style={{ fill: "#b18cff", width: "3rem", height: "3rem" }}
                />
                <h2 className="slds-text-heading_medium slds-m-bottom_medium">
                  Database Schema Not Found
                </h2>
                <p className="slds-m-bottom_medium">
                  We couldn't find the expected database tables (videos, users,
                  comments) in your Supabase database. Your database contains
                  the following tables:
                </p>

                {allTables.length > 0 ? (
                  <ul className="slds-list_dotted slds-m-vertical_medium">
                    {allTables.map((table) => (
                      <li key={table} className="slds-text-color_success">
                        {table}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="slds-text-color_weak slds-m-vertical_medium">
                    No tables found in the database.
                  </p>
                )}

                <p className="slds-m-top_medium slds-m-bottom_large">
                  You can use the Database Explorer to browse your existing
                  tables or create the necessary tables to use all dashboard
                  features.
                </p>

                <Button
                  label="Go to Database Explorer"
                  variant="brand"
                  onClick={() => {
                    // Using window.dispatchEvent to communicate with the Admin component to change the active tab
                    window.dispatchEvent(
                      new CustomEvent("changeAdminTab", {
                        detail: { tab: "explore" },
                      }),
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card
          heading="Getting Started"
          icon={<Icon category="standard" name="education" size="small" />}
          className="admin-box"
        >
          <div className="slds-p-around_medium">
            <h3 className="slds-text-heading_small slds-m-bottom_medium">
              How to Create Required Tables
            </h3>
            <p className="slds-m-bottom_medium">
              To use all features of this admin dashboard, you'll need to create
              the following tables in your Supabase database:
            </p>

            <div
              className="slds-box slds-theme_shade slds-m-bottom_medium"
              style={{
                backgroundColor: "#23243a",
                border: "1px solid #3a3b4d",
              }}
            >
              <h4 className="slds-text-heading_small slds-m-bottom_small">
                videos
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

            <div
              className="slds-box slds-theme_shade slds-m-bottom_medium"
              style={{
                backgroundColor: "#23243a",
                border: "1px solid #3a3b4d",
              }}
            >
              <h4 className="slds-text-heading_small slds-m-bottom_small">
                users
              </h4>
              <pre
                style={{
                  color: "#f4f4f6",
                  overflow: "auto",
                  padding: "0.5rem",
                }}
              >
                {`CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);`}
              </pre>
            </div>

            <div
              className="slds-box slds-theme_shade slds-m-bottom_medium"
              style={{
                backgroundColor: "#23243a",
                border: "1px solid #3a3b4d",
              }}
            >
              <h4 className="slds-text-heading_small slds-m-bottom_small">
                comments
              </h4>
              <pre
                style={{
                  color: "#f4f4f6",
                  overflow: "auto",
                  padding: "0.5rem",
                }}
              >
                {`CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  video_id UUID REFERENCES videos(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);`}
              </pre>
            </div>

            <div
              className="slds-box slds-theme_shade slds-m-bottom_medium"
              style={{
                backgroundColor: "#23243a",
                border: "1px solid #3a3b4d",
              }}
            >
              <h4 className="slds-text-heading_small slds-m-bottom_small">
                categories
              </h4>
              <pre
                style={{
                  color: "#f4f4f6",
                  overflow: "auto",
                  padding: "0.5rem",
                }}
              >
                {`CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT
);`}
              </pre>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="slds-p-around_medium">
      <h1 className="slds-text-heading_large slds-m-bottom_large">
        Dashboard Overview
      </h1>

      {/* Key Metrics */}
      <div className="slds-grid slds-gutters slds-wrap slds-m-bottom_large">
        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-3 slds-p-around_x-small">
          <Card
            heading="Total Videos"
            icon={<Icon category="standard" name="video" size="small" />}
            className="admin-box"
            style={{ height: "150px" }}
            footer={
              !stats.tablesExist?.videos && (
                <div className="slds-text-color_weak slds-text-align_center">
                  Table not found
                </div>
              )
            }
          >
            <div className="slds-text-align_center slds-p-around_medium">
              {stats.tablesExist?.videos ? (
                <span
                  className="slds-text-heading_large"
                  style={{ color: "#b18cff", fontWeight: "bold" }}
                >
                  {stats.counts.videos.toLocaleString()}
                </span>
              ) : (
                <Icon
                  category="utility"
                  name="error"
                  size="small"
                  className="slds-m-right_x-small"
                  style={{ fill: "#ffb75d" }}
                />
              )}
            </div>
          </Card>
        </div>

        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-3 slds-p-around_x-small">
          <Card
            heading="Total Users"
            icon={<Icon category="standard" name="user" size="small" />}
            className="admin-box"
            style={{ height: "150px" }}
            footer={
              !stats.tablesExist?.users && (
                <div className="slds-text-color_weak slds-text-align_center">
                  Table not found
                </div>
              )
            }
          >
            <div className="slds-text-align_center slds-p-around_medium">
              {stats.tablesExist?.users ? (
                <span
                  className="slds-text-heading_large"
                  style={{ color: "#b18cff", fontWeight: "bold" }}
                >
                  {stats.counts.users.toLocaleString()}
                </span>
              ) : (
                <Icon
                  category="utility"
                  name="error"
                  size="small"
                  className="slds-m-right_x-small"
                  style={{ fill: "#ffb75d" }}
                />
              )}
            </div>
          </Card>
        </div>

        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-3 slds-p-around_x-small">
          <Card
            heading="Total Comments"
            icon={<Icon category="standard" name="comments" size="small" />}
            className="admin-box"
            style={{ height: "150px" }}
            footer={
              !stats.tablesExist?.comments && (
                <div className="slds-text-color_weak slds-text-align_center">
                  Table not found
                </div>
              )
            }
          >
            <div className="slds-text-align_center slds-p-around_medium">
              {stats.tablesExist?.comments ? (
                <span
                  className="slds-text-heading_large"
                  style={{ color: "#b18cff", fontWeight: "bold" }}
                >
                  {stats.counts.comments.toLocaleString()}
                </span>
              ) : (
                <Icon
                  category="utility"
                  name="error"
                  size="small"
                  className="slds-m-right_x-small"
                  style={{ fill: "#ffb75d" }}
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Top Videos */}
      <Card
        heading="Top Videos"
        icon={<Icon category="standard" name="video" size="small" />}
        className="admin-box slds-m-bottom_large"
        footer={
          !stats.tablesExist?.videos && (
            <div className="slds-text-color_weak slds-text-align_center">
              Videos table not found
            </div>
          )
        }
      >
        <div className="slds-p-around_medium">
          {stats.tablesExist?.videos ? (
            stats.topVideos.length > 0 ? (
              <table className="slds-table slds-table_cell-buffer slds-table_bordered">
                <thead>
                  <tr className="slds-line-height_reset">
                    <th scope="col">
                      <div className="slds-truncate" title="Title">
                        Title
                      </div>
                    </th>
                    <th scope="col">
                      <div className="slds-truncate" title="Views">
                        Views
                      </div>
                    </th>
                    <th scope="col">
                      <div className="slds-truncate" title="Duration">
                        Duration
                      </div>
                    </th>
                    <th scope="col">
                      <div className="slds-truncate" title="Created">
                        Created
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topVideos.map((video) => (
                    <tr key={video.id}>
                      <td>
                        <div className="slds-truncate" title={video.title}>
                          {video.title || "Untitled"}
                        </div>
                      </td>
                      <td>
                        <div className="slds-truncate" title={`${video.views}`}>
                          {video.views?.toLocaleString() || 0}
                        </div>
                      </td>
                      <td>
                        <div
                          className="slds-truncate"
                          title={`${video.duration}`}
                        >
                          {video.duration
                            ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, "0")}`
                            : "N/A"}
                        </div>
                      </td>
                      <td>
                        <div className="slds-truncate" title={video.created_at}>
                          {video.created_at
                            ? new Date(video.created_at).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="slds-text-align_center slds-p-around_medium slds-text-color_weak">
                No videos found.
              </div>
            )
          ) : (
            <div className="slds-text-align_center slds-p-around_medium">
              <Icon
                category="utility"
                name="error"
                size="small"
                className="slds-m-right_x-small"
                style={{ fill: "#ffb75d" }}
              />
              <span className="slds-text-color_weak">
                Videos table not found in database
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Recent Activity - Placeholder */}
      <Card
        heading="Recent Activity"
        icon={<Icon category="standard" name="event" size="small" />}
        className="admin-box"
      >
        <div className="slds-p-around_medium">
          <div className="slds-timeline">
            <ul>
              <li>
                <div className="slds-timeline__item_expandable">
                  <div className="slds-media">
                    <div className="slds-media__figure">
                      <div className="slds-icon_container slds-icon-standard-event">
                        <Icon
                          category="standard"
                          name="user"
                          size="small"
                          className="slds-icon"
                        />
                      </div>
                    </div>
                    <div className="slds-media__body">
                      <div className="slds-grid slds-grid_align-spread">
                        <p
                          className="slds-text-heading_small"
                          style={{ color: "#f4f4f6" }}
                        >
                          New user registered
                        </p>
                        <p className="slds-timeline__date">Today</p>
                      </div>
                      <p
                        className="slds-m-top_x-small"
                        style={{ color: "#b18cff" }}
                      >
                        User ID: 12345
                      </p>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="slds-timeline__item_expandable">
                  <div className="slds-media">
                    <div className="slds-media__figure">
                      <div className="slds-icon_container slds-icon-standard-event">
                        <Icon
                          category="standard"
                          name="video"
                          size="small"
                          className="slds-icon"
                        />
                      </div>
                    </div>
                    <div className="slds-media__body">
                      <div className="slds-grid slds-grid_align-spread">
                        <p
                          className="slds-text-heading_small"
                          style={{ color: "#f4f4f6" }}
                        >
                          New video uploaded
                        </p>
                        <p className="slds-timeline__date">Yesterday</p>
                      </div>
                      <p
                        className="slds-m-top_x-small"
                        style={{ color: "#b18cff" }}
                      >
                        Video ID: 7890
                      </p>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="slds-timeline__item_expandable">
                  <div className="slds-media">
                    <div className="slds-media__figure">
                      <div className="slds-icon_container slds-icon-standard-event">
                        <Icon
                          category="standard"
                          name="comments"
                          size="small"
                          className="slds-icon"
                        />
                      </div>
                    </div>
                    <div className="slds-media__body">
                      <div className="slds-grid slds-grid_align-spread">
                        <p
                          className="slds-text-heading_small"
                          style={{ color: "#f4f4f6" }}
                        >
                          New comment posted
                        </p>
                        <p className="slds-timeline__date">2 days ago</p>
                      </div>
                      <p
                        className="slds-m-top_x-small"
                        style={{ color: "#b18cff" }}
                      >
                        Comment ID: 3456
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
