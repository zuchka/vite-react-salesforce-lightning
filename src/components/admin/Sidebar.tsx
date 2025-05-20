import React from "react";
import { Icon } from "@salesforce/design-system-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "films", label: "Films", icon: "video" },
    { id: "actors", label: "Actors", icon: "user" },
    { id: "customers", label: "Customers", icon: "people" },
    { id: "rentals", label: "Rentals", icon: "service_appointment" },
    { id: "categories", label: "Categories", icon: "product_item" },
    { id: "explore", label: "Database Explorer", icon: "database" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  return (
    <div
      className="slds-grid slds-grid_vertical"
      style={{
        backgroundColor: "#181a23",
        borderRight: "1px solid #23243a",
        minHeight: "calc(100vh - 48px)",
      }}
    >
      <ul className="slds-has-block-links_space">
        {tabs.map((tab) => (
          <li
            key={tab.id}
            className={`slds-item ${activeTab === tab.id ? "slds-is-active" : ""}`}
          >
            <a
              href="#"
              className={`slds-vertical-tabs__nav-link slds-p-around_medium ${activeTab === tab.id ? "active-admin-tab" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(tab.id);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                color: activeTab === tab.id ? "#b18cff" : "#f4f4f6",
                backgroundColor:
                  activeTab === tab.id ? "#23243a" : "transparent",
                borderLeft:
                  activeTab === tab.id
                    ? "4px solid #a259ff"
                    : "4px solid transparent",
                paddingLeft: "16px",
                transition: "all 0.2s ease-in-out",
              }}
            >
              <Icon
                category="standard"
                name={tab.icon}
                size="small"
                style={{ marginRight: "10px" }}
                className="slds-m-right_small"
              />
              <span>{tab.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
