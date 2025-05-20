import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { IconSettings } from "@salesforce/design-system-react";
import App from "./App";
import Admin from "./components/Admin";
import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <IconSettings iconPath="/assets/icons">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </IconSettings>
  </React.StrictMode>,
);
