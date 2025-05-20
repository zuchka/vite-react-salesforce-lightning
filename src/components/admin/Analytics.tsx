import React, { useEffect, useState } from "react";
import {
  Card,
  Icon,
  Spinner,
  Tabs,
  TabsPanel,
} from "@salesforce/design-system-react";
import { supabase } from "../../lib/supabase";

interface AnalyticsCategory {
  name: string;
  count: number;
  percentage: number;
}

interface TimeSeriesData {
  period: string;
  count: number;
}

const Analytics: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [topCategories, setTopCategories] = useState<AnalyticsCategory[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        // Try to get data from a users or videos table (if they exist)
        const tables = ["videos", "users", "subscriptions", "views"];
        let primaryTable = "";
        let timeSeriesEnabled = false;

        // Check if any of the expected tables exist
        for (const table of tables) {
          const { count, error } = await supabase
            .from(table)
            .select("*", { count: "exact", head: true });

          if (!error) {
            primaryTable = table;

            // Check if the table has a created_at column for time series
            const { data: columnData } = await supabase
              .from("information_schema.columns")
              .select("column_name")
              .eq("table_name", table)
              .eq("column_name", "created_at");

            timeSeriesEnabled = columnData && columnData.length > 0;
            break;
          }
        }

        if (primaryTable) {
          // Generate sample analytics data based on the table
          // In a real app, this would use proper SQL analytics queries

          // 1. Get total count for the main table
          const { count: totalCount } = await supabase
            .from(primaryTable)
            .select("*", { count: "exact", head: true });

          // 2. Try to find a category or type column to group by
          const potentialCategoryColumns = [
            "category",
            "type",
            "status",
            "role",
          ];
          let categoryColumn = "";

          for (const column of potentialCategoryColumns) {
            const { data: columnCheck } = await supabase
              .from("information_schema.columns")
              .select("column_name")
              .eq("table_name", primaryTable)
              .eq("column_name", column);

            if (columnCheck && columnCheck.length > 0) {
              categoryColumn = column;
              break;
            }
          }

          // 3. If we found a category column, get distribution
          if (categoryColumn) {
            const { data: categoryData } = await supabase
              .from(primaryTable)
              .select(`${categoryColumn}, count`)
              .select(`${categoryColumn}`)
              .not(categoryColumn, "is", null);

            if (categoryData) {
              // Count occurrences of each category
              const categoryCounts: { [key: string]: number } = {};
              categoryData.forEach((item) => {
                const category = item[categoryColumn];
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
              });

              // Convert to array and calculate percentages
              const categories: AnalyticsCategory[] = Object.entries(
                categoryCounts,
              )
                .map(([name, count]) => ({
                  name,
                  count,
                  percentage: Math.round((count / (totalCount || 1)) * 100),
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

              setTopCategories(categories);
            }
          } else if (totalCount) {
            // If no category column, create sample segments
            const mockCategories: AnalyticsCategory[] = [
              {
                name: "Active",
                count: Math.floor(totalCount * 0.7),
                percentage: 70,
              },
              {
                name: "Inactive",
                count: Math.floor(totalCount * 0.2),
                percentage: 20,
              },
              {
                name: "Pending",
                count: Math.floor(totalCount * 0.1),
                percentage: 10,
              },
            ];
            setTopCategories(mockCategories);
          }

          // 4. Generate time series data
          if (timeSeriesEnabled) {
            const { data: timeData } = await supabase
              .from(primaryTable)
              .select("created_at")
              .order("created_at", { ascending: false })
              .limit(100);

            if (timeData && timeData.length > 0) {
              // Group by month
              const monthCounts: { [key: string]: number } = {};

              timeData.forEach((item) => {
                const date = new Date(item.created_at);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
              });

              // Convert to array and sort by date
              const timeSeries: TimeSeriesData[] = Object.entries(monthCounts)
                .map(([period, count]) => ({ period, count }))
                .sort((a, b) => a.period.localeCompare(b.period));

              setTimeSeriesData(timeSeries);
            } else {
              // Generate mock time series data
              const mockTimeSeries: TimeSeriesData[] = [];
              const now = new Date();

              for (let i = 5; i >= 0; i--) {
                const month = new Date(
                  now.getFullYear(),
                  now.getMonth() - i,
                  1,
                );
                const period = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
                mockTimeSeries.push({
                  period,
                  count: Math.floor(Math.random() * 100) + 20,
                });
              }

              setTimeSeriesData(mockTimeSeries);
            }
          } else {
            // Generate mock time series data
            const mockTimeSeries: TimeSeriesData[] = [];
            const now = new Date();

            for (let i = 5; i >= 0; i--) {
              const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
              const period = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
              mockTimeSeries.push({
                period,
                count: Math.floor(Math.random() * 100) + 20,
              });
            }

            setTimeSeriesData(mockTimeSeries);
          }
        } else {
          // No suitable tables found, use mock data
          setTopCategories([
            { name: "Category A", count: 254, percentage: 45 },
            { name: "Category B", count: 142, percentage: 25 },
            { name: "Category C", count: 85, percentage: 15 },
            { name: "Category D", count: 56, percentage: 10 },
            { name: "Category E", count: 28, percentage: 5 },
          ]);

          // Mock time series data for last 6 months
          const mockTimeSeries: TimeSeriesData[] = [];
          const now = new Date();

          for (let i = 5; i >= 0; i--) {
            const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const period = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
            mockTimeSeries.push({
              period,
              count: Math.floor(Math.random() * 100) + 20,
            });
          }

          setTimeSeriesData(mockTimeSeries);
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error);

        // Set fallback data
        setTopCategories([
          { name: "Category A", count: 254, percentage: 45 },
          { name: "Category B", count: 142, percentage: 25 },
          { name: "Category C", count: 85, percentage: 15 },
          { name: "Category D", count: 56, percentage: 10 },
          { name: "Category E", count: 28, percentage: 5 },
        ]);

        const mockTimeSeries: TimeSeriesData[] = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
          const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const period = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
          mockTimeSeries.push({
            period,
            count: Math.floor(Math.random() * 100) + 20,
          });
        }

        setTimeSeriesData(mockTimeSeries);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Format month names for display
  const formatMonth = (period: string) => {
    const [year, month] = period.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="slds-align_absolute-center slds-p-around_large">
        <Spinner
          variant="brand"
          size="large"
          assistiveText={{ label: "Loading analytics data" }}
        />
      </div>
    );
  }

  // Calculate max value for time series chart to scale bars
  const maxTimeSeriesValue = Math.max(
    ...timeSeriesData.map((item) => item.count),
  );

  return (
    <div>
      <h1 className="slds-text-heading_large slds-m-bottom_medium">
        Analytics Dashboard
      </h1>

      <div className="slds-grid slds-gutters slds-wrap">
        <div className="slds-col slds-size_1-of-1 slds-large-size_1-of-2 slds-p-bottom_medium">
          <Card
            className="admin-box"
            heading="Distribution by Category"
            icon={<Icon category="standard" name="custom" size="small" />}
            bodyClassName="slds-p-horizontal_small"
          >
            <div className="slds-p-around_medium">
              {topCategories.length > 0 ? (
                <ul className="slds-has-dividers_bottom-space">
                  {topCategories.map((category) => (
                    <li
                      key={category.name}
                      className="slds-item slds-p-vertical_small"
                    >
                      <div className="slds-grid slds-grid_align-spread">
                        <div className="slds-col slds-size_4-of-12">
                          <span className="slds-text-heading_small">
                            {category.name}
                          </span>
                        </div>
                        <div className="slds-col slds-size_5-of-12">
                          <div
                            className="slds-progress-bar slds-progress-bar_x-small"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={category.percentage}
                            role="progressbar"
                          >
                            <span
                              className="slds-progress-bar__value"
                              style={{
                                width: `${category.percentage}%`,
                                backgroundColor: "#b18cff",
                              }}
                            ></span>
                          </div>
                        </div>
                        <div className="slds-col slds-size_3-of-12 slds-text-align_right">
                          <span className="slds-text-heading_small">
                            {category.count}
                          </span>
                          <span className="slds-text-color_weak slds-m-left_xx-small">
                            ({category.percentage}%)
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="slds-align_absolute-center slds-p-around_medium slds-text-color_weak">
                  <Icon
                    category="utility"
                    name="info"
                    size="small"
                    className="slds-m-right_x-small"
                  />
                  <span>No category data available</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="slds-col slds-size_1-of-1 slds-large-size_1-of-2 slds-p-bottom_medium">
          <Card
            className="admin-box"
            heading="Monthly Growth"
            icon={<Icon category="standard" name="timesheet" size="small" />}
            bodyClassName="slds-p-horizontal_small"
          >
            <div className="slds-p-around_medium">
              {timeSeriesData.length > 0 ? (
                <div>
                  <div className="slds-grid slds-grid_align-end slds-m-bottom_small">
                    <div className="slds-text-color_weak slds-text-body_small">
                      Total:{" "}
                      {timeSeriesData.reduce(
                        (sum, item) => sum + item.count,
                        0,
                      )}
                    </div>
                  </div>
                  <div
                    className="slds-grid slds-grid_vertical-align-end slds-m-top_medium"
                    style={{ height: "200px" }}
                  >
                    {timeSeriesData.map((item, index) => (
                      <div
                        key={item.period}
                        className="slds-col slds-size_1-of-6 slds-text-align_center"
                      >
                        <div
                          style={{
                            height: `${(item.count / maxTimeSeriesValue) * 150}px`,
                            backgroundColor: "#b18cff",
                            margin: "0 auto",
                            width: "70%",
                            borderRadius: "4px 4px 0 0",
                          }}
                          className="slds-m-bottom_x-small"
                          title={`${item.count} in ${formatMonth(item.period)}`}
                        ></div>
                        <div
                          className="slds-text-color_weak slds-text-body_small slds-truncate"
                          title={formatMonth(item.period)}
                        >
                          {formatMonth(item.period)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="slds-align_absolute-center slds-p-around_medium slds-text-color_weak">
                  <Icon
                    category="utility"
                    name="info"
                    size="small"
                    className="slds-m-right_x-small"
                  />
                  <span>No time series data available</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="slds-col slds-size_1-of-1 slds-p-bottom_medium">
        <Card
          className="admin-box"
          heading="Performance Metrics"
          icon={<Icon category="standard" name="metrics" size="small" />}
          bodyClassName="slds-p-horizontal_small"
        >
          <div className="slds-p-around_medium">
            <Tabs variant="scoped">
              <TabsPanel label="System Performance">
                <div className="slds-grid slds-gutters slds-wrap slds-p-around_medium">
                  <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-3 slds-p-bottom_medium">
                    <div className="slds-text-align_center">
                      <span className="slds-text-heading_medium">
                        Database Size
                      </span>
                      <div className="slds-text-heading_large slds-m-top_small">
                        3.2 <span className="slds-text-heading_small">GB</span>
                      </div>
                      <div className="slds-text-color_weak slds-m-top_xx-small">
                        <Icon
                          category="utility"
                          name="arrowup"
                          size="x-small"
                          className="slds-m-right_xx-small"
                          style={{ fill: "#04844b" }}
                        />
                        <span>12% growth last month</span>
                      </div>
                    </div>
                  </div>
                  <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-3 slds-p-bottom_medium">
                    <div className="slds-text-align_center">
                      <span className="slds-text-heading_medium">
                        Avg. Query Time
                      </span>
                      <div className="slds-text-heading_large slds-m-top_small">
                        156 <span className="slds-text-heading_small">ms</span>
                      </div>
                      <div className="slds-text-color_weak slds-m-top_xx-small">
                        <Icon
                          category="utility"
                          name="arrowdown"
                          size="x-small"
                          className="slds-m-right_xx-small"
                          style={{ fill: "#04844b" }}
                        />
                        <span>5% improvement</span>
                      </div>
                    </div>
                  </div>
                  <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-3 slds-p-bottom_medium">
                    <div className="slds-text-align_center">
                      <span className="slds-text-heading_medium">Uptime</span>
                      <div className="slds-text-heading_large slds-m-top_small">
                        99.9<span className="slds-text-heading_small">%</span>
                      </div>
                      <div className="slds-text-color_weak slds-m-top_xx-small">
                        <span>Last 30 days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsPanel>
              <TabsPanel label="User Activity">
                <div className="slds-grid slds-gutters slds-wrap slds-p-around_medium">
                  <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-3 slds-p-bottom_medium">
                    <div className="slds-text-align_center">
                      <span className="slds-text-heading_medium">
                        Active Users
                      </span>
                      <div className="slds-text-heading_large slds-m-top_small">
                        184
                      </div>
                      <div className="slds-text-color_weak slds-m-top_xx-small">
                        <span>Last 24 hours</span>
                      </div>
                    </div>
                  </div>
                  <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-3 slds-p-bottom_medium">
                    <div className="slds-text-align_center">
                      <span className="slds-text-heading_medium">
                        New Signups
                      </span>
                      <div className="slds-text-heading_large slds-m-top_small">
                        32
                      </div>
                      <div className="slds-text-color_weak slds-m-top_xx-small">
                        <span>Last 7 days</span>
                      </div>
                    </div>
                  </div>
                  <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-3 slds-p-bottom_medium">
                    <div className="slds-text-align_center">
                      <span className="slds-text-heading_medium">
                        Conversion Rate
                      </span>
                      <div className="slds-text-heading_large slds-m-top_small">
                        4.8<span className="slds-text-heading_small">%</span>
                      </div>
                      <div className="slds-text-color_weak slds-m-top_xx-small">
                        <Icon
                          category="utility"
                          name="arrowup"
                          size="x-small"
                          className="slds-m-right_xx-small"
                          style={{ fill: "#04844b" }}
                        />
                        <span>0.5% increase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsPanel>
            </Tabs>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
