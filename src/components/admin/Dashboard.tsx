import React, { useEffect, useState } from "react";
import { Card, Icon, Spinner } from "@salesforce/design-system-react";
import { fetchStats, type Video } from "../../services/supabase";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<{
    counts: { videos: number; users: number; comments: number };
    topVideos: Video[];
    error: any;
  }>({
    counts: { videos: 0, users: 0, comments: 0 },
    topVideos: [],
    error: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getStats = async () => {
      try {
        setLoading(true);
        const result = await fetchStats();
        setStats(result);
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
          >
            <div className="slds-text-align_center slds-p-around_medium">
              <span
                className="slds-text-heading_large"
                style={{ color: "#b18cff", fontWeight: "bold" }}
              >
                {stats.counts.videos.toLocaleString()}
              </span>
            </div>
          </Card>
        </div>

        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-3 slds-p-around_x-small">
          <Card
            heading="Total Users"
            icon={<Icon category="standard" name="user" size="small" />}
            className="admin-box"
            style={{ height: "150px" }}
          >
            <div className="slds-text-align_center slds-p-around_medium">
              <span
                className="slds-text-heading_large"
                style={{ color: "#b18cff", fontWeight: "bold" }}
              >
                {stats.counts.users.toLocaleString()}
              </span>
            </div>
          </Card>
        </div>

        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-3 slds-p-around_x-small">
          <Card
            heading="Total Comments"
            icon={<Icon category="standard" name="comments" size="small" />}
            className="admin-box"
            style={{ height: "150px" }}
          >
            <div className="slds-text-align_center slds-p-around_medium">
              <span
                className="slds-text-heading_large"
                style={{ color: "#b18cff", fontWeight: "bold" }}
              >
                {stats.counts.comments.toLocaleString()}
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Top Videos */}
      <Card
        heading="Top Videos"
        icon={<Icon category="standard" name="video" size="small" />}
        className="admin-box slds-m-bottom_large"
      >
        <div className="slds-p-around_medium">
          {stats.topVideos.length > 0 ? (
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
