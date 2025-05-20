import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  GlobalNavigationBar,
  GlobalNavigationBarRegion,
  Icon,
  Tabs,
  TabsPanel,
  IconSettings,
} from "@salesforce/design-system-react";
import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css";
import "../App.css";

// Import dashboard components
import DashboardStats from "./admin/DashboardStats";
import FilmsList from "./admin/FilmsList";
import CustomersList from "./admin/CustomersList";
import RentalsList from "./admin/RentalsList";
import SalesByCategoryList from "./admin/SalesByCategoryList";

function Admin() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabSelect = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  return (
    <IconSettings iconPath="/assets/icons">
      <div
        className="slds-scope"
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
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

        <div className="slds-p-around_medium slds-grid slds-grid_vertical">
          <div className="slds-text-heading_large slds-m-bottom_medium slds-p-left_small">
            Admin Dashboard
          </div>

          <Tabs
            id="admin-dashboard-tabs"
            className="custom-tabs"
            variant="scoped"
            onSelect={handleTabSelect}
          >
            <TabsPanel label="Overview" id="overview-tab">
              <div className="slds-p-around_small">
                <DashboardStats />
                <div className="slds-grid slds-wrap slds-gutters">
                  <div className="slds-col slds-size_1-of-1 slds-large-size_1-of-2 slds-p-vertical_x-small">
                    <SalesByCategoryList />
                  </div>
                  <div className="slds-col slds-size_1-of-1 slds-large-size_1-of-2 slds-p-vertical_x-small">
                    <RentalsList />
                  </div>
                </div>
              </div>
            </TabsPanel>
            <TabsPanel label="Films" id="films-tab">
              <div className="slds-p-around_small">
                <FilmsList />
              </div>
            </TabsPanel>
            <TabsPanel label="Customers" id="customers-tab">
              <div className="slds-p-around_small">
                <CustomersList />
              </div>
            </TabsPanel>
            <TabsPanel label="Rentals" id="rentals-tab">
              <div className="slds-p-around_small">
                <RentalsList />
              </div>
            </TabsPanel>
            <TabsPanel label="Analytics" id="analytics-tab">
              <div className="slds-p-around_small">
                <SalesByCategoryList />
              </div>
            </TabsPanel>
          </Tabs>
        </div>
      </div>
    </IconSettings>
  );
}

export default Admin;
