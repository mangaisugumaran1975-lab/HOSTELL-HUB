/**
 * App.tsx — Hostel Room Allocation System
 * ─────────────────────────────────────────
 * Root component that manages:
 *   - Authentication state (login / logout)
 *   - Page routing (which page is currently shown)
 *   - Global student and room data (shared across pages)
 *   - Mobile sidebar toggle
 *
 * File structure:
 *   /src/app/App.tsx                        ← this file (main controller)
 *   /src/app/types.ts                       ← TypeScript type definitions
 *   /src/app/utils/storage.ts               ← localStorage helpers & seed data
 *   /src/app/components/LoginPage.tsx       ← Admin login screen
 *   /src/app/components/Sidebar.tsx         ← Left navigation panel
 *   /src/app/components/Dashboard.tsx       ← Stats overview
 *   /src/app/components/StudentsPage.tsx    ← Student CRUD
 *   /src/app/components/RoomsPage.tsx       ← Room CRUD
 *   /src/app/components/AllocationPage.tsx  ← Room allocation / deallocation
 *   /src/styles/hostel.css                  ← All custom CSS styles
 */

import React, { useState, useEffect } from "react";

// ── Import all CSS styles ──
import "../styles/hostel.css";

// ── Import components ──
import LoginPage      from "./components/LoginPage";
import Sidebar        from "./components/Sidebar";
import Dashboard      from "./components/Dashboard";
import StudentsPage   from "./components/StudentsPage";
import RoomsPage      from "./components/RoomsPage";
import AllocationPage from "./components/AllocationPage";

// ── Import data types and storage utilities ──
import { Student, Room } from "./types";
import { getStudents, getRooms, saveStudents, saveRooms } from "./utils/storage";

// =======================================================
//  MAIN APP COMPONENT
// =======================================================
export default function App() {

  // ── Auth State: Is the admin logged in? ──
  // We check localStorage so that the session persists on page refresh.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("hostel_admin_session") === "true";
  });

  // ── Page Routing State ──
  // Valid values: "dashboard" | "students" | "rooms" | "allocation"
  const [activePage, setActivePage] = useState("dashboard");

  // ── Mobile Sidebar State ──
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Global Data State ──
  // Student and Room data is loaded once on mount and passed down to child pages.
  // When a child page modifies data, it updates these states (and localStorage).
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms]       = useState<Room[]>([]);

  // ── Load data from localStorage when the app mounts ──
  useEffect(() => {
    if (isLoggedIn) {
      setStudents(getStudents()); // seeds sample data if first load
      setRooms(getRooms());
    }
  }, [isLoggedIn]);

  // ── Persist students to localStorage whenever they change ──
  useEffect(() => {
    if (students.length > 0) saveStudents(students);
  }, [students]);

  // ── Persist rooms to localStorage whenever they change ──
  useEffect(() => {
    if (rooms.length > 0) saveRooms(rooms);
  }, [rooms]);

  // ── Handle Login ──
  const handleLogin = () => {
    setIsLoggedIn(true);
    setStudents(getStudents());
    setRooms(getRooms());
  };

  // ── Handle Logout ──
  const handleLogout = () => {
    localStorage.removeItem("hostel_admin_session");
    setIsLoggedIn(false);
    setActivePage("dashboard");
    setSidebarOpen(false);
  };

  // ── Map page IDs to human-readable titles ──
  const pageTitles: Record<string, string> = {
    dashboard:  "📊 Dashboard",
    students:   "👨‍🎓 Student Management",
    rooms:      "🛏️ Room Management",
    allocation: "🔑 Room Allocation",
  };

  // =======================================================
  //  RENDER
  // =======================================================

  // ── Show Login page if not authenticated ──
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // ── Render the main app layout ──
  return (
    <div className="app-layout">

      {/* ── Mobile Overlay (closes sidebar on backdrop click) ── */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 99,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Left Sidebar Navigation ── */}
      <Sidebar
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          setSidebarOpen(false); // close sidebar on mobile after navigation
        }}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
      />

      {/* ── Right: Main Content Area ── */}
      <div className="main-content">

        {/* ── Sticky Top Header ── */}
        <header className="top-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Mobile hamburger button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                display: "none",        /* hidden on desktop via CSS */
                background: "none",
                border: "none",
                fontSize: 22,
                cursor: "pointer",
                padding: 4,
              }}
              className="mobile-menu-btn"
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <h1>{pageTitles[activePage]}</h1>
          </div>

          <div className="header-right">
            <div className="admin-badge">
              👤 Administrator
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="page-content">
          {activePage === "dashboard"  && (
            <Dashboard students={students} rooms={rooms} />
          )}
          {activePage === "students"   && (
            <StudentsPage students={students} setStudents={setStudents} />
          )}
          {activePage === "rooms"      && (
            <RoomsPage rooms={rooms} setRooms={setRooms} />
          )}
          {activePage === "allocation" && (
            <AllocationPage
              students={students}
              setStudents={setStudents}
              rooms={rooms}
              setRooms={setRooms}
            />
          )}
        </main>

        {/* ── Footer ── */}
        <footer style={{
          textAlign: "center",
          padding: "16px 32px",
          borderTop: "1px solid var(--border)",
          fontSize: 13,
          color: "var(--text-light)",
          background: "var(--card-bg)",
        }}>
          🏠 Hostel Room Allocation System &nbsp;·&nbsp; Mini Project &nbsp;·&nbsp;
          Built with React.js &amp; Node.js &nbsp;·&nbsp; {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
