/**
 * StudentsPage.tsx
 * ─────────────────────────────────────────
 * Handles all student management:
 *   - Add new student with validation
 *   - View list of all students
 *   - Delete a student (with confirmation)
 *   - Shows which room each student is allocated to
 *
 * In the full-stack version, form submissions would call:
 *   POST   /api/students       → add student
 *   GET    /api/students       → fetch all students
 *   DELETE /api/students/:id   → delete student
 */

import React, { useState } from "react";
import { Student } from "../types";
import { generateId } from "../utils/storage";

// ── Available departments for the dropdown ──
const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "AIDS", "AIML", "MBA", "MCA"];
const YEARS       = ["1st", "2nd", "3rd", "4th"];

interface StudentsPageProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

// ── Default empty form values ──
const emptyForm = {
  name: "",
  registerNumber: "",
  department: "",
  year: "",
  gender: "" as "" | "Male" | "Female",
};

const StudentsPage: React.FC<StudentsPageProps> = ({ students, setStudents }) => {

  // ── Form State ──
  const [form, setForm]         = useState({ ...emptyForm });
  const [message, setMessage]   = useState<{ type: "success" | "danger"; text: string } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null); // ID of student to delete
  const [search, setSearch]     = useState("");

  // ── Handle input changes ──
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Show a temporary alert message ──
  const showMessage = (type: "success" | "danger", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000); // auto-dismiss after 4s
  };

  // ── Handle Add Student form submission ──
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();

    // ---- Validation ----
    if (!form.name.trim() || !form.registerNumber.trim() || !form.department || !form.year || !form.gender) {
      showMessage("danger", "⚠️ All fields are required. Please fill in every field.");
      return;
    }

    // Check for duplicate register number
    const isDuplicate = students.some(
      (s) => s.registerNumber.toLowerCase() === form.registerNumber.toLowerCase()
    );
    if (isDuplicate) {
      showMessage("danger", `⚠️ Register number "${form.registerNumber}" already exists. Each student must have a unique register number.`);
      return;
    }

    // ---- Create new student object ----
    const newStudent: Student = {
      id: generateId(),
      name: form.name.trim(),
      registerNumber: form.registerNumber.trim().toUpperCase(),
      department: form.department,
      year: form.year,
      gender: form.gender as "Male" | "Female",
      allocatedRoom: null, // no room allocated yet
    };

    // ---- Update state & localStorage ----
    setStudents((prev) => {
      const updated = [...prev, newStudent];
      localStorage.setItem("hostel_students", JSON.stringify(updated));
      return updated;
    });

    // ---- Reset form ----
    setForm({ ...emptyForm });
    showMessage("success", `✅ Student "${newStudent.name}" (${newStudent.registerNumber}) added successfully!`);
  };

  // ── Handle Delete (show confirmation dialog) ──
  const confirmDelete = (id: string) => {
    setDeleteId(id);
  };

  // ── Execute deletion after confirmation ──
  const handleDelete = () => {
    if (!deleteId) return;

    const student = students.find((s) => s.id === deleteId);

    setStudents((prev) => {
      const updated = prev.filter((s) => s.id !== deleteId);
      localStorage.setItem("hostel_students", JSON.stringify(updated));
      return updated;
    });

    setDeleteId(null);
    showMessage("success", `✅ Student "${student?.name}" has been deleted.`);
  };

  // ── Filtered students based on search query ──
  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.registerNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h2>👨‍🎓 Student Management</h2>
          <p>Add, view, and manage hostel student records.</p>
        </div>
        <span className="badge badge-blue" style={{ fontSize: 14, padding: "8px 16px" }}>
          Total: {students.length} students
        </span>
      </div>

      {/* ── Alert Messages ── */}
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* ── Add Student Form Card ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3>➕ Add New Student</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleAddStudent}>
            <div className="form-grid">

              {/* Student Name */}
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g. Arjun Kumar"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              {/* Register Number */}
              <div className="form-group">
                <label htmlFor="registerNumber">Register Number *</label>
                <input
                  id="registerNumber"
                  name="registerNumber"
                  type="text"
                  placeholder="e.g. 2021CSE001"
                  value={form.registerNumber}
                  onChange={handleChange}
                />
              </div>

              {/* Department */}
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <select
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                >
                  <option value="">-- Select Department --</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div className="form-group">
                <label htmlFor="year">Year *</label>
                <select
                  id="year"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                >
                  <option value="">-- Select Year --</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y} Year</option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div className="form-group">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="">-- Select Gender --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                ➕ Add Student
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

      {/* ── Student List Card ── */}
      <div className="card">
        <div className="card-header">
          <h3>📋 Student Records</h3>
          {/* Search Bar */}
          <input
            type="text"
            placeholder="🔍 Search by name, reg. no., dept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                <th>Name</th>
                <th>Register No.</th>
                <th>Department</th>
                <th>Year</th>
                <th>Gender</th>
                <th>Room Allocated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <span className="empty-icon">👨‍🎓</span>
                      <p>
                        {search ? "No students match your search." : "No students added yet. Use the form above to add students."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr key={student.id}>
                    <td style={{ color: "var(--text-light)" }}>{index + 1}</td>
                    <td>
                      <strong>{student.name}</strong>
                    </td>
                    <td>
                      <code style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: 4, fontSize: 13 }}>
                        {student.registerNumber}
                      </code>
                    </td>
                    <td>{student.department}</td>
                    <td>{student.year} Year</td>
                    <td>
                      <span className={`badge ${student.gender === "Male" ? "badge-blue" : "badge-purple"}`}>
                        {student.gender === "Male" ? "♂ Male" : "♀ Female"}
                      </span>
                    </td>
                    <td>
                      {student.allocatedRoom ? (
                        <span className="allocated-tag">✅ Room {student.allocatedRoom}</span>
                      ) : (
                        <span className="not-allocated-tag">⏳ Not Allocated</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => confirmDelete(student.id)}
                        title="Delete student"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
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
              Are you sure you want to delete{" "}
              <strong>{students.find((s) => s.id === deleteId)?.name}</strong>?
              {students.find((s) => s.id === deleteId)?.allocatedRoom && (
                <><br /><br />
                  <span style={{ color: "var(--danger)" }}>
                    ⚠️ This student has an allocated room. Deleting will also free up that room.
                  </span>
                </>
              )}
              <br /><br />This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                🗑️ Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
