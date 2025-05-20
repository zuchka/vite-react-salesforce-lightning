import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  GlobalNavigationBar,
  GlobalNavigationBarRegion,
  Icon,
} from "@salesforce/design-system-react";
import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css";
import "../App.css";

// Import admin components
import Sidebar from "./admin/Sidebar";
import Dashboard from "./admin/Dashboard";
import VideosList from "./admin/VideosList";
import UsersList from "./admin/UsersList";
import CommentsView from "./admin/CommentsView";
import CategoriesView from "./admin/CategoriesView";
import DatabaseExplorer from "./admin/DatabaseExplorer";
import SettingsView from "./admin/SettingsView";

function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Render the appropriate component based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "videos":
        return <VideosList />;
      case "users":
        return <UsersList />;
      case "comments":
        return <CommentsView />;
      case "categories":
        return <CategoriesView />;
      case "explore":
        return <DatabaseExplorer />;
      case "settings":
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div
      className="slds-scope"
      style={{ backgroundColor: "#11131a", minHeight: "100vh" }}
    >
      <GlobalNavigationBar>
        <GlobalNavigationBarRegion region="primary">
          <div className="slds-context-bar__label-action slds-context-bar__app-name">
            <Icon
              assistiveText={{ label: "Builder Video" }}
              category="standard"
              name="account"
            />
            <span>Builder Video</span>
          </div>
        </GlobalNavigationBarRegion>
        <GlobalNavigationBarRegion region="secondary">
          <Link to="/" className="slds-context-bar__label-action">
            <span className="slds-truncate">Back to Home</span>
          </Link>
        </GlobalNavigationBarRegion>
      </GlobalNavigationBar>

      <div
        className="slds-grid slds-grid_vertical-stretch"
        style={{ minHeight: "calc(100vh - 48px)" }}
      >
        {/* Sidebar Navigation */}
        <div className="slds-col slds-size_1-of-6">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Main Content */}
        <div
          className="slds-col slds-size_5-of-6"
          style={{ backgroundColor: "#11131a" }}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default Admin;
