import React, { useState } from "react";
import {
  GlobalNavigationBar,
  GlobalNavigationBarRegion,
  Icon,
  SplitView,
  SplitViewHeader,
  SplitViewListbox,
  SplitViewListboxItem,
} from "@salesforce/design-system-react";
import { Link } from "react-router-dom";

// Dashboard components
import StatisticsPanel from "./StatisticsPanel";
import VideosList from "./VideosList";
import UsersList from "./UsersList";
import SubscriptionsList from "./SubscriptionsList";

// Enum for different views
enum AdminView {
  DASHBOARD = "dashboard",
  VIDEOS = "videos",
  USERS = "users",
  SUBSCRIPTIONS = "subscriptions",
}

const AdminLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminView>(
    AdminView.DASHBOARD,
  );

  // Render appropriate content based on selected view
  const renderContent = () => {
    switch (currentView) {
      case AdminView.DASHBOARD:
        return <StatisticsPanel />;
      case AdminView.VIDEOS:
        return <VideosList />;
      case AdminView.USERS:
        return <UsersList />;
      case AdminView.SUBSCRIPTIONS:
        return <SubscriptionsList />;
      default:
        return <StatisticsPanel />;
    }
  };

  return (
    <div className="slds-scope admin-layout">
      {/* Top Navigation Bar */}
      <GlobalNavigationBar>
        <GlobalNavigationBarRegion region="primary">
          <div className="slds-context-bar__label-action slds-context-bar__app-name">
            <Icon
              assistiveText={{ label: "Builder Video Admin" }}
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

      {/* Split View: Sidebar and Content */}
      <div className="slds-grid admin-container">
        <div className="slds-size_1-of-6 admin-sidebar">
          <SplitView id="admin-splitview" className="admin-splitview">
            <SplitViewHeader
              title="Admin Panel"
              icon={
                <Icon
                  assistiveText={{ label: "Admin" }}
                  category="standard"
                  name="dashboard"
                />
              }
            />
            <SplitViewListbox>
              <SplitViewListboxItem
                id="dashboard"
                icon={
                  <Icon
                    assistiveText={{ label: "Dashboard" }}
                    category="standard"
                    name="dashboard"
                    size="small"
                  />
                }
                title="Dashboard"
                isSelected={currentView === AdminView.DASHBOARD}
                onClick={() => setCurrentView(AdminView.DASHBOARD)}
              />
              <SplitViewListboxItem
                id="videos"
                icon={
                  <Icon
                    assistiveText={{ label: "Videos" }}
                    category="standard"
                    name="video"
                    size="small"
                  />
                }
                title="Videos"
                isSelected={currentView === AdminView.VIDEOS}
                onClick={() => setCurrentView(AdminView.VIDEOS)}
              />
              <SplitViewListboxItem
                id="users"
                icon={
                  <Icon
                    assistiveText={{ label: "Users" }}
                    category="standard"
                    name="user"
                    size="small"
                  />
                }
                title="Users"
                isSelected={currentView === AdminView.USERS}
                onClick={() => setCurrentView(AdminView.USERS)}
              />
              <SplitViewListboxItem
                id="subscriptions"
                icon={
                  <Icon
                    assistiveText={{ label: "Subscriptions" }}
                    category="standard"
                    name="product_consumed"
                    size="small"
                  />
                }
                title="Subscriptions"
                isSelected={currentView === AdminView.SUBSCRIPTIONS}
                onClick={() => setCurrentView(AdminView.SUBSCRIPTIONS)}
              />
              <SplitViewListboxItem
                id="settings"
                icon={
                  <Icon
                    assistiveText={{ label: "Settings" }}
                    category="standard"
                    name="settings"
                    size="small"
                  />
                }
                title="Settings"
                isSelected={false}
                onClick={() => alert("Settings view not implemented yet")}
              />
            </SplitViewListbox>
          </SplitView>
        </div>
        <div className="slds-size_5-of-6 admin-content">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
