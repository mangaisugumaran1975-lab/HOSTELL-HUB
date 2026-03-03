/**
 * LoginPage.tsx
 * ─────────────────────────────────────────
 * Admin login screen for the Hostel Room Allocation System.
 * Validates username & password and calls onLogin() on success.
 *
 * Default credentials:
 *   Username : admin
 *   Password : admin123
 */

import React, { useState } from "react";

// ---- TypeScript Props ----
interface LoginPageProps {
  onLogin: () => void; // callback to notify parent that login succeeded
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  // ---- Local State ----
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // ---- Handle Form Submit ----
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Simple front-end validation
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);

    // Simulate an API call delay (like a real server request)
    setTimeout(() => {
      // Hard-coded admin credentials (in a real app these come from the server)
      if (username === "admin" && password === "admin123") {
        // Save session to localStorage so the user stays logged in on refresh
        localStorage.setItem("hostel_admin_session", "true");
        onLogin();
      } else {
        setError("Invalid username or password. Try admin / admin123");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {/* ── Logo / Branding ── */}
        <div className="login-logo">
          <div className="logo-icon">🏠</div>
          <h1>Hostel Room<br />Allocation System</h1>
          <p>Admin Portal — College Management</p>
        </div>

        {/* ── Error Alert ── */}
        {error && (
          <div className="alert alert-danger" role="alert">
            ⚠️ {error}
          </div>
        )}

        {/* ── Login Form ── */}
        <form className="login-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "⏳ Signing in..." : "🔐 Sign In"}
          </button>
        </form>

        {/* ── Credential Hint (for demo / college project) ── */}
        <div className="login-hint">
          <strong>Demo Credentials:</strong>&nbsp; admin &nbsp;/&nbsp; admin123
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
