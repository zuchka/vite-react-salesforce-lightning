import React, { useState } from "react";
import {
  Card,
  Icon,
  Button,
  Input,
  Checkbox,
  TabsPanel,
  Tab,
} from "@salesforce/design-system-react";

const SettingsView: React.FC = () => {
  // General settings
  const [siteName, setSiteName] = useState("Builder Video");
  const [siteDescription, setSiteDescription] = useState(
    "Like Netflix, but better",
  );
  const [supportEmail, setSupportEmail] = useState("support@buildervideo.com");

  // Video settings
  const [autoplayVideos, setAutoplayVideos] = useState(true);
  const [defaultVideoQuality, setDefaultVideoQuality] = useState("720p");
  const [maxUploadSize, setMaxUploadSize] = useState("500");

  // User settings
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [verifyEmails, setVerifyEmails] = useState(true);
  const [defaultUserRole, setDefaultUserRole] = useState("viewer");

  // Analytics settings
  const [enableAnalytics, setEnableAnalytics] = useState(true);
  const [trackUserBehavior, setTrackUserBehavior] = useState(true);
  const [shareAnalyticsWithCreators, setShareAnalyticsWithCreators] =
    useState(true);

  const handleSaveSettings = (section: string) => {
    // In a real application, this would save settings to the database
    alert(`Settings saved for section: ${section}`);
  };

  return (
    <div className="slds-p-around_medium">
      <h1 className="slds-text-heading_large slds-m-bottom_large">Settings</h1>

      <Card className="admin-box">
        <TabsPanel className="slds-tabs_card">
          <Tab
            label="General"
            id="general-settings"
            panelContent={
              <div className="slds-p-around_medium">
                <h2 className="slds-text-heading_medium slds-m-bottom_medium">
                  General Settings
                </h2>

                <div className="slds-form slds-form_stacked">
                  <div className="slds-form-element slds-m-bottom_large">
                    <label
                      className="slds-form-element__label"
                      htmlFor="site-name"
                    >
                      Site Name
                    </label>
                    <div className="slds-form-element__control">
                      <Input
                        id="site-name"
                        value={siteName}
                        onChange={(event) => setSiteName(event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="slds-form-element slds-m-bottom_large">
                    <label
                      className="slds-form-element__label"
                      htmlFor="site-description"
                    >
                      Site Description
                    </label>
                    <div className="slds-form-element__control">
                      <textarea
                        id="site-description"
                        className="slds-textarea"
                        value={siteDescription}
                        onChange={(e) => setSiteDescription(e.target.value)}
                        style={{
                          backgroundColor: "#23243a",
                          color: "#f4f4f6",
                          border: "1px solid #3a3b4d",
                        }}
                      />
                    </div>
                  </div>

                  <div className="slds-form-element slds-m-bottom_large">
                    <label
                      className="slds-form-element__label"
                      htmlFor="support-email"
                    >
                      Support Email
                    </label>
                    <div className="slds-form-element__control">
                      <Input
                        id="support-email"
                        type="email"
                        value={supportEmail}
                        onChange={(event) =>
                          setSupportEmail(event.target.value)
                        }
                      />
                    </div>
                  </div>

                  <Button
                    label="Save General Settings"
                    variant="brand"
                    onClick={() => handleSaveSettings("general")}
                  />
                </div>
              </div>
            }
          />

          <Tab
            label="Videos"
            id="video-settings"
            panelContent={
              <div className="slds-p-around_medium">
                <h2 className="slds-text-heading_medium slds-m-bottom_medium">
                  Video Settings
                </h2>

                <div className="slds-form slds-form_stacked">
                  <div className="slds-form-element slds-m-bottom_large">
                    <div className="slds-form-element__control">
                      <Checkbox
                        id="autoplay-videos"
                        labels={{ label: "Autoplay videos" }}
                        checked={autoplayVideos}
                        onChange={(event) =>
                          setAutoplayVideos(event.target.checked)
                        }
                      />
                    </div>
                  </div>

                  <div className="slds-form-element slds-m-bottom_large">
                    <label
                      className="slds-form-element__label"
                      htmlFor="default-video-quality"
                    >
                      Default Video Quality
                    </label>
                    <div className="slds-form-element__control">
                      <div className="slds-select_container">
                        <select
                          id="default-video-quality"
                          className="slds-select"
                          value={defaultVideoQuality}
                          onChange={(e) =>
                            setDefaultVideoQuality(e.target.value)
                          }
                          style={{
                            backgroundColor: "#23243a",
                            color: "#f4f4f6",
                            border: "1px solid #3a3b4d",
                          }}
                        >
                          <option value="360p">360p</option>
                          <option value="480p">480p</option>
                          <option value="720p">720p (HD)</option>
                          <option value="1080p">1080p (Full HD)</option>
                          <option value="2160p">2160p (4K Ultra HD)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="slds-form-element slds-m-bottom_large">
                    <label
                      className="slds-form-element__label"
                      htmlFor="max-upload-size"
                    >
                      Maximum Upload Size (MB)
                    </label>
                    <div className="slds-form-element__control">
                      <Input
                        id="max-upload-size"
                        type="number"
                        value={maxUploadSize}
                        onChange={(event) =>
                          setMaxUploadSize(event.target.value)
                        }
                      />
                    </div>
                  </div>

                  <Button
                    label="Save Video Settings"
                    variant="brand"
                    onClick={() => handleSaveSettings("videos")}
                  />
                </div>
              </div>
            }
          />

          <Tab
            label="Users"
            id="user-settings"
            panelContent={
              <div className="slds-p-around_medium">
                <h2 className="slds-text-heading_medium slds-m-bottom_medium">
                  User Settings
                </h2>

                <div className="slds-form slds-form_stacked">
                  <div className="slds-form-element slds-m-bottom_large">
                    <div className="slds-form-element__control">
                      <Checkbox
                        id="allow-registration"
                        labels={{ label: "Allow new user registration" }}
                        checked={allowRegistration}
                        onChange={(event) =>
                          setAllowRegistration(event.target.checked)
                        }
                      />
                    </div>
                  </div>

                  <div className="slds-form-element slds-m-bottom_large">
                    <div className="slds-form-element__control">
                      <Checkbox
                        id="verify-emails"
                        labels={{ label: "Require email verification" }}
                        checked={verifyEmails}
                        onChange={(event) =>
                          setVerifyEmails(event.target.checked)
                        }
                      />
                    </div>
                  </div>

                  <div className="slds-form-element slds-m-bottom_large">
                    <label
                      className="slds-form-element__label"
                      htmlFor="default-user-role"
                    >
                      Default User Role
                    </label>
                    <div className="slds-form-element__control">
                      <div className="slds-select_container">
                        <select
                          id="default-user-role"
                          className="slds-select"
                          value={defaultUserRole}
                          onChange={(e) => setDefaultUserRole(e.target.value)}
                          style={{
                            backgroundColor: "#23243a",
                            color: "#f4f4f6",
                            border: "1px solid #3a3b4d",
                          }}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="creator">Creator</option>
                          <option value="moderator">Moderator</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <Button
                    label="Save User Settings"
                    variant="brand"
                    onClick={() => handleSaveSettings("users")}
                  />
                </div>
              </div>
            }
          />

          <Tab
            label="Analytics"
            id="analytics-settings"
            panelContent={
              <div className="slds-p-around_medium">
                <h2 className="slds-text-heading_medium slds-m-bottom_medium">
                  Analytics Settings
                </h2>

                <div className="slds-form slds-form_stacked">
                  <div className="slds-form-element slds-m-bottom_large">
                    <div className="slds-form-element__control">
                      <Checkbox
                        id="enable-analytics"
                        labels={{ label: "Enable analytics tracking" }}
                        checked={enableAnalytics}
                        onChange={(event) =>
                          setEnableAnalytics(event.target.checked)
                        }
                      />
                    </div>
                  </div>

                  <div className="slds-form-element slds-m-bottom_large">
                    <div className="slds-form-element__control">
                      <Checkbox
                        id="track-user-behavior"
                        labels={{
                          label: "Track user behavior for recommendations",
                        }}
                        checked={trackUserBehavior}
                        onChange={(event) =>
                          setTrackUserBehavior(event.target.checked)
                        }
                        disabled={!enableAnalytics}
                      />
                    </div>
                  </div>

                  <div className="slds-form-element slds-m-bottom_large">
                    <div className="slds-form-element__control">
                      <Checkbox
                        id="share-analytics"
                        labels={{
                          label: "Share analytics with content creators",
                        }}
                        checked={shareAnalyticsWithCreators}
                        onChange={(event) =>
                          setShareAnalyticsWithCreators(event.target.checked)
                        }
                        disabled={!enableAnalytics}
                      />
                    </div>
                  </div>

                  <Button
                    label="Save Analytics Settings"
                    variant="brand"
                    onClick={() => handleSaveSettings("analytics")}
                    disabled={!enableAnalytics}
                  />
                </div>
              </div>
            }
          />

          <Tab
            label="API"
            id="api-settings"
            panelContent={
              <div className="slds-p-around_medium">
                <h2 className="slds-text-heading_medium slds-m-bottom_medium">
                  API Settings
                </h2>

                <div className="slds-form slds-form_stacked">
                  <div className="slds-box slds-theme_info slds-m-bottom_large">
                    <div className="slds-media">
                      <div className="slds-media__figure">
                        <Icon category="utility" name="info" size="small" />
                      </div>
                      <div className="slds-media__body">
                        <p>
                          This section allows you to manage API keys and access
                          tokens. For security reasons, please consult with your
                          development team before making changes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="slds-form-element slds-m-bottom_large">
                    <label
                      className="slds-form-element__label"
                      htmlFor="api-key"
                    >
                      API Key (Read Only)
                    </label>
                    <div className="slds-form-element__control">
                      <Input
                        id="api-key"
                        value="****************************************"
                        readOnly
                      />
                    </div>
                  </div>

                  <Button
                    label="Regenerate API Key"
                    variant="destructive"
                    onClick={() => handleSaveSettings("api")}
                  />
                </div>
              </div>
            }
          />
        </TabsPanel>
      </Card>
    </div>
  );
};

export default SettingsView;
