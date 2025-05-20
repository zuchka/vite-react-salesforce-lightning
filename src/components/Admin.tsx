import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  GlobalNavigationBar,
  GlobalNavigationBarRegion,
  Icon,
  Button,
  Spinner,
} from "@salesforce/design-system-react";
import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css";

// Admin Components
import Sidebar from "./admin/Sidebar";
import Dashboard from "./admin/Dashboard";
import FilmsList from "./admin/FilmsList";
import ActorsList from "./admin/ActorsList";
import CustomersList from "./admin/CustomersList";
import RentalsList from "./admin/RentalsList";
import PaymentsList from "./admin/PaymentsList";
import InventoryList from "./admin/InventoryList";
import StoresList from "./admin/StoresList";
import CategoriesList from "./admin/CategoriesList";
import StaffList from "./admin/StaffList";
import LocationsList from "./admin/LocationsList";

// Import admin styles
import "./admin/AdminStyles.css";
import "../App.css";

function Admin() {
  const [activeView, setActiveView] = useState("dashboard");
  const [loading, setLoading] = useState(false);

  // Handle sidebar navigation
  const handleNavigationSelect = (item: string) => {
    setLoading(true);
    setActiveView(item);
    // Simulate loading time
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  // Render the appropriate component based on activeView
  const renderContent = () => {
    if (loading) {
      return (
        <div className="slds-p-around_xx-large slds-align_absolute-center">
          <Spinner
            size="large"
            variant="brand"
            assistiveText={{ label: "Loading view" }}
          />
        </div>
      );
    }

    switch (activeView) {
      case "dashboard":
        return <Dashboard />;
      case "films":
        return <FilmsList />;
      case "actors":
        return <ActorsList />;
      case "customers":
        return <CustomersList />;
      case "rentals":
        return <RentalsList />;
      case "payments":
        return <PaymentsList />;
      case "inventory":
        return <InventoryList />;
      case "stores":
        return <StoresList />;
      case "categories":
        return <CategoriesList />;
      case "staff":
        return <StaffList />;
      case "locations":
        return <LocationsList />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="slds-scope">
      {/* Navigation Bar */}
      <GlobalNavigationBar>
        <GlobalNavigationBarRegion region="primary">
          <div className="slds-context-bar__label-action slds-context-bar__app-name">
            <Icon
              assistiveText={{ label: "Builder Video" }}
              category="standard"
              name="account"
            />
            <span>Builder Video Admin</span>
          </div>
        </GlobalNavigationBarRegion>
        <GlobalNavigationBarRegion region="secondary">
          <Link to="/" className="slds-context-bar__label-action">
            <span className="slds-truncate">Back to Home</span>
          </Link>
        </GlobalNavigationBarRegion>
      </GlobalNavigationBar>

      {/* Admin Dashboard Layout */}
      <div className="admin-container">
        {/* Sidebar */}
        <Sidebar activeItem={activeView} onSelect={handleNavigationSelect} />

        {/* Main Content Area */}
        <div className="admin-main">{renderContent()}</div>
      </div>
    </div>
  );
}

export default Admin;
