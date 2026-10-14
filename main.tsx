// ============================================================
// main.tsx — DocuForge App Entry Point
// ------------------------------------------------------------
// Yeh file React app ko browser mein mount karti hai.
// 
// GitHub Pages ke liye special setup:
//  - HashRouter use ho raha hai (kyunki GitHub Pages SPA
//    fallback support nahi karta, aur direct URLs par 404 deta hai)
//  - StrictMode on hai (development warnings ke liye)
//  - ErrorBoundary lagaya hai (agar koi component crash ho
//    to blank page ki jagah error message dikhe)
// ============================================================

// main.tsx — DocuForge entry point
// GitHub Pages ke liye: koi router yahan NAHI (App khud handle karti hai)

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element "#root" not found in index.html');
}

// ErrorBoundary (optional but helpful)
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: "system-ui", color: "#fca5a5", background: "#0f172a", minHeight: "100vh" }}>
          <h1>App crashed</h1>
          <pre style={{ whiteSpace: "pre-wrap" }}>{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// ------------------------------------------------------------
// Router
// ------------------------------------------------------------
// GitHub Pages ke liye HashRouter ZAROORI hai.
// 
// BrowserRouter:  https://site.com/pdf-tool-app/tools
//                 ↑ yeh direct open karne par 404 dega
//
// HashRouter:     https://site.com/pdf-tool-app/#/tools
//                 ↑ yeh hamesha kaam karega
//
// Agar aap Vercel/Netlify par deploy karein (jahan SPA
// fallback support hai), to BrowserRouter use kar sakte hain.
// Lekin GitHub Pages ke liye HashRouter he safest hai.
import { HashRouter } from "react-router-dom";

// ------------------------------------------------------------
// Global styles
// ------------------------------------------------------------
// index.css mein Tailwind v4 ka `@import "tailwindcss";` hona chahiye
import "./index.css";

// ------------------------------------------------------------
// Root App component
// ------------------------------------------------------------
import App from "./App";

// ------------------------------------------------------------
// Error Boundary
// ------------------------------------------------------------
// Agar App ke andar koi error aaye (e.g. undefined variable,
// missing route), to yeh component use catch karega aur
// blank page ki jagah readable error dikhayega.
// 
// Yeh debugging ke liye bohot useful hai — khaas taur par
// jab GitHub Pages par deploy karein aur kuch galat ho.
// ------------------------------------------------------------
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
    // Console mein full error log karo (debugging ke liye)
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

// ------------------------------------------------------------
// Mount the app
// ------------------------------------------------------------
// `document.getElementById("root")` index.html ke
// `<div id="root"></div>` ko target karta hai.
// 
// `!` (non-null assertion) TypeScript ko batata hai ki
// yeh element zaroor milega (index.html mein hai).
// ------------------------------------------------------------
const rootElement = document.getElementById("root");

if (!rootElement) {
  // Agar index.html mein #root missing hai to explicit error
  throw new Error(
    'Root element "#root" not found in index.html. ' +
    'Please check your index.html file.'
  );
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <App />
      </HashRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
