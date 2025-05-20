import React from "react";
import { Card, Icon } from "@salesforce/design-system-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: {
    name: string;
    category: string;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
}) => {
  return (
    <Card
      className="admin-stats-card slds-card_boundary"
      bodyClassName="slds-p-around_medium"
    >
      <div className="slds-grid slds-grid_vertical">
        <div className="slds-col slds-size_1-of-1 slds-m-bottom_small">
          <div className="slds-media">
            <div className="slds-media__figure stats-icon-container">
              <Icon
                assistiveText={{ label: title }}
                category={icon.category}
                name={icon.name}
                size="medium"
                className="stats-icon"
              />
            </div>
            <div className="slds-media__body">
              <h3 className="slds-text-heading_small slds-truncate slds-m-bottom_xx-small">
                {title}
              </h3>
              <div className="slds-grid slds-grid_vertical-align-center">
                <div className="slds-text-heading_medium slds-m-right_small stats-value">
                  {value}
                </div>
                {change && (
                  <div
                    className={`slds-text-body_small ${change.isPositive ? "stats-positive" : "stats-negative"}`}
                  >
                    <Icon
                      assistiveText={{
                        label: change.isPositive ? "Increase" : "Decrease",
                      }}
                      category="utility"
                      name={change.isPositive ? "arrowup" : "arrowdown"}
                      size="xx-small"
                      className="slds-m-right_xx-small"
                    />
                    {Math.abs(change.value)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
