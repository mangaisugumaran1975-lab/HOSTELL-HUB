/**
 * Dashboard.tsx
 * ─────────────────────────────────────────
 * Shows an overview of the hostel's current statistics:
 *   - Total rooms, available rooms, occupied rooms
 *   - Total students, allocated students
 *   - Per-room occupancy bars
 *   - Recent allocation activity
 */

import React, { useMemo } from "react";
import { Student, Room } from "../types";

interface DashboardProps {
  students: Student[];
  rooms: Room[];
}

const Dashboard: React.FC<DashboardProps> = ({ students, rooms }) => {

  // ── Computed Statistics ──
  const stats = useMemo(() => {
    const totalRooms      = rooms.length;
    const availableRooms  = rooms.filter((r) => r.occupied < r.capacity).length;
    const fullRooms       = rooms.filter((r) => r.occupied >= r.capacity).length;
    const totalStudents   = students.length;
    const allocatedStudents = students.filter((s) => s.allocatedRoom !== null).length;
    const unallocatedStudents = totalStudents - allocatedStudents;
    return { totalRooms, availableRooms, fullRooms, totalStudents, allocatedStudents, unallocatedStudents };
  }, [students, rooms]);

  // ── Recently Allocated Students (last 5) ──
  const recentAllocations = useMemo(() => {
    return students
      .filter((s) => s.allocatedRoom !== null)
      .slice(-5)
      .reverse();
  }, [students]);

  // ── Helper: occupancy percentage for a room ──
  const occupancyPercent = (room: Room) =>
    room.capacity > 0 ? Math.round((room.occupied / room.capacity) * 100) : 0;

  // ── Helper: color class based on occupancy % ──
  const fillClass = (pct: number) => {
    if (pct >= 100) return "high";
    if (pct >= 60)  return "mid";
    return "low";
  };

  return (
    <div>
      {/* ── Page Title ── */}
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Welcome back, Admin! Here's your hostel overview.</p>
        </div>
        <span style={{ fontSize: 13, color: "var(--text-light)" }}>
          📅 {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>

      {/* ── Stats Cards Row ── */}
      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon blue">🛏️</div>
          <div className="stat-info">
            <h3>Total Rooms</h3>
            <div className="stat-number">{stats.totalRooms}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <h3>Available Rooms</h3>
            <div className="stat-number" style={{ color: "var(--success)" }}>
              {stats.availableRooms}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">🔒</div>
          <div className="stat-info">
            <h3>Full / Occupied</h3>
            <div className="stat-number" style={{ color: "var(--danger)" }}>
              {stats.fullRooms}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">👨‍🎓</div>
          <div className="stat-info">
            <h3>Total Students</h3>
            <div className="stat-number">{stats.totalStudents}</div>
          </div>
        </div>
      </div>

      {/* ── Second Row: Student allocation stat cards ── */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(2,1fr)", marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon green">🏠</div>
          <div className="stat-info">
            <h3>Students Allocated</h3>
            <div className="stat-number" style={{ color: "var(--success)" }}>
              {stats.allocatedStudents}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⏳</div>
          <div className="stat-info">
            <h3>Awaiting Allocation</h3>
            <div className="stat-number" style={{ color: "var(--warning)" }}>
              {stats.unallocatedStudents}
            </div>
          </div>
        </div>
      </div>

      {/* ── Room Occupancy & Recent Allocations ── */}
      <div className="dashboard-grid">

        {/* Left: Room Occupancy Bars */}
        <div className="info-card">
          <h3>🛏️ Room Occupancy Status</h3>
          {rooms.length === 0 ? (
            <p style={{ color: "var(--text-light)", fontSize: 14 }}>
              No rooms added yet. Go to Room Management to add rooms.
            </p>
          ) : (
            rooms.map((room) => {
              const pct = occupancyPercent(room);
              return (
                <div className="room-progress" key={room.id}>
                  <div className="room-label">
                    <span>
                      <strong>{room.roomNumber}</strong>
                      &nbsp;
                      <span className={`badge ${room.genderType === "Male" ? "badge-blue" : room.genderType === "Female" ? "badge-purple" : "badge-gray"}`}>
                        {room.genderType}
                      </span>
                      &nbsp;· Floor {room.floor}
                    </span>
                    <span>
                      {room.occupied}/{room.capacity} occupied ({pct}%)
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className={`progress-bar-fill ${fillClass(pct)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Recent Allocations */}
        <div className="info-card">
          <h3>🔑 Recent Allocations</h3>
          {recentAllocations.length === 0 ? (
            <p style={{ color: "var(--text-light)", fontSize: 14 }}>
              No allocations made yet. Go to Room Allocation to assign rooms.
            </p>
          ) : (
            <ul className="recent-list">
              {recentAllocations.map((s) => (
                <li key={s.id}>
                  <div>
                    <div className="student-name">{s.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-light)" }}>
                      {s.registerNumber} · {s.department}
                    </div>
                  </div>
                  <span className="room-badge">Room {s.allocatedRoom}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Quick Summary Table ── */}
      <div className="card">
        <div className="card-header">
          <h3>📋 Room Summary</h3>
          <span className="badge badge-blue">{rooms.length} Rooms Total</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Room No.</th>
                <th>Floor</th>
                <th>Gender</th>
                <th>Capacity</th>
                <th>Occupied</th>
                <th>Available</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <span className="empty-icon">🛏️</span>
                      <p>No rooms found. Add rooms in Room Management.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rooms.map((room) => {
                  const avail = room.capacity - room.occupied;
                  const isFull = avail <= 0;
                  return (
                    <tr key={room.id}>
                      <td><strong>{room.roomNumber}</strong></td>
                      <td>{room.floor}</td>
                      <td>
                        <span className={`badge ${room.genderType === "Male" ? "badge-blue" : room.genderType === "Female" ? "badge-purple" : "badge-gray"}`}>
                          {room.genderType}
                        </span>
                      </td>
                      <td>{room.capacity}</td>
                      <td>{room.occupied}</td>
                      <td>{avail}</td>
                      <td>
                        <span className={`badge ${isFull ? "badge-red" : "badge-green"}`}>
                          {isFull ? "Full" : "Available"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
