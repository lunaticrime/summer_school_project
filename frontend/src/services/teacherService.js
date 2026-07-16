/**
 * Teacher-facing service layer.
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

// ─── getPendingPlans ────────────────────────────────────────────
/**
 * Plans awaiting teacher validation (status === "pending_teacher_validation").
 *
 * @param  {string} teacherCode  e.g. "T001"
 * @return {Promise<{success:boolean, data:object[]}>}
 */
export async function getPendingPlans(teacherCode) {
  await delay();

  // SWAP: replace the block below with ↓
  // const res = await fetch(`${API_BASE}/teachers/${teacherCode}/plans?status=pending_teacher_validation`);
  // return res.json();

  const teacherStudents = MOCK_STUDENTS
    .filter(s => s.teacher_code === teacherCode)
    .map(s => s.student_code);

  const pending = MOCK_LEARNING_PLANS.filter(
    p => teacherStudents.includes(p.student_code)
      && p.status === 'pending_teacher_validation',
  );

  return { success: true, data: pending };
}

// ─── getAllPlans ─────────────────────────────────────────────────
/**
 * All plans belonging to students of this teacher.
 *
 * @param  {string} teacherCode  e.g. "T001"
 * @return {Promise<{success:boolean, data:object[]}>}
 */
export async function getAllPlans(teacherCode) {
  await delay();

  // SWAP: replace the block below with ↓
  // const res = await fetch(`${API_BASE}/teachers/${teacherCode}/plans`);
  // return res.json();

  const teacherStudents = MOCK_STUDENTS
    .filter(s => s.teacher_code === teacherCode)
    .map(s => s.student_code);

  const plans = MOCK_LEARNING_PLANS.filter(
    p => teacherStudents.includes(p.student_code),
  );

  return { success: true, data: plans };
}

// ─── getPlanDetail ──────────────────────────────────────────────
/**
 * Full detail for one plan: plan object + activities + student context
 * (diagnosis + skills).
 *
 * @param  {number} planId  e.g. 202
 * @return {Promise<{success:boolean, data:object}>}
 */
export async function getPlanDetail(planId) {
  await delay();

  // SWAP: replace the block below with ↓
  // const res = await fetch(`${API_BASE}/plans/${planId}/detail`);
  // return res.json();

  const plan = MOCK_LEARNING_PLANS.find(p => p.learning_plan_id === planId);

  if (!plan) {
    return { success: false, data: null, error: 'Plan not found' };
  }

  const activities = MOCK_ACTIVITIES[planId] || [];
  const student    = MOCK_STUDENTS.find(s => s.student_code === plan.student_code);
  const diagnosis  = MOCK_STUDENT_RESULTS[plan.student_code] || null;
  const skills     = MOCK_SKILL_RESULTS[plan.student_code]   || [];

  return {
    success: true,
    data: {
      plan,
      activities,
      student_context: {
        student,
        diagnosis,
        skills,
      },
    },
  };
}

// ─── submitDecision ─────────────────────────────────────────────
/**
 * WF-08 shaped: teacher approves or rejects a plan.
 *
 * @param  {number} planId    e.g. 202
 * @param  {string} decision  "approve" | "reject"
 * @param  {string} comment   teacher's feedback
 * @return {Promise<{success:boolean, data:object}>}
 */
export async function submitDecision(planId, decision, comment) {
  await delay();

  // SWAP: replace the block below with ↓
  // const res = await fetch(`${API_BASE}/plans/${planId}/decision`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ decision, comment }),
  // });
  // return res.json();

  // Simulate mutation on the local mock
  const plan = MOCK_LEARNING_PLANS.find(p => p.learning_plan_id === planId);

  if (!plan) {
    return { success: false, data: null, error: 'Plan not found' };
  }

  // Optimistic local update (won't survive page reload, but that's fine for mock)
  plan.teacher_decision = decision;
  plan.teacher_comment  = comment;
  plan.status           = decision === 'approve' ? 'approved' : 'rejected';

  return {
    success: true,
    data: {
      learning_plan_id: plan.learning_plan_id,
      status:           plan.status,
      teacher_decision: decision,
      teacher_comment:  comment,
    },
  };
}

// ─── regeneratePlan ─────────────────────────────────────────────
/**
 * WF-09 shaped: request AI to regenerate a plan with teacher guidance.
 *
 * @param  {number} planId        e.g. 203
 * @param  {string} comment       teacher instructions for regeneration
 * @param  {number} durationDays  new plan duration in days
 * @return {Promise<{success:boolean, data:object}>}
 */
export async function regeneratePlan(planId, comment, durationDays) {
  await delay();

  // SWAP: replace the block below with ↓
  // const res = await fetch(`${API_BASE}/plans/${planId}/regenerate`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ comment, duration_days: durationDays }),
  // });
  // return res.json();

  const original = MOCK_LEARNING_PLANS.find(p => p.learning_plan_id === planId);

  if (!original) {
    return { success: false, data: null, error: 'Plan not found' };
  }

  // --- GROQ API INTEGRATION (DEMO) ---
  // Easy to disable by removing this block when switching back to real backend
  try {
    const groqRes = await fetch('/api/groq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: original, comment }),
    });
    
    if (groqRes.ok) {
      const generatedData = await groqRes.json();
      original.plan_title = generatedData.plan_title || original.plan_title;
      original.objective_summary = generatedData.objective_summary || original.objective_summary;
      original.success_criteria_summary = generatedData.success_criteria_summary || original.success_criteria_summary;
    }
  } catch (error) {
    console.error('Groq demo generation failed:', error);
  }
  // -----------------------------------

  // Simulate a regenerated plan (version bump on the same ID for mock simplicity)
  original.version = (original.version || 1) + 1;
  original.duration_days = durationDays || original.duration_days;
  original.status = 'pending_teacher_validation';
  original.teacher_decision = null;
  original.teacher_comment = null;
  if (!original.plan_title.includes('(Regenerated)')) {
    original.plan_title = `${original.plan_title} (Regenerated)`;
  }

  return {
    success: true,
    data: {
      original_plan_id: planId,
      new_plan:         original,
      teacher_comment:  comment,
    },
  };
}
