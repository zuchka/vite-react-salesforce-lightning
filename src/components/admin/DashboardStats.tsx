import React, { useEffect, useState } from "react";
import { Card, Icon } from "@salesforce/design-system-react";
import { supabase } from "../../lib/supabaseClient";
import LoadingSpinner from "./LoadingSpinner";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: number;
  isLoading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  isLoading,
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    return trend > 0 ? "trending_up" : "trending_down";
  };

  const getTrendClass = () => {
    if (!trend) return "";
    return trend > 0 ? "slds-text-color_success" : "slds-text-color_error";
  };

  return (
    <Card
      className="admin-box slds-m-bottom_medium"
      heading={title}
      icon={<Icon category="standard" name={icon} size="small" />}
      bodyClassName="slds-p-horizontal_small"
    >
      <div className="slds-grid slds-grid_vertical-align-center">
        {isLoading ? (
          <LoadingSpinner
            size="small"
            containerClassName="slds-p-vertical_medium"
          />
        ) : (
          <>
            <div className="slds-text-heading_large slds-truncate slds-p-vertical_small">
              {value}
            </div>
            {trend && (
              <div
                className={`slds-text-body_small slds-p-left_small ${getTrendClass()}`}
              >
                <Icon
                  category="utility"
                  name={getTrendIcon()}
                  size="x-small"
                  className="slds-m-right_xx-small"
                />
                {Math.abs(trend)}%
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState({
    totalFilms: 0,
    totalCustomers: 0,
    totalRentals: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Fetch total films
        const { count: filmCount, error: filmError } = await supabase
          .from("film")
          .select("*", { count: "exact", head: true });

        // Fetch total customers
        const { count: customerCount, error: customerError } = await supabase
          .from("customer")
          .select("*", { count: "exact", head: true });

        // Fetch total rentals
        const { count: rentalCount, error: rentalError } = await supabase
          .from("rental")
          .select("*", { count: "exact", head: true });

        // Fetch total revenue
        const { data: revenueData, error: revenueError } = await supabase
          .from("payment")
          .select("amount");

        if (filmError || customerError || rentalError || revenueError) {
          console.error(
            "Error fetching stats:",
            filmError || customerError || rentalError || revenueError,
          );
          return;
        }

        const totalRevenue =
          revenueData?.reduce(
            (sum, payment) => sum + Number(payment.amount),
            0,
          ) || 0;

        setStats({
          totalFilms: filmCount || 0,
          totalCustomers: customerCount || 0,
          totalRentals: rentalCount || 0,
          totalRevenue,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="slds-p-around_medium">
      <div className="slds-grid slds-wrap slds-gutters">
        <div className="slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_3-of-12 slds-p-vertical_x-small">
          <StatCard
            title="Total Films"
            value={stats.totalFilms}
            icon="video"
            isLoading={isLoading}
          />
        </div>
        <div className="slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_3-of-12 slds-p-vertical_x-small">
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon="user"
            isLoading={isLoading}
          />
        </div>
        <div className="slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_3-of-12 slds-p-vertical_x-small">
          <StatCard
            title="Total Rentals"
            value={stats.totalRentals}
            icon="product_transfer"
            isLoading={isLoading}
          />
        </div>
        <div className="slds-col slds-size_1-of-1 slds-medium-size_6-of-12 slds-large-size_3-of-12 slds-p-vertical_x-small">
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon="money"
            trend={5.2}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
