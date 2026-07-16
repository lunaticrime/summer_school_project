/**
 * Student-facing service layer.
 *
 * Every function currently returns mock data.
 * To connect to the real backend, replace the marked line with the
 * commented-out fetch() call — a one-line change per function.
 */

import {
  MOCK_STUDENTS,
  MOCK_STUDENT_RESULTS,
  MOCK_SKILL_RESULTS,
  MOCK_LEARNING_PLANS,
  MOCK_ACTIVITIES,
} from './mockData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/** Simulate realistic network latency (200–500 ms). */
const delay = () => new Promise(r => setTimeout(r, 200 + Math.random() * 300));

// ─── getStudentProgress ─────────────────────────────────────────
/**
 * Combines student info + ORCH-01 diagnosis result + WF-03 skill results.
 *
 * @param  {string} studentCode  e.g. "STD001"
 * @return {Promise<{success:boolean, data:object}>}
 */
export async function getStudentProgress(studentCode) {
  await delay();

  // SWAP: replace the block below with ↓
  // const res = await fetch(`${API_BASE}/students/${studentCode}/progress`);
  // return res.json();

  const student = MOCK_STUDENTS.find(s => s.student_code === studentCode);
  const result  = MOCK_STUDENT_RESULTS[studentCode] || null;
  const skills  = MOCK_SKILL_RESULTS[studentCode]   || [];

  if (!student) {
    return { success: false, data: null, error: 'Student not found' };
  }

  return {
    success: true,
    data: {
      student,
      diagnosis: result,
      skills,
    },
  };
}

// ─── getStudentPlan ─────────────────────────────────────────────
/**
 * Gets the active (latest non-rejected) learning plan + its activities
 * for a given student.
 *
 * @param  {string} studentCode  e.g. "STD001"
 * @return {Promise<{success:boolean, data:object|null}>}
 */
export async function getStudentPlan(studentCode) {
  await delay();

  // SWAP: replace the block below with ↓
  // const res = await fetch(`${API_BASE}/students/${studentCode}/plan`);
  // return res.json();

  const plan = MOCK_LEARNING_PLANS
    .filter(p => p.student_code === studentCode && p.status !== 'rejected')
    .sort((a, b) => b.version - a.version)[0] || null;

  if (!plan) {
    return { success: true, data: null };
  }

  const activities = MOCK_ACTIVITIES[plan.learning_plan_id] || [];

  return {
    success: true,
    data: {
      plan,
      activities,
    },
  };
}

// ─── getStudentActivities ───────────────────────────────────────
/**
 * Gets the activity list for a specific plan ID.
 *
 * @param  {number} planId  e.g. 201
 * @return {Promise<{success:boolean, data:object[]}>}
 */
export async function getStudentActivities(planId) {
  await delay();

  // SWAP: replace the block below with ↓
  // const res = await fetch(`${API_BASE}/plans/${planId}/activities`);
  // return res.json();

  const activities = MOCK_ACTIVITIES[planId] || [];

  return {
    success: true,
    data: activities,
  };
}
