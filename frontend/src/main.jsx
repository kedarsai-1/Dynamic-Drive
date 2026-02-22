import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ThemeProvider, CssBaseline } from "@mui/material";
import blablacarTheme from "./theme/blablacarTheme";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ThemeProvider theme={blablacarTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
);

