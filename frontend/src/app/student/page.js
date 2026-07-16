'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  BookOpen, Target, Clock, CheckCircle2, Circle, PlayCircle,
  TrendingUp, AlertTriangle, Sparkles, ExternalLink, ChevronRight,
  Activity,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ProgressRing from '@/components/ProgressRing';
import SkillBar from '@/components/SkillBar';
import StatusBadge from '@/components/StatusBadge';
import DiagnosisModal from '@/components/DiagnosisModal';
import { getStudentProgress, getStudentPlan } from '@/services/studentService';

const STUDENT_CODE = 'STD001';

export default function StudentPage() {
  const [progress, setProgress] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const pageRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      const [progressRes, planRes] = await Promise.all([
        getStudentProgress(STUDENT_CODE),
        getStudentPlan(STUDENT_CODE),
      ]);
      if (progressRes.success) setProgress(progressRes.data);
      if (planRes.success) setPlan(planRes.data);
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!loading && pageRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.student-card',
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power3.out',
          }
        );
      }, pageRef);
      return () => ctx.revert();
    }
  }, [loading]);

  if (loading) {
    return (
      <>
        <Sidebar activeRole="student" />
        <main className="main-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div className="loading-spinner" />
          </div>
        </main>
      </>
    );
  }

  const diagnosis = progress?.diagnosis;
  const skills = progress?.skills || [];
  const activities = plan?.activities || [];
  const completedActivities = activities.filter(a => a.activity_status === 'completed').length;
  const totalActivities = activities.length;

  return (
    <>
      <Sidebar activeRole="student" />
      <main className="main-content" ref={pageRef}>
        {/* Page Header */}
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-lg)',
              background: 'var(--accent-dim)', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <Activity size={22} color="var(--accent)" />
            </div>
            <div>
              <h1>Student Progress</h1>
              <p>Welcome back, {progress?.student?.full_name || 'Student'} · {progress?.student?.class_code}</p>
            </div>
          </div>
        </div>

        {/* Top Section: Progress Ring + Diagnosis */}
        <div className="student-card" style={{
          display: 'grid', gridTemplateColumns: '260px 1fr', gap: 'var(--space-6)',
          marginBottom: 'var(--space-6)',
        }}>
          {/* Progress Ring Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
            <ProgressRing
              percentage={diagnosis?.global_score || 0}
              size={170}
              strokeWidth={14}
              label="Overall Score"
            />
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <StatusBadge status={diagnosis?.priority_level} type="priority" />
            </div>
          </div>

          {/* Diagnosis Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} color="var(--accent)" />
                AI Diagnosis
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Model: {diagnosis?.model_name}
                </span>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '4px 10px', fontSize: '0.75rem', color: 'var(--accent)' }}
                  onClick={() => setShowDiagnosisModal(true)}
                >
                  <Activity size={14} /> Deep Dive
                </button>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16, lineHeight: 1.7 }}>
              {diagnosis?.diagnosis_summary}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{
                background: 'var(--success-dim)', borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={14} /> Strengths
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {diagnosis?.diagnosis_strengths}
                </div>
              </div>

              <div style={{
                background: 'var(--danger-dim)', borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={14} /> Weaknesses
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {diagnosis?.diagnosis_weaknesses}
                </div>
              </div>
            </div>

            {diagnosis?.pedagogical_impact && (
              <div style={{
                marginTop: 16, padding: '10px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)', fontSize: '0.8rem', color: 'var(--text-secondary)',
                borderLeft: '3px solid var(--warning)',
              }}>
                <strong style={{ color: 'var(--warning)' }}>Impact:</strong> {diagnosis.pedagogical_impact}
              </div>
            )}
          </div>
        </div>

        {/* Skill Breakdown */}
        <div className="student-card card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={18} color="var(--accent)" />
              Skill Breakdown
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {skills.length} skills assessed
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {skills.map((skill, index) => (
              <SkillBar
                key={skill.skill_code}
                skillName={skill.skill_name}
                percentage={skill.percentage}
                gapLevel={skill.gap_level}
                animated={true}
                delay={index * 0.1}
              />
            ))}
          </div>

          <div style={{
            display: 'flex', gap: 16, marginTop: 20, paddingTop: 16,
            borderTop: '1px solid var(--border)',
          }}>
            {[
              { label: 'Mastered', color: '#22c55e', level: 'mastered' },
              { label: 'Fragile', color: '#f59e0b', level: 'fragile' },
              { label: 'Gap', color: '#f97316', level: 'gap' },
              { label: 'Critical', color: '#ef4444', level: 'critical_gap' },
            ].map(item => (
              <div key={item.level} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                {item.label} ({skills.filter(s => s.gap_level === item.level).length})
              </div>
            ))}
          </div>
        </div>

        {/* Learning Plan & Activities */}
        {plan && (
          <div className="student-card card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={18} color="var(--accent)" />
                Learning Plan
              </div>
              <StatusBadge status={plan.status} type="plan" />
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16,
              marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>Plan</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{plan.plan_title}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>Duration</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={14} color="var(--text-secondary)" /> {plan.duration_days} days
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>Progress</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{completedActivities}/{totalActivities} activities</div>
              </div>
            </div>

            {/* Objective */}
            <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>Objective</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{plan.objective_summary}</div>
            </div>

            {/* Activity Progress Bar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Completion</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)' }}>{plan.completion_rate}%</span>
              </div>
              <div style={{
                height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${plan.completion_rate}%`,
                  background: 'linear-gradient(90deg, var(--accent), #a8d90a)',
                  borderRadius: 4, transition: 'width 0.6s ease',
                }} />
              </div>
            </div>

            {/* Activities List */}
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Activities
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activities.map((activity) => {
                const statusIcon = activity.activity_status === 'completed'
                  ? <CheckCircle2 size={18} color="var(--success)" />
                  : activity.activity_status === 'in_progress'
                    ? <PlayCircle size={18} color="var(--accent)" />
                    : <Circle size={18} color="var(--text-muted)" />;

                return (
                  <div key={activity.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', background: activity.activity_status === 'in_progress' ? 'var(--accent-dim)' : 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: activity.activity_status === 'in_progress' ? '1px solid var(--border-accent)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                  }}>
                    {statusIcon}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.875rem', fontWeight: 500,
                        color: activity.activity_status === 'completed' ? 'var(--text-secondary)' : 'var(--text-primary)',
                        textDecoration: activity.activity_status === 'completed' ? 'line-through' : 'none',
                      }}>
                        {activity.title}
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {activity.skill_code}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {activity.resource_type} · {activity.estimated_minutes}min
                        </span>
                      </div>
                    </div>

                    {activity.activity_status === 'in_progress' && (
                      <div style={{
                        fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)',
                        minWidth: 40, textAlign: 'right',
                      }}>
                        {activity.completion_percentage}%
                      </div>
                    )}

                    <a
                      href={activity.resource_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', padding: 6,
                        borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)',
                        transition: 'color 0.2s',
                      }}
                      title="Open resource"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                );
              })}
            </div>

            {/* Success Criteria */}
            {plan.success_criteria_summary && (
              <div style={{
                marginTop: 20, padding: '10px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--secondary-dim)', fontSize: '0.8rem', color: 'var(--text-secondary)',
                borderLeft: '3px solid var(--secondary)',
              }}>
                <strong style={{ color: 'var(--secondary)' }}>Success Criteria:</strong> {plan.success_criteria_summary}
              </div>
            )}
          </div>
        )}
      </main>

      {showDiagnosisModal && progress && (
        <DiagnosisModal
          studentName={progress.student_info.full_name}
          subject="Python"
          diagnosis={progress.diagnosis}
          skills={progress.skills}
          onClose={() => setShowDiagnosisModal(false)}
        />
      )}
    </>
  );
}
