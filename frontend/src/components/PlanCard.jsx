'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Check,
  RefreshCw,
  X,
  Clock,
  BookOpen,
  Target,
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const styles = {
  card: {
    background: '#1a1a2e',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: '20px 24px',
    transition: 'border-color 0.2s ease',
  },
  cardHover: {
    borderColor: 'rgba(255,255,255,0.12)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  leftGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  studentName: {
    fontWeight: 600,
    color: '#f1f5f9',
    fontSize: 15,
  },
  planTitle: {
    color: '#94a3b8',
    fontSize: 13,
  },
  centerGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  versionBadge: {
    background: '#252540',
    color: '#94a3b8',
    borderRadius: 24,
    padding: '2px 8px',
    fontSize: 11,
  },
  rightGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
    color: '#94a3b8',
  },
  toggleButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    borderRadius: 4,
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.06)',
    margin: '16px 0',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
  },
  sectionLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748b',
    marginBottom: 6,
  },
  sectionText: {
    color: '#f1f5f9',
    fontSize: 14,
    lineHeight: 1.6,
  },
  activitiesLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748b',
    marginBottom: 12,
    marginTop: 20,
  },
  activityRow: {
    background: '#12121a',
    padding: '14px 16px',
    borderRadius: 8,
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  activityTitle: {
    fontWeight: 500,
    color: '#f1f5f9',
    fontSize: 14,
  },
  activityPills: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  skillPill: {
    background: 'rgba(99,102,241,0.15)',
    color: '#6366f1',
    borderRadius: 24,
    padding: '2px 10px',
    fontSize: 11,
  },
  typePill: {
    background: 'rgba(255,255,255,0.15)',
    color: '#e2e8f0',
    borderRadius: 24,
    padding: '2px 10px',
    fontSize: 11,
  },
  activityRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  activityDuration: {
    color: '#64748b',
    fontSize: 13,
  },
  buttonRow: {
    display: 'flex',
    gap: 10,
    marginTop: 16,
  },
  approveButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    background: 'rgba(34,197,94,0.15)',
    color: '#22c55e',
  },
  regenerateButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    background: 'rgba(245,158,11,0.15)',
    color: '#f59e0b',
  },
  rejectButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    background: 'rgba(239,68,68,0.15)',
    color: '#ef4444',
  },
  textarea: {
    width: '100%',
    background: '#0a0a0f',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#f1f5f9',
    padding: 12,
    fontSize: 13,
    fontFamily: 'Inter',
    resize: 'vertical',
    minHeight: 80,
    marginTop: 12,
    outline: 'none',
    boxSizing: 'border-box',
  },
  confirmRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  cancelButton: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#94a3b8',
    padding: '6px 14px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'Inter',
  },
};

function PlanCard({ plan, activities, onDecision, isExpanded, onToggle }) {
  const [activeAction, setActiveAction] = useState(null);
  const [comment, setComment] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleApprove = () => {
    onDecision(plan.id, 'approved', '');
  };

  const handleActionClick = (action) => {
    setActiveAction(action);
    setComment('');
  };

  const handleCancel = () => {
    setActiveAction(null);
    setComment('');
  };

  const handleConfirm = () => {
    const decision = activeAction === 'reject' ? 'rejected' : 'regenerate';
    onDecision(plan.id, decision, comment);
    setActiveAction(null);
    setComment('');
  };

  const getConfirmButtonStyle = () => {
    if (activeAction === 'reject') {
      return {
        background: 'rgba(239,68,68,0.2)',
        color: '#ef4444',
        border: 'none',
        padding: '6px 14px',
        borderRadius: 6,
        cursor: 'pointer',
        fontSize: 13,
        fontFamily: 'Inter',
      };
    }
    return {
      background: 'rgba(34,197,94,0.2)',
      color: '#22c55e',
      border: 'none',
      padding: '6px 14px',
      borderRadius: 6,
      cursor: 'pointer',
      fontSize: 13,
      fontFamily: 'Inter',
    };
  };

  const showActions =
    isExpanded && plan.status === 'pending_teacher_validation';

  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header / Collapsed State */}
      <div style={styles.header}>
        {/* Left group */}
        <div style={styles.leftGroup}>
          <span style={styles.studentName}>{plan.student_name}</span>
          <span style={styles.planTitle}>{plan.plan_title}</span>
        </div>

        {/* Center group */}
        <div style={styles.centerGroup}>
          <StatusBadge status={plan.status} type="plan" />
          <span style={styles.versionBadge}>v{plan.version}</span>
        </div>

        {/* Right group */}
        <div style={styles.rightGroup}>
          <span style={styles.metaItem}>
            <Clock size={14} color="#64748b" />
            {plan.duration_days} days
          </span>
          <span style={styles.metaItem}>
            <BookOpen size={14} color="#64748b" />
            {activities.length} activities
          </span>
          <button
            style={styles.toggleButton}
            onClick={onToggle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label={isExpanded ? 'Collapse plan details' : 'Expand plan details'}
          >
            {isExpanded ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </button>
        </div>
      </div>

      {/* Expanded State */}
      {isExpanded && (
        <>
          <div style={styles.divider} />

          {/* Objective & Success Criteria */}
          <div style={styles.detailsGrid}>
            <div>
              <div style={styles.sectionLabel}>Objective</div>
              <div style={styles.sectionText}>{plan.objective}</div>
            </div>
            <div>
              <div style={styles.sectionLabel}>Success Criteria</div>
              <div style={styles.sectionText}>{plan.success_criteria}</div>
            </div>
          </div>

          {/* Activities */}
          <div style={styles.activitiesLabel}>Activities</div>
          {activities.map((activity, index) => (
            <div key={index} style={styles.activityRow}>
              <span style={styles.activityTitle}>{activity.title}</span>
              <div style={styles.activityPills}>
                <span style={styles.skillPill}>{activity.skill_targeted}</span>
                <span style={styles.typePill}>{activity.activity_type}</span>
              </div>
              <div style={styles.activityRight}>
                <span style={styles.activityDuration}>
                  {activity.duration_minutes}min
                </span>
                <StatusBadge status={activity.status} />
              </div>
            </div>
          ))}

          {/* Action Buttons */}
          {showActions && (
            <>
              <div style={styles.divider} />
              <div style={styles.buttonRow}>
                <button
                  style={styles.approveButton}
                  onClick={handleApprove}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(34,197,94,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(34,197,94,0.15)';
                  }}
                >
                  <Check size={14} />
                  Approve
                </button>
                <button
                  style={styles.regenerateButton}
                  onClick={() => handleActionClick('regenerate')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(245,158,11,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(245,158,11,0.15)';
                  }}
                >
                  <RefreshCw size={14} />
                  Regenerate
                </button>
                <button
                  style={styles.rejectButton}
                  onClick={() => handleActionClick('reject')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                  }}
                >
                  <X size={14} />
                  Reject
                </button>
              </div>

              {/* Comment Textarea */}
              {activeAction && (
                <div>
                  <textarea
                    style={styles.textarea}
                    placeholder="Add a comment or reason..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <div style={styles.confirmRow}>
                    <button style={styles.cancelButton} onClick={handleCancel}>
                      Cancel
                    </button>
                    <button
                      style={getConfirmButtonStyle()}
                      onClick={handleConfirm}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default PlanCard;
