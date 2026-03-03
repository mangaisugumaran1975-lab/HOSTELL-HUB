/**
 * AllocationPage.tsx
 * ─────────────────────────────────────────
 * Core feature: Allocate and deallocate rooms for students.
 *
 * Business Rules implemented:
 *  1. A student can only be allocated ONE room at a time.
 *  2. Room must have available capacity (occupied < capacity).
 *  3. Room's genderType must match the student's gender
 *     (or be "Common" which accepts both).
 *  4. Once allocated, room's 'occupied' count increases.
 *  5. Deallocation decreases 'occupied' and clears student's allocatedRoom.
 *
 * In the full-stack version, these would call:
 *   POST   /api/allocate          → allocate room
 *   DELETE /api/allocate/:studentId → deallocate room
 *   GET    /api/allocations        → get all allocation records
 */

import React, { useState, useMemo } from "react";
import { Student, Room } from "../types";

interface AllocationPageProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
}

const AllocationPage: React.FC<AllocationPageProps> = ({
  students,
  setStudents,
  rooms,
  setRooms,
}) => {

  // ── Form state for new allocation ──
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedRoomId, setSelectedRoomId]       = useState("");
  const [message, setMessage]   = useState<{ type: "success" | "danger" | "warning"; text: string } | null>(null);
  const [deallocateId, setDeallocateId] = useState<string | null>(null); // studentId to deallocate
  const [allocSearch, setAllocSearch]   = useState("");

  const showMessage = (type: "success" | "danger" | "warning", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // ── Students not yet allocated ──
  const unallocatedStudents = useMemo(
    () => students.filter((s) => s.allocatedRoom === null),
    [students]
  );

  // ── Currently allocated students ──
  const allocatedStudents = useMemo(
    () => students.filter((s) => s.allocatedRoom !== null),
    [students]
  );

  // ── Find the selected student ──
  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // ── Rooms eligible for selected student ──
  // A room is eligible if:
  //   - it has space (occupied < capacity)
  //   - genderType matches student's gender OR is "Common"
  const eligibleRooms = useMemo(() => {
    if (!selectedStudent) return rooms.filter((r) => r.occupied < r.capacity);
    return rooms.filter((r) => {
      const hasSpace    = r.occupied < r.capacity;
      const genderMatch = r.genderType === "Common" || r.genderType === selectedStudent.gender;
      return hasSpace && genderMatch;
    });
  }, [rooms, selectedStudent]);

  // ── Handle Allocate Room ──
  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudentId || !selectedRoomId) {
      showMessage("warning", "⚠️ Please select both a student and a room.");
      return;
    }

    const student = students.find((s) => s.id === selectedStudentId);
    const room    = rooms.find((r) => r.id === selectedRoomId);

    if (!student || !room) {
      showMessage("danger", "⚠️ Invalid student or room selection.");
      return;
    }

    // ---- Validation ----

    // 1. Student already has a room
    if (student.allocatedRoom) {
      showMessage("danger", `⚠️ ${student.name} is already allocated to Room ${student.allocatedRoom}. Deallocate first.`);
      return;
    }

    // 2. Room is full
    if (room.occupied >= room.capacity) {
      showMessage("danger", `⚠️ Room ${room.roomNumber} is full (${room.occupied}/${room.capacity}). Choose another room.`);
      return;
    }

    // 3. Gender mismatch
    if (room.genderType !== "Common" && room.genderType !== student.gender) {
      showMessage("danger", `⚠️ Room ${room.roomNumber} is a ${room.genderType}-only room. Student ${student.name} is ${student.gender}.`);
      return;
    }

    // ---- Perform Allocation ----

    // Update student's allocatedRoom
    const updatedStudents = students.map((s) =>
      s.id === selectedStudentId ? { ...s, allocatedRoom: room.roomNumber } : s
    );

    // Update room's occupied count
    const updatedRooms = rooms.map((r) =>
      r.id === selectedRoomId ? { ...r, occupied: r.occupied + 1 } : r
    );

    // Persist to localStorage
    localStorage.setItem("hostel_students", JSON.stringify(updatedStudents));
    localStorage.setItem("hostel_rooms",    JSON.stringify(updatedRooms));

    // Update React state
    setStudents(updatedStudents);
    setRooms(updatedRooms);

    // Reset form
    setSelectedStudentId("");
    setSelectedRoomId("");
    showMessage("success", `✅ Room ${room.roomNumber} successfully allocated to ${student.name} (${student.registerNumber})!`);
  };

  // ── Handle Deallocate Room ──
  const handleDeallocate = () => {
    if (!deallocateId) return;

    const student = students.find((s) => s.id === deallocateId);
    if (!student || !student.allocatedRoom) return;

    const roomNum = student.allocatedRoom;

    // Remove student's room assignment
    const updatedStudents = students.map((s) =>
      s.id === deallocateId ? { ...s, allocatedRoom: null } : s
    );

    // Decrease room occupied count
    const updatedRooms = rooms.map((r) =>
      r.roomNumber === roomNum ? { ...r, occupied: Math.max(0, r.occupied - 1) } : r
    );

    localStorage.setItem("hostel_students", JSON.stringify(updatedStudents));
    localStorage.setItem("hostel_rooms",    JSON.stringify(updatedRooms));
    setStudents(updatedStudents);
    setRooms(updatedRooms);

    setDeallocateId(null);
    showMessage("success", `✅ Room ${roomNum} has been deallocated from ${student.name}.`);
  };

  // ── Filter allocated students by search ──
  const filteredAllocated = allocatedStudents.filter((s) =>
    s.name.toLowerCase().includes(allocSearch.toLowerCase()) ||
    s.registerNumber.toLowerCase().includes(allocSearch.toLowerCase()) ||
    (s.allocatedRoom ?? "").toLowerCase().includes(allocSearch.toLowerCase())
  );

  // ── Get room object for a student ──
  const getRoomForStudent = (roomNumber: string | null) =>
    rooms.find((r) => r.roomNumber === roomNumber);

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h2>🔑 Room Allocation</h2>
          <p>Assign hostel rooms to students and manage existing allocations.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <span className="badge badge-green" style={{ fontSize: 13, padding: "8px 14px" }}>
            ✅ {allocatedStudents.length} Allocated
          </span>
          <span className="badge badge-yellow" style={{ fontSize: 13, padding: "8px 14px" }}>
            ⏳ {unallocatedStudents.length} Pending
          </span>
        </div>
      </div>

      {/* ── Alert Messages ── */}
      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {/* ── Allocation Form + Room Info ── */}
      <div className="allocation-layout" style={{ marginBottom: 24 }}>

        {/* Left: Allocate Room Form */}
        <div className="card">
          <div className="card-header">
            <h3>➕ Allocate Room to Student</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleAllocate}>

              {/* Select Student */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label htmlFor="studentSelect">Select Student *</label>
                <select
                  id="studentSelect"
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    setSelectedRoomId(""); // reset room on student change
                  }}
                >
                  <option value="">-- Select Unallocated Student --</option>
                  {unallocatedStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.registerNumber}) — {s.gender}
                    </option>
                  ))}
                </select>
                {unallocatedStudents.length === 0 && (
                  <p style={{ fontSize: 12, color: "var(--text-light)", marginTop: 4 }}>
                    All students have been allocated rooms.
                  </p>
                )}
              </div>

              {/* Student Info Preview */}
              {selectedStudent && (
                <div
                  style={{
                    background: "var(--primary-light)",
                    border: "1px solid #bfdbfe",
                    borderRadius: 8,
                    padding: "12px 16px",
                    marginBottom: 16,
                    fontSize: 13,
                  }}
                >
                  <strong>👤 Selected Student:</strong>
                  <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                    <span>Name: <strong>{selectedStudent.name}</strong></span>
                    <span>Reg: <strong>{selectedStudent.registerNumber}</strong></span>
                    <span>Dept: <strong>{selectedStudent.department}</strong></span>
                    <span>
                      Gender:{" "}
                      <strong>
                        <span className={`badge ${selectedStudent.gender === "Male" ? "badge-blue" : "badge-purple"}`}>
                          {selectedStudent.gender}
                        </span>
                      </strong>
                    </span>
                  </div>
                  {eligibleRooms.length === 0 && (
                    <p style={{ color: "var(--danger)", marginTop: 8, fontWeight: 600 }}>
                      ⚠️ No eligible rooms available for this student's gender.
                    </p>
                  )}
                </div>
              )}

              {/* Select Room */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label htmlFor="roomSelect">
                  Select Room *{" "}
                  {selectedStudent && (
                    <span style={{ fontWeight: 400, color: "var(--text-medium)", fontSize: 12 }}>
                      (showing {selectedStudent.gender} + Common rooms with space)
                    </span>
                  )}
                </label>
                <select
                  id="roomSelect"
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  disabled={!selectedStudentId}
                >
                  <option value="">-- Select Available Room --</option>
                  {eligibleRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.roomNumber} — {r.genderType} — Floor {r.floor} — Capacity: {r.occupied}/{r.capacity}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Preview */}
              {selectedRoomId && (() => {
                const r = rooms.find((rm) => rm.id === selectedRoomId);
                if (!r) return null;
                const avail = r.capacity - r.occupied;
                const p = r.capacity > 0 ? Math.round((r.occupied / r.capacity) * 100) : 0;
                return (
                  <div style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 8,
                    padding: "12px 16px",
                    marginBottom: 16,
                    fontSize: 13,
                  }}>
                    <strong>🛏️ Selected Room: {r.roomNumber}</strong>
                    <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                      <span>Floor: <strong>{r.floor}</strong></span>
                      <span>Gender: <strong>{r.genderType}</strong></span>
                      <span>Capacity: <strong>{r.capacity}</strong></span>
                      <span>Available Beds: <strong style={{ color: "var(--success)" }}>{avail}</strong></span>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 12, color: "var(--text-medium)", marginBottom: 4 }}>
                        Occupancy: {r.occupied}/{r.capacity} ({p}%)
                      </div>
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fill low"
                          style={{ width: `${p}%`, background: "var(--success)" }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%" }}
                disabled={!selectedStudentId || !selectedRoomId}
              >
                🔑 Allocate Room
              </button>
            </form>
          </div>
        </div>

        {/* Right: Room availability summary */}
        <div className="card">
          <div className="card-header">
            <h3>🏠 Room Availability</h3>
          </div>
          <div className="card-body">
            {rooms.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🛏️</span>
                <p>No rooms added yet. Go to Room Management.</p>
              </div>
            ) : (
              <div>
                {rooms.map((r) => {
                  const avail   = r.capacity - r.occupied;
                  const isFull  = avail <= 0;
                  const percent = r.capacity > 0 ? Math.round((r.occupied / r.capacity) * 100) : 0;
                  return (
                    <div
                      key={r.id}
                      style={{
                        padding: "14px",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        marginBottom: 10,
                        background: isFull ? "#fef2f2" : "#f8fafc",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div>
                          <strong style={{ fontSize: 15 }}>{r.roomNumber}</strong>
                          &nbsp;
                          <span className={`badge ${r.genderType === "Male" ? "badge-blue" : r.genderType === "Female" ? "badge-purple" : "badge-gray"}`}>
                            {r.genderType}
                          </span>
                          &nbsp;
                          <span style={{ fontSize: 12, color: "var(--text-light)" }}>
                            Floor {r.floor}
                          </span>
                        </div>
                        <span className={`badge ${isFull ? "badge-red" : "badge-green"}`}>
                          {isFull ? "🔒 Full" : `✅ ${avail} free`}
                        </span>
                      </div>
                      {/* Bed icons */}
                      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                        {Array.from({ length: r.capacity }).map((_, i) => (
                          <span key={i} style={{ fontSize: 20 }}>
                            {i < r.occupied ? "🧑" : "🛏️"}
                          </span>
                        ))}
                      </div>
                      {/* Progress */}
                      <div className="capacity-bar-wrap">
                        <span style={{ fontSize: 12, minWidth: 52 }}>
                          {r.occupied}/{r.capacity}
                        </span>
                        <div className="capacity-mini-bar">
                          <div
                            className={`capacity-mini-fill ${isFull ? "full" : ""}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span style={{ fontSize: 12 }}>{percent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Current Allocations Table ── */}
      <div className="card">
        <div className="card-header">
          <h3>📋 Current Room Allocations</h3>
          <input
            type="text"
            placeholder="🔍 Search by name, reg. no., room..."
            value={allocSearch}
            onChange={(e) => setAllocSearch(e.target.value)}
            style={{
              padding: "8px 14px",
              border: "1.5px solid var(--border)",
              borderRadius: 8,
              fontSize: 13,
              width: 280,
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
                <th>Student Name</th>
                <th>Register No.</th>
                <th>Department</th>
                <th>Gender</th>
                <th>Allocated Room</th>
                <th>Floor</th>
                <th>Room Gender</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAllocated.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <span className="empty-icon">🔑</span>
                      <p>
                        {allocSearch
                          ? "No matching allocations."
                          : "No rooms allocated yet. Use the form above to allocate rooms."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAllocated.map((student, index) => {
                  const room = getRoomForStudent(student.allocatedRoom);
                  return (
                    <tr key={student.id}>
                      <td style={{ color: "var(--text-light)" }}>{index + 1}</td>
                      <td><strong>{student.name}</strong></td>
                      <td>
                        <code style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: 4, fontSize: 13 }}>
                          {student.registerNumber}
                        </code>
                      </td>
                      <td>{student.department}</td>
                      <td>
                        <span className={`badge ${student.gender === "Male" ? "badge-blue" : "badge-purple"}`}>
                          {student.gender}
                        </span>
                      </td>
                      <td>
                        <span className="allocated-tag">
                          🔑 Room {student.allocatedRoom}
                        </span>
                      </td>
                      <td>{room?.floor ?? "-"} Floor</td>
                      <td>
                        <span className={`badge ${room?.genderType === "Male" ? "badge-blue" : room?.genderType === "Female" ? "badge-purple" : "badge-gray"}`}>
                          {room?.genderType ?? "-"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => setDeallocateId(student.id)}
                          title="Deallocate this room"
                        >
                          🔓 Deallocate
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

      {/* ── Deallocate Confirmation Modal ── */}
      {deallocateId && (
        <div className="modal-overlay" onClick={() => setDeallocateId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>🔓 Confirm Deallocation</h3>
            <p>
              Are you sure you want to deallocate the room from{" "}
              <strong>{students.find((s) => s.id === deallocateId)?.name}</strong>?
              <br /><br />
              Room{" "}
              <strong>{students.find((s) => s.id === deallocateId)?.allocatedRoom}</strong>{" "}
              will be freed up and the student will be marked as unallocated.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setDeallocateId(null)}>
                Cancel
              </button>
              <button className="btn btn-warning" onClick={handleDeallocate}>
                🔓 Yes, Deallocate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllocationPage;
