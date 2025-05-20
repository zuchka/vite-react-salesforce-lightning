import React, { useState, ReactNode } from "react";

interface TabProps {
  label: string;
  id: string;
  children: ReactNode;
}

interface SimpleTabsProps {
  children: ReactNode[];
  variant?: "default" | "scoped";
  initialActiveTabIndex?: number;
  onSelect?: (index: number) => void;
}

export const TabPanel: React.FC<TabProps> = ({ children }) => {
  return <>{children}</>;
};

export const SimpleTabs: React.FC<SimpleTabsProps> = ({
  children,
  variant = "default",
  initialActiveTabIndex = 0,
  onSelect,
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(initialActiveTabIndex);

  const handleTabClick = (index: number) => {
    setActiveTabIndex(index);
    if (onSelect) {
      onSelect(index);
    }
  };

  // Filter children to only include TabPanels
  const tabs = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === TabPanel,
  );

  const tabClass =
    variant === "scoped" ? "slds-tabs_scoped" : "slds-tabs_default";
  const tabListClass =
    variant === "scoped" ? "slds-tabs_scoped__nav" : "slds-tabs_default__nav";
  const tabItemClass =
    variant === "scoped" ? "slds-tabs_scoped__item" : "slds-tabs_default__item";
  const tabLinkClass =
    variant === "scoped" ? "slds-tabs_scoped__link" : "slds-tabs_default__link";
  const tabContentClass =
    variant === "scoped"
      ? "slds-tabs_scoped__content"
      : "slds-tabs_default__content";

  return (
    <div className={tabClass}>
      <ul className={`${tabListClass} slds-grid`} role="tablist">
        {tabs.map((tab, index) => {
          if (!React.isValidElement(tab)) return null;

          const isActive = index === activeTabIndex;
          const { label, id } = tab.props;

          return (
            <li
              key={id}
              className={`${tabItemClass} ${isActive ? "slds-is-active" : ""}`}
              role="presentation"
            >
              <a
                className={tabLinkClass}
                href={`#${id}`}
                role="tab"
                tabIndex={isActive ? 0 : -1}
                aria-selected={isActive}
                aria-controls={id}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabClick(index);
                }}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>

      {tabs.map((tab, index) => {
        if (!React.isValidElement(tab)) return null;

        const isActive = index === activeTabIndex;
        const { id, children } = tab.props;

        return (
          <div
            key={id}
            id={id}
            className={`${tabContentClass} ${isActive ? "slds-show" : "slds-hide"}`}
            role="tabpanel"
            aria-labelledby={`${id}-tab`}
          >
            {children}
          </div>
        );
      })}
    </div>
  );
};

export default SimpleTabs;
