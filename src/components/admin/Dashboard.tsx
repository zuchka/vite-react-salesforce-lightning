import React, { useEffect, useState } from "react";
import {
  Card,
  Icon,
  Spinner,
  Tabs,
  TabsPanel,
} from "@salesforce/design-system-react";
import supabase from "../../lib/supabase";

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFilms: 0,
    totalCustomers: 0,
    totalActors: 0,
    totalRentals: 0,
    totalRevenue: 0,
    activeCustomers: 0,
  });

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);

      try {
        // Get total films
        const { count: filmsCount } = await supabase
          .from("film")
          .select("*", { count: "exact", head: true });

        // Get total customers
        const { count: customersCount } = await supabase
          .from("customer")
          .select("*", { count: "exact", head: true });

        // Get total actors
        const { count: actorsCount } = await supabase
          .from("actor")
          .select("*", { count: "exact", head: true });

        // Get total rentals
        const { count: rentalsCount } = await supabase
          .from("rental")
          .select("*", { count: "exact", head: true });

        // Get total revenue
        const { data: payments } = await supabase
          .from("payment")
          .select("amount");

        const totalRevenue =
          payments?.reduce((acc, payment) => acc + payment.amount, 0) || 0;

        // Get active customers (with rentals in the last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { count: activeCustomersCount } = await supabase
          .from("rental")
          .select("customer_id", { count: "exact", head: true })
          .gte("rental_date", thirtyDaysAgo.toISOString())
          .limit(1);

        setStats({
          totalFilms: filmsCount || 0,
          totalCustomers: customersCount || 0,
          totalActors: actorsCount || 0,
          totalRentals: rentalsCount || 0,
          totalRevenue: totalRevenue,
          activeCustomers: activeCustomersCount || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const renderStatCard = (
    title: string,
    value: number | string,
    icon: string,
  ) => (
    <Card className="admin-box slds-m-bottom_medium">
      <div className="slds-p-around_medium">
        <div className="slds-grid slds-grid_vertical-align-center">
          <div className="slds-col slds-size_1-of-12">
            <Icon
              category="standard"
              name={icon}
              size="large"
              className="slds-m-right_small"
              style={{ fill: "#b18cff" }}
            />
          </div>
          <div className="slds-col slds-size_11-of-12">
            <h3 className="slds-text-heading_small">{title}</h3>
            <div
              className="slds-text-heading_large"
              style={{ color: "#b18cff" }}
            >
              {value}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="slds-p-around_xx-large slds-align_absolute-center">
        <Spinner
          size="large"
          variant="brand"
          assistiveText={{ label: "Loading dashboard data" }}
        />
      </div>
    );
  }

  return (
    <div className="slds-p-around_medium">
      <h1 className="slds-text-heading_large slds-p-bottom_medium">
        Dashboard Overview
      </h1>

      <div className="slds-grid slds-wrap slds-gutters">
        <div className="slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_4-of-12">
          {renderStatCard("Total Films", stats.totalFilms, "video")}
        </div>
        <div className="slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_4-of-12">
          {renderStatCard("Total Customers", stats.totalCustomers, "people")}
        </div>
        <div className="slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_4-of-12">
          {renderStatCard("Total Actors", stats.totalActors, "user")}
        </div>
        <div className="slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_4-of-12">
          {renderStatCard("Total Rentals", stats.totalRentals, "contract")}
        </div>
        <div className="slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_4-of-12">
          {renderStatCard(
            "Total Revenue",
            `$${stats.totalRevenue.toFixed(2)}`,
            "currency",
          )}
        </div>
        <div className="slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_4-of-12">
          {renderStatCard(
            "Active Customers",
            stats.activeCustomers,
            "live_chat",
          )}
        </div>
      </div>

      <div className="slds-m-top_large">
        <Card className="admin-box">
          <div className="slds-p-around_medium">
            <h2 className="slds-text-heading_medium slds-p-bottom_medium">
              Latest Activity
            </h2>
            <p className="slds-text-color_weak">
              Welcome to the Sakila DVD Store admin dashboard. Use the sidebar
              to navigate through different data views.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
