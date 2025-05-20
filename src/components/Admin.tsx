import React from "react";
import { Link } from "react-router-dom";
import {
  GlobalNavigationBar,
  GlobalNavigationBarRegion,
  Icon,
  MediaObject,
  Button,
} from "@salesforce/design-system-react";
import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css";
import "../App.css";

function Admin() {
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

      <div className="slds-p-around_xx-large">
        <h1 className="slds-text-heading_large">Admin Dashboard</h1>
        <div className="slds-m-top_medium" />
        <div className="slds-m-top_medium" />
        <div className="slds-m-top_medium" />
      </div>
    </div>
  );
}

export default Admin;
