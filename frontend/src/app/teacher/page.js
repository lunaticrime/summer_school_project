'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  ClipboardCheck, User, Calendar, BookOpen, Clock, Target,
  CheckCircle, RefreshCw, XCircle, ChevronDown, ChevronUp,
  ExternalLink, MessageSquare, Send, Filter,
  FileText, Layers, GitBranch, Activity, Sparkles,
  Upload, ChevronRight,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import StatusBadge from '@/components/StatusBadge';
import SkillBar from '@/components/SkillBar';
import VersionHistory from '@/components/VersionHistory';
import DiagnosisModal from '@/components/DiagnosisModal';
import NotificationTracker from '@/components/NotificationTracker';
import { getAllPlans, getPlanDetail, submitDecision, regeneratePlan, getPlanVersions } from '@/services/teacherService';

const TEACHER_CODE = 'T001';

export default function TeacherPage() {
  const [plans, setPlans] = useState([]);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [planDetail, setPlanDetail] = useState(null);
  const [planVersions, setPlanVersions] = useState(null);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [actionState, setActionState] = useState({ planId: null, action: null, comment: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const pageRef = useRef(null);

  useEffect(() => {
    async function loadPlans() {
      const res = await getAllPlans(TEACHER_CODE);
      if (res.success) setPlans(res.data);
      setLoading(false);
    }
    loadPlans();
  }, []);

  useEffect(() => {
    if (!loading && pageRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.teacher-card', 
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.06,
            ease: 'power3.out',
          }
        );
      }, pageRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const handleExpand = async (planId, planCode) => {
    if (expandedPlan === planId) {
      setExpandedPlan(null);
      setPlanDetail(null);
      setPlanVersions(null);
      setActionState({ planId: null, action: null, comment: '' });
      return;
    }
    setExpandedPlan(planId);
    setDetailLoading(true);

    const [detailRes, versionsRes] = await Promise.all([
      getPlanDetail(planId),
      getPlanVersions(planCode)
    ]);
    
    if (detailRes.success) setPlanDetail(detailRes.data);
    if (versionsRes.success) setPlanVersions(versionsRes.data);
    
    setDetailLoading(false);
    setActionState({ planId: null, action: null, comment: '' });
  };

  const handleAction = async () => {
    if (!actionState.planId || !actionState.action) return;
    setActionLoading(true);

    if (actionState.action === 'regenerate') {
      await regeneratePlan(actionState.planId, actionState.comment);
    } else {
      await submitDecision(actionState.planId, actionState.action, actionState.comment);
    }

    // Refresh plans
    const res = await getAllPlans(TEACHER_CODE);
    if (res.success) setPlans(res.data);
    setActionState({ planId: null, action: null, comment: '' });
    setActionLoading(false);
    setToastMessage(`Plan ${actionState.action}ed successfully`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredPlans = activeFilter === 'all'
    ? plans
    : plans.filter(p => p.status === activeFilter);

  const statusCounts = {
    all: plans.length,
    pending_teacher_validation: plans.filter(p => p.status === 'pending_teacher_validation').length,
    approved: plans.filter(p => p.status === 'approved').length,
    rejected: plans.filter(p => p.status === 'rejected').length,
    sent: plans.filter(p => p.status === 'sent').length,
    in_progress: plans.filter(p => p.status === 'in_progress').length,
  };

  if (loading) {
    return (
      <>
        <Sidebar activeRole="teacher" />
        <main className="main-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div className="loading-spinner" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Sidebar activeRole="teacher" />
      <main className="main-content" ref={pageRef}>
        {/* Page Header */}
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-lg)',
              background: 'var(--secondary-dim)', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <ClipboardCheck size={22} color="var(--secondary)" />
            </div>
            <div>
              <h1>Plan Review</h1>
              <p>Review, approve, or request changes to AI-generated learning plans</p>
            </div>
          </div>
        </div>

        {/* Bulk Import Shortcut */}
        <div className="admin-card card" style={{
          marginBottom: 24,
          padding: 0, overflow: 'hidden',
          cursor: 'pointer',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
          onClick={() => window.location.href = '/admin/import'}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '20px 24px',
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-lg)',
              background: 'var(--accent-dim)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Upload size={22} color="var(--accent)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 2 }}>
                Bulk Import Student Marks
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Upload a CSV file to validate and prepare data for the WF-01 backend pipeline
              </div>
            </div>
            <ChevronRight size={20} color="var(--text-muted)" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-6)', alignItems: 'start' }}>
          <div>
            {/* Filter Tabs */}
            <div style={{
          display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap',
        }}>
          {[
            { key: 'all', label: 'All Plans' },
            { key: 'pending_teacher_validation', label: 'Pending Review' },
            { key: 'approved', label: 'Approved' },
            { key: 'sent', label: 'Sent' },
            { key: 'in_progress', label: 'In Progress' },
            { key: 'rejected', label: 'Rejected' },
          ].map(tab => (
            <button
              key={tab.key}
              className={`btn ${activeFilter === tab.key ? 'btn-primary' : 'btn-ghost'} btn-sm`}
              onClick={() => setActiveFilter(tab.key)}
              style={{ borderRadius: 'var(--radius-pill)' }}
            >
              {tab.label}
              <span style={{
                marginLeft: 6, padding: '1px 8px', borderRadius: 'var(--radius-pill)',
                background: activeFilter === tab.key ? 'rgba(0,0,0,0.2)' : 'var(--bg-elevated)',
                fontSize: '0.7rem',
              }}>
                {statusCounts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Plan Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredPlans.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No plans found matching the current filter.
            </div>
          )}

          {filteredPlans.map((plan) => {
            const isExpanded = expandedPlan === plan.learning_plan_id;
            const isPending = plan.status === 'pending_teacher_validation';

            return (
              <div key={plan.learning_plan_id} className="teacher-card card" style={{
                borderLeft: isPending ? '3px solid var(--warning)' : '3px solid transparent',
                padding: 0,
                overflow: 'hidden',
              }}>
                {/* Collapsed Header */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                    cursor: 'pointer', transition: 'background 0.2s',
                  }}
                  onClick={() => handleExpand(plan.learning_plan_id, plan.plan_code)}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-elevated)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)',
                  }}>
                    {plan.student_name?.split(' ').map(n => n[0]).join('')}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{plan.student_name}</span>
                      <StatusBadge status={plan.status} type="plan" />
                      {plan.version > 1 && (
                        <span style={{
                          fontSize: '0.7rem', color: 'var(--text-muted)',
                          padding: '1px 6px', background: 'var(--bg-elevated)',
                          borderRadius: 'var(--radius-pill)', display: 'flex', alignItems: 'center', gap: 4
                        }}>
                          <GitBranch size={10} /> v{plan.version}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {plan.plan_title}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Score</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{plan.global_score}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Days</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{plan.duration_days}</div>
                    </div>
                    <StatusBadge status={plan.priority_level} type="priority" />
                    {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div style={{
                    borderTop: '1px solid var(--border)', padding: '20px',
                    background: 'var(--bg-surface)',
                  }}>
                    {detailLoading ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                        <div className="loading-spinner" />
                      </div>
                    ) : planDetail ? (
                      <>
                        {/* Plan Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                          <div style={{ padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>Objective</div>
                              {planVersions && planVersions.length > 1 && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <GitBranch size={12} /> {planVersions.length} versions
                                </div>
                              )}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{planDetail.plan?.objective_summary || planDetail.objective_summary}</div>
                          </div>
                          <div style={{ padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600, marginBottom: 4 }}>Success Criteria</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{planDetail.plan?.success_criteria_summary || planDetail.success_criteria_summary}</div>
                          </div>
                        </div>

                        {/* Student Skills */}
                        {planDetail.student_context?.skills && (
                          <div style={{ marginBottom: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Student Context & Skills
                              </div>
                              <button
                                className="btn btn-ghost"
                                style={{ padding: '4px 10px', fontSize: '0.75rem', color: 'var(--accent)' }}
                                onClick={() => setShowDiagnosisModal(true)}
                              >
                                <Sparkles size={14} /> AI Insights
                              </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {planDetail.student_context.skills.map(skill => (
                                <SkillBar
                                  key={skill.skill_code}
                                  skillName={skill.skill_name}
                                  percentage={skill.percentage}
                                  gapLevel={skill.gap_level}
                                  animated={false}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Activities */}
                        <div style={{ marginBottom: 20 }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Plan Activities ({planDetail.activities?.length || 0})
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {planDetail.activities?.map((activity, i) => (
                              <div key={activity.id} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '10px 14px', background: 'var(--bg-card)',
                                borderRadius: 'var(--radius-md)',
                              }}>
                                <span style={{
                                  width: 24, height: 24, borderRadius: 'var(--radius-full)',
                                  background: 'var(--bg-elevated)', display: 'flex',
                                  alignItems: 'center', justifyContent: 'center',
                                  fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0,
                                }}>
                                  {i + 1}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{activity.title}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                    {activity.skill_code} · {activity.resource_type} · {activity.estimated_minutes}min
                                  </div>
                                </div>
                                <a href={activity.resource_url} target="_blank" rel="noopener noreferrer"
                                  style={{ color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
                                  <ExternalLink size={14} />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Teacher Comment (if exists) */}
                        {planDetail.teacher_comment && (
                          <div style={{
                            padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
                            marginBottom: 20, borderLeft: '3px solid var(--secondary)',
                          }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600, marginBottom: 4 }}>
                              Teacher Comment
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              {planDetail.teacher_comment}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons (only for pending plans) */}
                        {isPending && (
                          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                            {actionState.planId === plan.learning_plan_id && actionState.action ? (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                  <MessageSquare size={16} color="var(--text-secondary)" />
                                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                    {actionState.action === 'approve' ? 'Add comment (optional)' : 'Comment (required)'}
                                  </span>
                                </div>
                                <textarea
                                  className="textarea"
                                  placeholder={actionState.action === 'regenerate'
                                    ? 'What changes should the AI make? e.g. "Reduce to 5 days, add more exercises"'
                                    : actionState.action === 'reject'
                                      ? 'Reason for rejection...'
                                      : 'Optional comment...'}
                                  value={actionState.comment}
                                  onChange={(e) => setActionState(s => ({ ...s, comment: e.target.value }))}
                                  style={{ marginBottom: 12 }}
                                />
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button
                                    className={`btn ${actionState.action === 'approve' ? 'btn-success' : actionState.action === 'regenerate' ? 'btn-warning' : 'btn-danger'}`}
                                    onClick={handleAction}
                                    disabled={actionLoading || ((actionState.action === 'regenerate' || actionState.action === 'reject') && !actionState.comment.trim())}
                                    style={{ opacity: actionLoading ? 0.6 : 1 }}
                                  >
                                    {actionLoading ? <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <Send size={14} />}
                                    Confirm {actionState.action}
                                  </button>
                                  <button
                                    className="btn btn-ghost"
                                    onClick={() => setActionState({ planId: null, action: null, comment: '' })}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn btn-success" onClick={() => setActionState({ planId: plan.learning_plan_id, action: 'approve', comment: '' })}>
                                  <CheckCircle size={16} /> Approve
                                </button>
                                <button className="btn btn-warning" onClick={() => setActionState({ planId: plan.learning_plan_id, action: 'regenerate', comment: '' })}>
                                  <RefreshCw size={16} /> Regenerate
                                </button>
                                <button className="btn btn-danger" onClick={() => setActionState({ planId: plan.learning_plan_id, action: 'reject', comment: '' })}>
                                  <XCircle size={16} /> Reject
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Version History timeline */}
                        <VersionHistory versions={planVersions} />
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredPlans.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No plans found matching the current filter.
          </div>
        )}
        </div>

        <div style={{ position: 'sticky', top: 24 }}>
          <NotificationTracker />
        </div>
      </div>
        {/* Toast */}
        {toastMessage && (
          <div style={{
            position: 'fixed', bottom: 24, right: 24,
            background: 'var(--success)', color: 'white',
            padding: '12px 20px', borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem', fontWeight: 500,
            boxShadow: 'var(--shadow-lg)', zIndex: 1000,
            animation: 'fadeInUp 0.3s ease',
          }}>
            <CheckCircle size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            {toastMessage}
          </div>
        )}
      </main>

      {showDiagnosisModal && planDetail?.student_context && (
        <DiagnosisModal
          studentName={planDetail.student_context.student?.full_name}
          subject={planDetail.plan?.subject || planDetail.subject}
          diagnosis={planDetail.student_context.diagnosis}
          skills={planDetail.student_context.skills}
          onClose={() => setShowDiagnosisModal(false)}
        />
      )}
    </>
  );
}
