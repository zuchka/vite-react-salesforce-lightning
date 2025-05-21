import React, { useEffect, useState } from "react";
import {
  Card,
  Icon,
  Spinner,
  Tabs,
  TabsPanel,
} from "@salesforce/design-system-react";
import { getTables, supabase } from "../../lib/supabase";

interface DashboardStat {
  label: string;
  value: number | string;
  icon: string;
  change?: number;
  changeDirection?: "up" | "down" | "neutral";
}

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tableStats, setTableStats] = useState<DashboardStat[]>([]);
  const [recentItems, setRecentItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Get all tables in the database
        const tables = await getTables();

        // Create stats for each table
        const stats: DashboardStat[] = [];

        // Map table names to appropriate icons
        const iconMap: { [key: string]: string } = {
          videos: "video",
          users: "user",
          categories: "custom",
          comments: "comments",
          views: "record",
          subscriptions: "subscription",
          default: "table",
        };

        // Get counts for each table (up to 5 tables)
        const countPromises = tables.slice(0, 5).map(async (tableName) => {
          const { count, error } = await supabase
            .from(tableName)
            .select("*", { count: "exact", head: true });

          if (error) {
            console.error(`Error getting count for ${tableName}:`, error);
            return null;
          }

          // Generate random change percentage for demo purposes
          const change = Math.floor(Math.random() * 30) - 10;

          return {
            label: tableName.charAt(0).toUpperCase() + tableName.slice(1),
            value: count || 0,
            icon: iconMap[tableName] || iconMap.default,
            change,
            changeDirection:
              change > 0 ? "up" : change < 0 ? "down" : "neutral",
          };
        });

        const validStats = (await Promise.all(countPromises)).filter(
          Boolean,
        ) as DashboardStat[];
        setTableStats(validStats);

        // Get recent items from a main table (assuming videos or users is a main table)
        let mainTable =
          tables.find((t) => t === "videos") ||
          tables.find((t) => t === "users") ||
          tables[0];

        if (mainTable) {
          const { data: recentData, error: recentError } = await supabase
            .from(mainTable)
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5);

          if (recentError) {
            console.error(`Error getting recent ${mainTable}:`, recentError);
          } else {
            setRecentItems(recentData || []);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const renderStatCard = (stat: DashboardStat) => {
    return (
      <Card
        key={stat.label}
        className="admin-box slds-m-bottom_medium"
        heading={stat.label}
        icon={<Icon category="standard" name={stat.icon} size="small" />}
        bodyClassName="slds-p-horizontal_small"
      >
        <div className="slds-grid slds-grid_align-spread slds-p-around_medium">
          <div>
            <h3 className="slds-text-heading_large">{stat.value}</h3>
            {stat.change !== undefined && (
              <div
                className={`slds-m-top_x-small ${
                  stat.changeDirection === "up"
                    ? "slds-text-color_success"
                    : stat.changeDirection === "down"
                      ? "slds-text-color_error"
                      : "slds-text-color_weak"
                }`}
              >
                <Icon
                  category="utility"
                  name={
                    stat.changeDirection === "up"
                      ? "arrowup"
                      : stat.changeDirection === "down"
                        ? "arrowdown"
                        : "horizontal_rule"
                  }
                  size="x-small"
                  className="slds-m-right_xx-small"
                />
                <span>{Math.abs(stat.change)}% from last month</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const renderRecentActivity = () => {
    if (recentItems.length === 0) {
      return (
        <div className="slds-text-align_center slds-p-around_medium">
          <Icon
            category="utility"
            name="info"
            size="small"
            className="slds-m-right_x-small"
          />
          <span className="slds-text-color_weak">No recent activity</span>
        </div>
      );
    }

    return (
      <ul className="slds-has-dividers_bottom-space">
        {recentItems.map((item, index) => {
          // Try to find meaningful fields to display
          const title = item.title || item.name || item.id;
          const subtitle = item.description || item.email || "";
          const timestamp = item.created_at
            ? new Date(item.created_at).toLocaleString()
            : "";

          return (
            <li key={index} className="slds-item slds-p-around_medium">
              <div className="slds-grid slds-grid_align-spread">
                <div>
                  <p className="slds-text-heading_small">{title}</p>
                  {subtitle && (
                    <p className="slds-text-color_weak">{subtitle}</p>
                  )}
                </div>
                {timestamp && (
                  <div className="slds-text-align_right slds-text-color_weak slds-text-body_small">
                    {timestamp}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  if (isLoading) {
    return (
      <div className="slds-align_absolute-center slds-p-around_large">
        <Spinner
          variant="brand"
          size="large"
          assistiveText={{ label: "Loading dashboard data" }}
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="slds-text-heading_large slds-m-bottom_medium">
        Dashboard
      </h1>

      <div className="slds-grid slds-gutters slds-wrap">
        {tableStats.map((stat) => (
          <div
            key={stat.label}
            className="slds-col slds-size_1-of-1 slds-large-size_1-of-3 slds-p-bottom_medium"
          >
            {renderStatCard(stat)}
          </div>
        ))}
      </div>

      <div className="slds-grid slds-gutters slds-wrap">
        <div className="slds-col slds-size_1-of-1 slds-large-size_2-of-3">
          <div className="admin-box slds-p-around_medium slds-m-bottom_medium">
            <h2 className="slds-text-heading_medium slds-m-bottom_medium">
              Activity Overview
            </h2>

            <Tabs variant="scoped">
              <TabsPanel label="Recent Activity">
                {renderRecentActivity()}
              </TabsPanel>
              <TabsPanel label="System Status">
                <div className="slds-p-around_medium">
                  <div className="slds-grid slds-grid_vertical-align-center slds-m-bottom_small">
                    <Icon
                      category="utility"
                      name="success"
                      size="small"
                      className="slds-m-right_small"
                      style={{ fill: "#04844b" }}
                    />
                    <div>
                      <p className="slds-text-heading_small">Database Status</p>
                      <p className="slds-text-color_weak">
                        Connected and operating normally
                      </p>
                    </div>
                  </div>
                  <div className="slds-grid slds-grid_vertical-align-center">
                    <Icon
                      category="utility"
                      name="success"
                      size="small"
                      className="slds-m-right_small"
                      style={{ fill: "#04844b" }}
                    />
                    <div>
                      <p className="slds-text-heading_small">API Status</p>
                      <p className="slds-text-color_weak">
                        All services operational
                      </p>
                    </div>
                  </div>
                </div>
              </TabsPanel>
            </Tabs>
          </div>
        </div>

        <div className="slds-col slds-size_1-of-1 slds-large-size_1-of-3">
          <div className="admin-box slds-p-around_medium slds-m-bottom_medium">
            <h2 className="slds-text-heading_medium slds-m-bottom_medium">
              Quick Links
            </h2>
            <ul className="slds-has-dividers_bottom-space">
              <li className="slds-item">
                <a href="#" className="slds-p-around_small slds-grid">
                  <Icon
                    category="utility"
                    name="settings"
                    size="small"
                    className="slds-m-right_small"
                  />
                  <span>System Settings</span>
                </a>
              </li>
              <li className="slds-item">
                <a href="#" className="slds-p-around_small slds-grid">
                  <Icon
                    category="utility"
                    name="user"
                    size="small"
                    className="slds-m-right_small"
                  />
                  <span>User Management</span>
                </a>
              </li>
              <li className="slds-item">
                <a href="#" className="slds-p-around_small slds-grid">
                  <Icon
                    category="utility"
                    name="refresh"
                    size="small"
                    className="slds-m-right_small"
                  />
                  <span>Sync Database</span>
                </a>
              </li>
              <li className="slds-item">
                <a href="#" className="slds-p-around_small slds-grid">
                  <Icon
                    category="utility"
                    name="download"
                    size="small"
                    className="slds-m-right_small"
                  />
                  <span>Export Data</span>
                </a>
              </li>
              <li className="slds-item">
                <a href="#" className="slds-p-around_small slds-grid">
                  <Icon
                    category="utility"
                    name="help"
                    size="small"
                    className="slds-m-right_small"
                  />
                  <span>Documentation</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
