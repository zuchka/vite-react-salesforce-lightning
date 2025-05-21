import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  GlobalNavigationBar,
  GlobalNavigationBarRegion,
  Icon,
  Card,
  Tabs,
  TabsPanel,
} from "@salesforce/design-system-react";
import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css";
import "../App.css";

// Import admin dashboard components
import Dashboard from "./admin/Dashboard";
import TableViewer from "./admin/TableViewer";
import Analytics from "./admin/Analytics";

function Admin() {
  const [activeView, setActiveView] = useState<string>("dashboard");

  // Navigation items for the sidebar
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "home" },
    { id: "videos", label: "Videos", icon: "video" },
    { id: "users", label: "Users", icon: "user" },
    { id: "analytics", label: "Analytics", icon: "metrics" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  // Render the active view based on selection
  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />;
      case "videos":
        return <TableViewer initialTable="videos" />;
      case "users":
        return <TableViewer initialTable="users" />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return (
          <div className="slds-p-around_xx-large">
            <h1 className="slds-text-heading_large">Settings</h1>
            <p className="slds-m-top_medium slds-text-color_weak">
              System settings and configuration options will be available here.
            </p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="slds-scope">
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

      <div className="admin-content-wrapper">
        <div className="admin-sidebar">
          <div className="admin-sidebar-header">
            <h2 className="slds-text-heading_medium slds-p-around_medium">
              Admin Portal
            </h2>
          </div>
          <ul className="admin-sidebar-menu">
            {navItems.map((item) => (
              <li
                key={item.id}
                className={`admin-sidebar-item ${activeView === item.id ? "admin-sidebar-item-active" : ""}`}
                onClick={() => setActiveView(item.id)}
              >
                <Icon
                  category="standard"
                  name={item.icon}
                  size="small"
                  className="admin-sidebar-icon"
                />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="admin-main-content">{renderActiveView()}</div>
      </div>
    </div>
  );
}

export default Admin;
