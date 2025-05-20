import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  GlobalNavigationBar,
  GlobalNavigationBarRegion,
  Icon,
  SplitView,
  SplitViewHeader,
  SplitViewListbox,
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

  // Handle sidebar item selection
  const handleSelect = (event: Event, data: { item: any }) => {
    if (data && data.item) {
      setActiveView(data.item.id);
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

      <div
        className="slds-grid slds-grid_vertical"
        style={{ height: "calc(100vh - 3.125rem)" }}
      >
        <div
          className="slds-col slds-size_1-of-1"
          style={{ flex: "1 1 auto", overflow: "hidden" }}
        >
          <SplitView
            id="admin-splitview"
            className="slds-grid slds-grid_vertical"
            style={{ height: "100%" }}
          >
            <SplitViewHeader
              key="1"
              icon={
                <Icon
                  assistiveText={{ label: "Admin" }}
                  category="standard"
                  name="connected_apps"
                />
              }
              title="Admin Portal"
              truncate
              variant="objectHome"
            />
            <div
              className="slds-grid slds-grid_vertical"
              style={{ flex: "1 1 auto", overflow: "hidden" }}
            >
              <div
                className="slds-grid slds-grid_horizontal"
                style={{ flex: "1 1 auto", overflow: "hidden" }}
              >
                <div
                  className="slds-col slds-size_1-of-6"
                  style={{
                    borderRight: "1px solid #23243a",
                    backgroundColor: "#181a23",
                  }}
                >
                  <SplitViewListbox
                    className="slds-grid slds-grid_vertical"
                    key="2"
                    labels={{
                      header: "Navigation",
                    }}
                    options={navItems.map((item) => ({
                      id: item.id,
                      label: item.label,
                      icon: (
                        <Icon
                          assistiveText={{ label: item.label }}
                          category="standard"
                          name={item.icon}
                          size="small"
                        />
                      ),
                      selected: activeView === item.id,
                    }))}
                    events={{
                      onSelect: handleSelect,
                    }}
                    listboxClassName="slds-p-vertical_none"
                  />
                </div>
                <div
                  className="slds-col slds-size_5-of-6 slds-p-around_large"
                  style={{ overflow: "auto", backgroundColor: "#11131a" }}
                >
                  {renderActiveView()}
                </div>
              </div>
            </div>
          </SplitView>
        </div>
      </div>
    </div>
  );
}

export default Admin;
