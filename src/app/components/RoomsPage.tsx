/**
 * RoomsPage.tsx
 * ─────────────────────────────────────────
 * Handles all room management:
 *   - Add new room with validation
 *   - View list of all rooms with occupancy
 *   - Delete a room (only if not occupied)
 *
 * In the full-stack version, form submissions would call:
 *   POST   /api/rooms       → add room
 *   GET    /api/rooms       → fetch all rooms
 *   DELETE /api/rooms/:id   → delete room
 */

import React, { useState } from "react";
import { Room } from "../types";
import { generateId } from "../utils/storage";

const FLOORS = ["Ground", "1st", "2nd", "3rd", "4th", "5th"];

interface RoomsPageProps {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
}

const emptyForm = {
  roomNumber: "",
  floor: "",
  capacity: "",
  genderType: "" as "" | "Male" | "Female" | "Common",
};

const RoomsPage: React.FC<RoomsPageProps> = ({ rooms, setRooms }) => {

  const [form, setForm]         = useState({ ...emptyForm });
  const [message, setMessage]   = useState<{ type: "success" | "danger"; text: string } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch]     = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const showMessage = (type: "success" | "danger", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // ── Handle Add Room form submission ──
  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();

    // ---- Validation ----
    if (!form.roomNumber.trim() || !form.floor || !form.capacity || !form.genderType) {
      showMessage("danger", "⚠️ All fields are required.");
      return;
    }

    const capacityNum = parseInt(form.capacity, 10);
    if (isNaN(capacityNum) || capacityNum < 1 || capacityNum > 10) {
      showMessage("danger", "⚠️ Capacity must be a number between 1 and 10.");
      return;
    }

    // Check for duplicate room number
    const isDuplicate = rooms.some(
      (r) => r.roomNumber.toLowerCase() === form.roomNumber.toLowerCase()
    );
    if (isDuplicate) {
      showMessage("danger", `⚠️ Room number "${form.roomNumber}" already exists.`);
      return;
    }

    // ---- Create new room object ----
    const newRoom: Room = {
      id: generateId(),
      roomNumber: form.roomNumber.trim().toUpperCase(),
      floor: form.floor,
      capacity: capacityNum,
      occupied: 0,           // no one in it yet
      genderType: form.genderType as "Male" | "Female" | "Common",
    };

    setRooms((prev) => {
      const updated = [...prev, newRoom];
      localStorage.setItem("hostel_rooms", JSON.stringify(updated));
      return updated;
    });

    setForm({ ...emptyForm });
    showMessage("success", `✅ Room "${newRoom.roomNumber}" (${newRoom.genderType}, Capacity: ${newRoom.capacity}) added successfully!`);
  };

  // ── Delete room (only if empty) ──
  const handleDelete = () => {
    if (!deleteId) return;
    const room = rooms.find((r) => r.id === deleteId);
    if (!room) return;

    if (room.occupied > 0) {
      showMessage("danger", `⚠️ Cannot delete room "${room.roomNumber}" because ${room.occupied} student(s) are currently assigned to it. Please deallocate first.`);
      setDeleteId(null);
      return;
    }

    setRooms((prev) => {
      const updated = prev.filter((r) => r.id !== deleteId);
      localStorage.setItem("hostel_rooms", JSON.stringify(updated));
      return updated;
    });

    setDeleteId(null);
    showMessage("success", `✅ Room "${room.roomNumber}" has been deleted.`);
  };

  // ── Filtered rooms by search ──
  const filteredRooms = rooms.filter((r) =>
    r.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.floor.toLowerCase().includes(search.toLowerCase()) ||
    r.genderType.toLowerCase().includes(search.toLowerCase())
  );

  // ── Occupancy percentage ──
  const pct = (r: Room) =>
    r.capacity > 0 ? Math.round((r.occupied / r.capacity) * 100) : 0;

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h2>🛏️ Room Management</h2>
          <p>Add, view, and manage hostel room records.</p>
        </div>
        <span className="badge badge-blue" style={{ fontSize: 14, padding: "8px 16px" }}>
          Total: {rooms.length} rooms
        </span>
      </div>

      {/* ── Alert Messages ── */}
      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {/* ── Add Room Form Card ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3>➕ Add New Room</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleAddRoom}>
            <div className="form-grid cols-3">

              {/* Room Number */}
              <div className="form-group">
                <label htmlFor="roomNumber">Room Number *</label>
                <input
                  id="roomNumber"
                  name="roomNumber"
                  type="text"
                  placeholder="e.g. A-101"
                  value={form.roomNumber}
                  onChange={handleChange}
                />
              </div>

              {/* Floor */}
              <div className="form-group">
                <label htmlFor="floor">Floor *</label>
                <select id="floor" name="floor" value={form.floor} onChange={handleChange}>
                  <option value="">-- Select Floor --</option>
                  {FLOORS.map((f) => (
                    <option key={f} value={f}>{f} Floor</option>
                  ))}
                </select>
              </div>

              {/* Capacity */}
              <div className="form-group">
                <label htmlFor="capacity">Capacity *</label>
                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min={1}
                  max={10}
                  placeholder="e.g. 3"
                  value={form.capacity}
                  onChange={handleChange}
                />
              </div>

              {/* Gender Type */}
              <div className="form-group">
                <label htmlFor="genderType">Gender Type *</label>
                <select id="genderType" name="genderType" value={form.genderType} onChange={handleChange}>
                  <option value="">-- Select Type --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Common">Common</option>
                </select>
              </div>

            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                ➕ Add Room
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setForm({ ...emptyForm })}
              >
                🔄 Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Room List Card ── */}
      <div className="card">
        <div className="card-header">
          <h3>📋 Room Records</h3>
          <input
            type="text"
            placeholder="🔍 Search rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "8px 14px",
              border: "1.5px solid var(--border)",
              borderRadius: 8,
              fontSize: 13,
              width: 240,
              outline: "none",
              background: "#f8fafc",
            }}
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Room No.</th>
                <th>Floor</th>
                <th>Gender</th>
                <th>Capacity</th>
                <th>Occupied</th>
                <th>Available</th>
                <th>Occupancy</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div className="empty-state">
                      <span className="empty-icon">🛏️</span>
                      <p>{search ? "No rooms match your search." : "No rooms added yet. Use the form above."}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room, index) => {
                  const available = room.capacity - room.occupied;
                  const isFull    = available <= 0;
                  const percent   = pct(room);
                  return (
                    <tr key={room.id}>
                      <td style={{ color: "var(--text-light)" }}>{index + 1}</td>
                      <td>
                        <strong>{room.roomNumber}</strong>
                      </td>
                      <td>{room.floor} Floor</td>
                      <td>
                        <span className={`badge ${room.genderType === "Male" ? "badge-blue" : room.genderType === "Female" ? "badge-purple" : "badge-gray"}`}>
                          {room.genderType}
                        </span>
                      </td>
                      <td>{room.capacity}</td>
                      <td>{room.occupied}</td>
                      <td style={{ color: isFull ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>
                        {available}
                      </td>
                      <td>
                        {/* Mini capacity bar */}
                        <div className="capacity-bar-wrap">
                          <span style={{ fontSize: 12, width: 36 }}>{percent}%</span>
                          <div className="capacity-mini-bar">
                            <div
                              className={`capacity-mini-fill ${isFull ? "full" : ""}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${isFull ? "badge-red" : "badge-green"}`}>
                          {isFull ? "🔒 Full" : "✅ Available"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteId(room.id)}
                          title="Delete room"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Confirm Delete</h3>
            <p>
              Are you sure you want to delete room{" "}
              <strong>{rooms.find((r) => r.id === deleteId)?.roomNumber}</strong>?
              {(rooms.find((r) => r.id === deleteId)?.occupied ?? 0) > 0 && (
                <><br /><br />
                  <span style={{ color: "var(--danger)" }}>
                    ⚠️ This room has students assigned. Please deallocate them first.
                  </span>
                </>
              )}
              <br /><br />This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>🗑️ Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
