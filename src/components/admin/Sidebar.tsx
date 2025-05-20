import React from "react";
import {
  Icon,
  VerticalNavigation,
  VerticalNavigationItem,
} from "@salesforce/design-system-react";

interface SidebarProps {
  activeItem: string;
  onSelect: (item: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onSelect }) => {
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "films", label: "Films", icon: "video" },
    { id: "actors", label: "Actors", icon: "user" },
    { id: "customers", label: "Customers", icon: "people" },
    { id: "rentals", label: "Rentals", icon: "contract" },
    { id: "payments", label: "Payments", icon: "currency" },
    { id: "inventory", label: "Inventory", icon: "box" },
    { id: "stores", label: "Stores", icon: "store" },
    { id: "categories", label: "Categories", icon: "folder" },
    { id: "staff", label: "Staff", icon: "employee" },
    { id: "locations", label: "Locations", icon: "location" },
  ];

  return (
    <div className="admin-sidebar">
      <div className="slds-p-around_medium">
        <h2 className="slds-text-heading_small slds-p-bottom_medium">
          <Icon
            category="standard"
            name="record"
            size="small"
            className="slds-m-right_x-small"
          />
          Sakila DVD Store
        </h2>
      </div>
      <VerticalNavigation
        id="admin-navigation"
        className="slds-m-top_medium"
        selectedId={activeItem}
        onSelect={(event, { item }) => {
          onSelect(item.id);
        }}
      >
        {navigationItems.map((item) => (
          <VerticalNavigationItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={
              <Icon
                assistiveText={{ label: item.label }}
                category="standard"
                name={item.icon}
                size="small"
              />
            }
          />
        ))}
      </VerticalNavigation>
    </div>
  );
};

export default Sidebar;
