/**
 * Dashboard analytics service layer.
 *
 * Every function currently returns mock data.
 * To connect to the real backend, replace the marked line with the
 * commented-out fetch() call — a one-line change per function.
 */

import { MOCK_DASHBOARD } from './mockData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/** Simulate realistic network latency (200–500 ms). */
const delay = () => new Promise(r => setTimeout(r, 200 + Math.random() * 300));

// ─── getDashboardData ───────────────────────────────────────────
/**
 * Returns WF-12 shaped dashboard analytics:
 *   { summary, priority_distribution, plan_status_distribution,
 *     skill_gap_distribution, students }
 *
 * @param  {object} [filters]                Optional filter bag
 * @param  {string} [filters.priority]       e.g. "high"
 * @param  {string} [filters.plan_status]    e.g. "in_progress"
 * @param  {string} [filters.class_code]     e.g. "L1-INFO-A"
 * @param  {string} [filters.search]         free-text student name search
 * @return {Promise<{success:boolean, data:object}>}
 */
export async function getDashboardData(filters = {}) {
  await delay();

  // SWAP: replace the block below with ↓
  // const params = new URLSearchParams(filters).toString();
  // const res = await fetch(`${API_BASE}/dashboard?${params}`);
  // return res.json();

  // Deep-clone so filters never mutate the original mock
  const data = JSON.parse(JSON.stringify(MOCK_DASHBOARD));

  // ── Client-side filtering (simulates backend query params) ──
  let students = data.students;

  if (filters.priority) {
    students = students.filter(s => s.priority_level === filters.priority);
  }
  if (filters.plan_status) {
    students = students.filter(s => s.plan_status === filters.plan_status);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    students = students.filter(
      s => s.student_name.toLowerCase().includes(q)
        || s.student_code.toLowerCase().includes(q),
    );
  }
  // Note: class_code filter is not available in MOCK_DASHBOARD.students,
  // but is included in the filter bag for when the real API handles it.

  data.students = students;

  return {
    success: true,
    data,
  };
}
