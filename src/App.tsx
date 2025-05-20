import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  GlobalNavigationBar,
  GlobalNavigationBarRegion,
  GlobalNavigationBarLink,
  Button,
  Card,
  MediaObject,
  Icon,
  Input
} from '@salesforce/design-system-react'
import '@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css'
import './App.css'

function App() {
  return (
    <div className="slds-scope" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
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
            <span className="slds-truncate">Home</span>
          </Link>
          <Link to="/features" className="slds-context-bar__label-action">
            <span className="slds-truncate">Features</span>
          </Link>
          <Link to="/pricing" className="slds-context-bar__label-action">
            <span className="slds-truncate">Pricing</span>
          </Link>
          <Link to="/contact" className="slds-context-bar__label-action">
            <span className="slds-truncate">Contact</span>
          </Link>
        </GlobalNavigationBarRegion>
        <GlobalNavigationBarRegion region="tertiary">
          <Link to="/admin" className="slds-context-bar__label-action">
            <span className="slds-truncate">Admin</span>
          </Link>
        </GlobalNavigationBarRegion>
      </GlobalNavigationBar>

      {/* Hero Section */}
      <div className="slds-p-around_xx-large slds-p-vertical_xxx-large slds-align_absolute-center slds-text-align_center">
        <div className="slds-container_center slds-container_medium">
          <div className="slds-grid slds-grid_vertical slds-grid_align-center" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div>
              <h1 className="slds-text-heading_large slds-m-bottom_medium hero-title">Builder Video</h1>
              <h2 className="slds-text-heading_large slds-m-bottom_medium">Like Netflix, but better</h2>
              <p className="slds-text-heading_medium slds-text-color_weak slds-m-bottom_large">
                Building the future of video, one pixel at a time
              </p>
              <Button label="Get Started" variant="brand" className="slds-m-right_small" />
              <Button label="Learn More" variant="outline-brand" />
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="slds-p-around_xx-large slds-p-vertical_xxx-large">
        <div className="slds-container_center slds-container_medium">
          <div className="slds-grid slds-grid_align-center" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="slds-size_8-of-12">
              <Card className="testimonial-card">
                <MediaObject
                  figure={
                    <Icon
                      assistiveText={{ label: 'Quote' }}
                      category="standard"
                      name="quotes"
                    />
                  }
                  body={
                    <div>
                      <p className="slds-text-heading_medium slds-m-bottom_small">
                        "Builder Video has transformed our digital presence completely. Their innovative solutions have helped us reach new heights."
                      </p>
                      <p className="testimonial-author">
                        - John Doe, CEO of TechCorp
                      </p>
                    </div>
                  }
                />
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="slds-p-around_xx-large slds-p-vertical_xxx-large slds-background_color-gray-1 custom-footer-bg" style={{ marginTop: 'auto' }}>
        <div className="slds-container_center slds-container_medium">
          <div className="slds-grid slds-wrap slds-gutters" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="slds-size_1-of-4">
              <h3 className="slds-text-heading_small slds-m-bottom_small">About Us</h3>
              <p className="slds-text-body_small">Like Netflix, but better</p>
            </div>
            <div className="slds-size_1-of-4">
              <h3 className="slds-text-heading_small slds-m-bottom_small">Contact</h3>
              <p className="slds-text-body_small">Email: info@buildervideo.com</p>
              <p className="slds-text-body_small">Phone: (555) 123-4567</p>
            </div>
            <div className="slds-size_1-of-4">
              <h3 className="slds-text-heading_small slds-m-bottom_small">Follow Us</h3>
              <div className="slds-grid slds-grid_vertical">
                <a href="#" className="slds-text-body_small">Twitter</a>
                <a href="#" className="slds-text-body_small">LinkedIn</a>
                <a href="#" className="slds-text-body_small">Facebook</a>
              </div>
            </div>
            <div className="slds-size_1-of-4">
              <h3 className="slds-text-heading_small slds-m-bottom_small">Newsletter</h3>
              <Input
                type="email"
                placeholder="Enter your email"
                className="slds-m-bottom_small"
              />
              <Button label="Subscribe" variant="brand" />
            </div>
          </div>
          <div className="slds-grid slds-grid_align-center slds-m-top_large">
            <div>
              <p className="slds-text-align_center slds-text-color_weak">
                © 2024 Builder Video. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
