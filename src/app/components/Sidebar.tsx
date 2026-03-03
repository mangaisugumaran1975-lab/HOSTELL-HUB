/**
 * Sidebar.tsx
 * ─────────────────────────────────────────
 * Left-side navigation panel for the Hostel Admin dashboard.
 * Receives the active page and a setter to switch pages.
 */

import React from "react";

// ---- TypeScript Props ----
interface SidebarProps {
  activePage: string;        // current active route/page
  setActivePage: (page: string) => void;
  onLogout: () => void;      // callback to log out
  isOpen: boolean;           // mobile: whether sidebar is visible
}

// ---- Navigation Items Configuration ----
// Each item has an id (page key), label, and emoji icon
const navItems = [
  { id: "dashboard",  label: "Dashboard",       icon: "📊", section: "MAIN" },
  { id: "students",   label: "Students",        icon: "👨‍🎓", section: "MANAGEMENT" },
  { id: "rooms",      label: "Rooms",           icon: "🛏️",  section: "MANAGEMENT" },
  { id: "allocation", label: "Room Allocation", icon: "🔑",  section: "MANAGEMENT" },
];

const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  onLogout,
  isOpen,
}) => {
  return (
    <nav className={`sidebar ${isOpen ? "open" : ""}`}>

      {/* ── Brand Header ── */}
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">🏠</div>
          <div className="brand-text">
            <h2>Hostel Admin</h2>
            <span>Room Allocation System</span>
          </div>
        </div>
      </div>

      {/* ── Navigation Links ── */}
      <div className="sidebar-nav">
        {/* Group items by section label */}
        {["MAIN", "MANAGEMENT"].map((section) => (
          <div key={section}>
            <div className="nav-section-label">{section}</div>
            {navItems
              .filter((item) => item.section === section)
              .map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${activePage === item.id ? "active" : ""}`}
                  onClick={() => setActivePage(item.id)}
                  title={item.label}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
          </div>
        ))}
      </div>

      {/* ── Footer: Logout Button ── */}
      <div className="sidebar-footer">
        {/* Admin info */}
        <div style={{ padding: "8px 12px", marginBottom: "8px" }}>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "2px" }}>
            Logged in as
          </div>
          <div style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: 600 }}>
            👤 Admin
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <span className="nav-icon">🚪</span>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
