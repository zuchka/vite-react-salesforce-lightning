import React, { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import StatsCard from "./StatsCard";
import {
  Card,
  Icon,
  Spinner,
  DataTable,
  DataTableColumn,
  DataTableCell,
} from "@salesforce/design-system-react";
import { Tables } from "../../types/database";

// Define the Statistics type locally to avoid import issues
interface Statistics {
  totalUsers: number;
  activeSubscriptions: number;
  totalVideos: number;
  totalViews: number;
  recentSignups: number;
  totalRevenue: number;
  averageWatchTime: number;
}

const StatisticsPanel: React.FC = () => {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [topVideos, setTopVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);

        // Fetch basic counts
        const [
          userCountResponse,
          videoCountResponse,
          subscriptionCountResponse,
          viewsCountResponse,
        ] = await Promise.all([
          supabase
            .from(Tables.USERS)
            .select("*", { count: "exact", head: true }),
          supabase
            .from(Tables.VIDEOS)
            .select("*", { count: "exact", head: true }),
          supabase
            .from(Tables.SUBSCRIPTIONS)
            .select("*", { count: "exact" })
            .eq("status", "active"),
          supabase
            .from(Tables.VIEW_EVENTS)
            .select("*", { count: "exact", head: true }),
        ]);

        // Fetch recent users (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentSignupsResponse = await supabase
          .from(Tables.USERS)
          .select("*", { count: "exact", head: true })
          .gte("created_at", thirtyDaysAgo.toISOString());

        // Calculate total revenue (simplified calculation)
        const revenueResponse = await supabase
          .from(Tables.SUBSCRIPTIONS)
          .select("amount")
          .eq("status", "active");

        let totalRevenue = 0;
        if (revenueResponse.data) {
          totalRevenue = revenueResponse.data.reduce(
            (sum, sub) => sum + (sub.amount || 0),
            0,
          );
        }

        // Calculate average watch time
        const watchTimeResponse = await supabase
          .from(Tables.VIEW_EVENTS)
          .select("watch_duration");

        let avgWatchTime = 0;
        if (watchTimeResponse.data && watchTimeResponse.data.length > 0) {
          const totalWatchTime = watchTimeResponse.data.reduce(
            (sum, event) => sum + (event.watch_duration || 0),
            0,
          );
          avgWatchTime = totalWatchTime / watchTimeResponse.data.length;
        }

        // Fetch recent videos
        const recentVideosResponse = await supabase
          .from(Tables.VIDEOS)
          .select("id, title, views, created_at, user_id")
          .order("created_at", { ascending: false })
          .limit(5);

        // Fetch top videos by views
        const topVideosResponse = await supabase
          .from(Tables.VIDEOS)
          .select("id, title, views, created_at, user_id")
          .order("views", { ascending: false })
          .limit(5);

        setStats({
          totalUsers: userCountResponse.count || 0,
          totalVideos: videoCountResponse.count || 0,
          activeSubscriptions: subscriptionCountResponse.count || 0,
          totalViews: viewsCountResponse.count || 0,
          recentSignups: recentSignupsResponse.count || 0,
          totalRevenue: Math.round(totalRevenue),
          averageWatchTime: Math.round(avgWatchTime / 60), // Convert to minutes
        });

        setRecentVideos(recentVideosResponse.data || []);
        setTopVideos(topVideosResponse.data || []);
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError("Failed to load statistics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div
        className="slds-p-around_medium slds-align_absolute-center"
        style={{ height: "300px" }}
      >
        <Spinner
          assistiveText={{ label: "Loading Statistics" }}
          size="large"
          variant="brand"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="slds-p-around_medium">
        <Card
          className="admin-error-card slds-card_boundary"
          bodyClassName="slds-p-around_medium"
        >
          <div className="slds-media slds-media_center">
            <div className="slds-media__figure">
              <Icon
                assistiveText={{ label: "Error" }}
                category="utility"
                name="error"
                size="small"
                colorVariant="error"
              />
            </div>
            <div className="slds-media__body">
              <h3 className="slds-text-heading_small slds-truncate">{error}</h3>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="statistics-panel">
      <div className="slds-grid slds-gutters slds-wrap">
        <div className="slds-col slds-size_1-of-1">
          <h2 className="slds-text-heading_medium slds-m-bottom_medium">
            Dashboard Overview
          </h2>
        </div>

        {/* Stats Cards */}
        <div className="slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_3-of-12 slds-p-around_x-small">
          <StatsCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={{ name: "user", category: "standard" }}
            change={{ value: 12, isPositive: true }}
          />
        </div>
        <div className="slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_3-of-12 slds-p-around_x-small">
          <StatsCard
            title="Total Videos"
            value={stats?.totalVideos || 0}
            icon={{ name: "video", category: "standard" }}
            change={{ value: 8, isPositive: true }}
          />
        </div>
        <div className="slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_3-of-12 slds-p-around_x-small">
          <StatsCard
            title="Active Subscriptions"
            value={stats?.activeSubscriptions || 0}
            icon={{ name: "product_consumed", category: "standard" }}
            change={{ value: 5, isPositive: true }}
          />
        </div>
        <div className="slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_3-of-12 slds-p-around_x-small">
          <StatsCard
            title="Total Revenue"
            value={`$${stats?.totalRevenue || 0}`}
            icon={{ name: "moneybag", category: "utility" }}
            change={{ value: 15, isPositive: true }}
          />
        </div>

        <div className="slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_4-of-12 slds-p-around_x-small">
          <StatsCard
            title="Total Views"
            value={stats?.totalViews || 0}
            icon={{ name: "metrics", category: "standard" }}
          />
        </div>
        <div className="slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_4-of-12 slds-p-around_x-small">
          <StatsCard
            title="New Users (30 days)"
            value={stats?.recentSignups || 0}
            icon={{ name: "user_role", category: "standard" }}
          />
        </div>
        <div className="slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_4-of-12 slds-p-around_x-small">
          <StatsCard
            title="Avg. Watch Time"
            value={`${stats?.averageWatchTime || 0} min`}
            icon={{ name: "clock", category: "utility" }}
          />
        </div>

        {/* Recent Videos */}
        <div className="slds-col slds-size_1-of-1 slds-large-size_6-of-12 slds-p-around_x-small">
          <Card
            className="admin-box slds-card_boundary"
            heading="Recently Added Videos"
            icon={<Icon category="standard" name="video" size="small" />}
          >
            <DataTable
              items={recentVideos}
              id="recent-videos-table"
              noRowHover
              className="admin-table"
            >
              <DataTableColumn key="title" label="Title" property="title" />
              <DataTableColumn key="views" label="Views" property="views" />
              <DataTableColumn
                key="created_at"
                label="Added On"
                property="created_at"
                cell={(props) => (
                  <DataTableCell title={formatDate(props.item.created_at)}>
                    {formatDate(props.item.created_at)}
                  </DataTableCell>
                )}
              />
            </DataTable>
          </Card>
        </div>

        {/* Top Videos */}
        <div className="slds-col slds-size_1-of-1 slds-large-size_6-of-12 slds-p-around_x-small">
          <Card
            className="admin-box slds-card_boundary"
            heading="Top Videos"
            icon={<Icon category="standard" name="video" size="small" />}
          >
            <DataTable
              items={topVideos}
              id="top-videos-table"
              noRowHover
              className="admin-table"
            >
              <DataTableColumn key="title" label="Title" property="title" />
              <DataTableColumn key="views" label="Views" property="views" />
              <DataTableColumn
                key="created_at"
                label="Added On"
                property="created_at"
                cell={(props) => (
                  <DataTableCell title={formatDate(props.item.created_at)}>
                    {formatDate(props.item.created_at)}
                  </DataTableCell>
                )}
              />
            </DataTable>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;
