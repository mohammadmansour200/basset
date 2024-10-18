import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n.tsx";
import "./index.css";
import { FileProvider } from "./contexts/FileProvider.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <FileProvider>
      <App />
    </FileProvider>
  </React.StrictMode>,
);
