/**
 * storage.ts
 * ─────────────────────────────────────────
 * Utility functions to read & write data from localStorage.
 *
 * In the full-stack version (Node.js + MongoDB), these functions
 * would be replaced by API calls like:
 *   fetch('/api/students')
 *   fetch('/api/students', { method: 'POST', body: JSON.stringify(data) })
 *
 * For this frontend demo, localStorage acts as the persistent store.
 */

import { Student, Room } from "../types";

// ──────────────────────────────────────────────
// SAMPLE / SEED DATA  (Pre-loaded test records)
// ──────────────────────────────────────────────

export const sampleStudents: Student[] = [
  { id: "s1", name: "Arjun Kumar",    registerNumber: "2021CSE001", department: "CSE",  year: "3rd", gender: "Male",   allocatedRoom: null },
  { id: "s2", name: "Priya Sharma",   registerNumber: "2021ECE002", department: "ECE",  year: "3rd", gender: "Female", allocatedRoom: null },
  { id: "s3", name: "Rahul Verma",    registerNumber: "2022MECH003",department: "MECH", year: "2nd", gender: "Male",   allocatedRoom: null },
  { id: "s4", name: "Sneha Reddy",    registerNumber: "2022CSE004", department: "CSE",  year: "2nd", gender: "Female", allocatedRoom: null },
  { id: "s5", name: "Vikram Singh",   registerNumber: "2023IT005",  department: "IT",   year: "1st", gender: "Male",   allocatedRoom: null },
  { id: "s6", name: "Anita Mehra",    registerNumber: "2023EEE006", department: "EEE",  year: "1st", gender: "Female", allocatedRoom: null },
];

export const sampleRooms: Room[] = [
  { id: "r1", roomNumber: "A-101", floor: "Ground", capacity: 3, occupied: 0, genderType: "Male"   },
  { id: "r2", roomNumber: "A-102", floor: "Ground", capacity: 2, occupied: 0, genderType: "Male"   },
  { id: "r3", roomNumber: "B-101", floor: "Ground", capacity: 3, occupied: 0, genderType: "Female" },
  { id: "r4", roomNumber: "B-102", floor: "Ground", capacity: 2, occupied: 0, genderType: "Female" },
  { id: "r5", roomNumber: "C-201", floor: "2nd",    capacity: 4, occupied: 0, genderType: "Male"   },
  { id: "r6", roomNumber: "D-201", floor: "2nd",    capacity: 4, occupied: 0, genderType: "Female" },
];

// ──────────────────────────────────────────────
// STORAGE KEY CONSTANTS
// ──────────────────────────────────────────────
const STUDENTS_KEY   = "hostel_students";
const ROOMS_KEY      = "hostel_rooms";

// ──────────────────────────────────────────────
// STUDENT CRUD HELPERS
// ──────────────────────────────────────────────

/** Read all students from localStorage. Seeds sample data if first run. */
export function getStudents(): Student[] {
  const raw = localStorage.getItem(STUDENTS_KEY);
  if (!raw) {
    // First time — seed with sample data
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(sampleStudents));
    return sampleStudents;
  }
  return JSON.parse(raw) as Student[];
}

/** Save the full students array to localStorage */
export function saveStudents(students: Student[]): void {
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
}

// ──────────────────────────────────────────────
// ROOM CRUD HELPERS
// ──────────────────────────────────────────────

/** Read all rooms from localStorage. Seeds sample data if first run. */
export function getRooms(): Room[] {
  const raw = localStorage.getItem(ROOMS_KEY);
  if (!raw) {
    localStorage.setItem(ROOMS_KEY, JSON.stringify(sampleRooms));
    return sampleRooms;
  }
  return JSON.parse(raw) as Room[];
}

/** Save the full rooms array to localStorage */
export function saveRooms(rooms: Room[]): void {
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
}

// ──────────────────────────────────────────────
// ID GENERATOR
// ──────────────────────────────────────────────

/** Generate a simple unique ID string */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
