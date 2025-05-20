import React from 'react';
import { Link } from 'react-router-dom';
import {
  GlobalNavigationBar,
  GlobalNavigationBarRegion,
  Icon,
  MediaObject,
  Button
} from '@salesforce/design-system-react';
import '@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css';
import '../App.css';

function Admin() {
  return (
    <div className="slds-scope">
      <GlobalNavigationBar>
        <GlobalNavigationBarRegion region="primary">
          <div className="slds-context-bar__label-action slds-context-bar__app-name">
            <Icon
              assistiveText={{ label: 'Builder Video' }}
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
        <div className="slds-m-top_medium">
          <div className="slds-card testimonial-card">
            <div className="slds-card__header slds-grid">
              <header className="slds-media slds-media_center slds-has-flexi-truncate">
                <div className="slds-media__body">
                  <h2 className="slds-card__header-title">
                    <span className="slds-text-heading_medium">Quick Stats</span>
                  </h2>
                </div>
              </header>
            </div>
            <div className="slds-card__body slds-card__body_inner">
              <div className="slds-grid slds-wrap slds-gutters">
                <div className="slds-col slds-size_1-of-3">
                  <div className="slds-box slds-box_small admin-box">
                    <h3 className="slds-text-heading_small">Total Users</h3>
                    <p className="slds-text-heading_medium">1,234</p>
                  </div>
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <div className="slds-box slds-box_small admin-box">
                    <h3 className="slds-text-heading_small">Active Projects</h3>
                    <p className="slds-text-heading_medium">42</p>
                  </div>
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <div className="slds-box slds-box_small admin-box">
                    <h3 className="slds-text-heading_small">Revenue</h3>
                    <p className="slds-text-heading_medium">$123,456</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="slds-m-top_medium">
          <div className="slds-card testimonial-card">
            <div className="slds-card__header slds-grid">
              <header className="slds-media slds-media_center slds-has-flexi-truncate">
                <div className="slds-media__body">
                  <h2 className="slds-card__header-title">
                    <span className="slds-text-heading_medium">Recent Activity</span>
                  </h2>
                </div>
              </header>
            </div>
            <div className="slds-card__body slds-card__body_inner">
              <ul className="slds-timeline">
                <li className="slds-timeline__item">
                  <MediaObject
                    figure={
                      <Icon
                        assistiveText={{ label: 'Task' }}
                        category="standard"
                        name="task"
                      />
                    }
                    body={
                      <div>
                        <p className="slds-text-body_regular">New user registration</p>
                        <p className="testimonial-author">2 hours ago</p>
                      </div>
                    }
                  />
                </li>
                <li className="slds-timeline__item">
                  <MediaObject
                    figure={
                      <Icon
                        assistiveText={{ label: 'Task' }}
                        category="standard"
                        name="task"
                      />
                    }
                    body={
                      <div>
                        <p className="slds-text-body_regular">Project update completed</p>
                        <p className="testimonial-author">5 hours ago</p>
                      </div>
                    }
                  />
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="slds-m-top_medium">
          <div className="slds-card testimonial-card">
            <div className="slds-card__header slds-grid">
              <header className="slds-media slds-media_center slds-has-flexi-truncate">
                <div className="slds-media__body">
                  <h2 className="slds-card__header-title">
                    <span className="slds-text-heading_medium">Quick Actions</span>
                  </h2>
                </div>
              </header>
            </div>
            <div className="slds-card__body slds-card__body_inner">
              <div className="slds-grid slds-wrap slds-gutters">
                <div className="slds-col slds-size_1-of-2">
                  <Button label="Add New User" variant="brand" className="slds-m-bottom_small" />
                </div>
                <div className="slds-col slds-size_1-of-2">
                  <Button label="Create Project" variant="outline-brand" className="slds-m-bottom_small" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin; 