/**
 * types.ts
 * ─────────────────────────────────────────
 * Shared TypeScript type definitions for the
 * Hostel Room Allocation System.
 *
 * These mirror the MongoDB collection schema described in the project spec.
 */

// ---- Student Collection Schema ----
export interface Student {
  id: string;             // unique identifier (simulates MongoDB _id)
  name: string;           // full name of the student
  registerNumber: string; // unique college registration number
  department: string;     // e.g. CSE, ECE, MECH
  year: string;           // 1st / 2nd / 3rd / 4th year
  gender: "Male" | "Female"; // used to match room gender type
  allocatedRoom: string | null; // roomNumber if allocated, else null
}

// ---- Room Collection Schema ----
export interface Room {
  id: string;             // unique identifier
  roomNumber: string;     // e.g. A-101
  floor: string;          // e.g. Ground, 1st, 2nd
  capacity: number;       // max number of students
  occupied: number;       // current number of students in room
  genderType: "Male" | "Female" | "Common"; // which gender can use the room
}

// ---- Allocation Record (derived / join data) ----
export interface Allocation {
  studentId: string;
  studentName: string;
  registerNumber: string;
  roomId: string;
  roomNumber: string;
  allocatedDate: string; // ISO date string
}
