import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./locales/index.js"; // Initialize i18next

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
