// ============================================================
// main.tsx — DocuForge App Entry Point
// ------------------------------------------------------------
// React app ko browser mein mount karta hai.
//
// GitHub Pages ke liye:
//  - App.tsx khud hash routing handle karti hai
//  - Isliye yahan KOI Router (HashRouter/BrowserRouter) NAHI
//  - Sirf <App /> mount karo
// ============================================================

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// ============================================================
// Error Boundary
// ------------------------------------------------------------
// Agar App ke andar koi error aaye to blank page ki jagah
// readable error message dikhaye.
// ============================================================
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App crashed:", error);
    console.error("Component stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "#0f172a",
            color: "#e2e8f0",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", marginBottom: "12px" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
            App crash ho gayi. Neeche error details dekhein:
          </p>
          <pre
            style={{
              background: "#1e293b",
              padding: "16px",
              borderRadius: "8px",
              maxWidth: "800px",
              overflow: "auto",
              textAlign: "left",
              fontSize: "0.85rem",
              color: "#fca5a5",
            }}
          >
            {this.state.error?.message}
            {"\n\n"}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================
// Mount
// ------------------------------------------------------------
// index.html ke <div id="root"></div> ko target karo.
// ============================================================
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    'Root element "#root" not found in index.html. ' +
    'Please check your index.html file.'
  );
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
