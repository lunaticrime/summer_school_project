'use client';

import { useState } from 'react';
import { GitBranch, ChevronDown, ChevronUp, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

const styles = {
  container: {
    padding: '20px 0 0',
    borderTop: '1px solid var(--border)',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 8,
    marginBottom: 20,
    fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)',
  },
  timeline: {
    position: 'relative',
    paddingLeft: 28,
  },
  timelineLine: {
    position: 'absolute',
    left: 9, top: 8, bottom: 8,
    width: 2,
    background: 'var(--border)',
  },
  versionNode: (isLatest) => ({
    position: 'relative',
    marginBottom: 16,
    padding: '14px 16px',
    background: isLatest ? 'var(--bg-elevated)' : 'var(--bg-card)',
    border: `1px solid ${isLatest ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  }),
  dot: (status) => ({
    position: 'absolute',
    left: -24,
    top: 18,
    width: 12, height: 12,
    borderRadius: '50%',
    background: status === 'rejected' ? 'var(--danger)'
      : status === 'approved' || status === 'sent' || status === 'in_progress' || status === 'completed' ? 'var(--success)'
      : status === 'pending_teacher_validation' ? 'var(--warning)'
      : 'var(--text-muted)',
    border: '2px solid var(--bg-card)',
  }),
  versionBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 'var(--radius-pill)',
    background: 'var(--accent-dim)', color: 'var(--accent)',
    fontSize: '0.7rem', fontWeight: 700,
    fontFamily: 'var(--font-mono)',
  },
  meta: {
    display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
    marginTop: 8,
    fontSize: '0.78rem', color: 'var(--text-muted)',
  },
  teacherComment: {
    marginTop: 10, padding: '10px 14px',
    background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
    borderLeft: '3px solid var(--warning)',
    fontSize: '0.8rem', color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  diffSection: {
    marginTop: 12, padding: '12px 14px',
    background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
    fontSize: '0.78rem',
  },
  diffLabel: {
    fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 6,
  },
  diffRemoved: {
    padding: '4px 8px', borderRadius: 4,
    background: 'var(--danger-dim)', color: 'var(--danger)',
    fontSize: '0.78rem', lineHeight: 1.6,
    textDecoration: 'line-through',
    marginBottom: 4,
  },
  diffAdded: {
    padding: '4px 8px', borderRadius: 4,
    background: 'var(--success-dim)', color: 'var(--success)',
    fontSize: '0.78rem', lineHeight: 1.6,
  },
};

export default function VersionHistory({ versions }) {
  const [expandedVersion, setExpandedVersion] = useState(null);

  if (!versions || versions.length <= 1) {
    return null;
  }

  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);

  const toggleVersion = (v) => {
    setExpandedVersion(expandedVersion === v ? null : v);
  };

  const getPreviousVersion = (currentVersion) => {
    return sortedVersions.find(v => v.version === currentVersion - 1);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <GitBranch size={16} color="var(--accent)" />
        Version History ({sortedVersions.length} versions)
      </div>

      <div style={styles.timeline}>
        <div style={styles.timelineLine} />

        {sortedVersions.map((version, idx) => {
          const isLatest = idx === 0;
          const isExpanded = expandedVersion === version.version;
          const prevVersion = getPreviousVersion(version.version);

          return (
            <div
              key={version.learning_plan_id}
              style={styles.versionNode(isLatest)}
              onClick={() => toggleVersion(version.version)}
              onMouseEnter={(e) => {
                if (!isLatest) e.currentTarget.style.borderColor = 'var(--border-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isLatest) e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <div style={styles.dot(version.status)} />

              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={styles.versionBadge}>v{version.version}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{version.plan_title}</span>
                  {isLatest && (
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 600, padding: '2px 6px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'var(--accent)', color: 'var(--text-inverse)',
                    }}>
                      LATEST
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StatusBadge status={version.status} type="plan" />
                  {isExpanded ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                </div>
              </div>

              {/* Meta */}
              <div style={styles.meta}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} /> {formatDate(version.created_at)}
                </span>
                <span>{version.duration_days} days</span>
                {version.teacher_decision && (
                  <span style={{
                    color: version.teacher_decision === 'approve' ? 'var(--success)'
                      : version.teacher_decision === 'reject' ? 'var(--danger)'
                      : 'var(--warning)',
                    fontWeight: 600,
                  }}>
                    Decision: {version.teacher_decision}
                  </span>
                )}
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div onClick={(e) => e.stopPropagation()}>
                  {/* Teacher comment */}
                  {version.teacher_comment && (
                    <div style={styles.teacherComment}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: 'var(--warning)', fontWeight: 600, fontSize: '0.75rem' }}>
                        <MessageSquare size={12} /> Teacher Comment
                      </div>
                      {version.teacher_comment}
                    </div>
                  )}

                  {/* Diff with previous version */}
                  {prevVersion && (
                    <div style={styles.diffSection}>
                      <div style={styles.diffLabel}>
                        Changes from v{prevVersion.version} <ArrowRight size={10} style={{ verticalAlign: 'middle' }} /> v{version.version}
                      </div>

                      {/* Objective diff */}
                      {prevVersion.objective_summary !== version.objective_summary && (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Objective</div>
                          <div style={styles.diffRemoved}>{prevVersion.objective_summary}</div>
                          <div style={styles.diffAdded}>{version.objective_summary}</div>
                        </div>
                      )}

                      {/* Success criteria diff */}
                      {prevVersion.success_criteria_summary !== version.success_criteria_summary && (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Success Criteria</div>
                          <div style={styles.diffRemoved}>{prevVersion.success_criteria_summary}</div>
                          <div style={styles.diffAdded}>{version.success_criteria_summary}</div>
                        </div>
                      )}

                      {/* Duration diff */}
                      {prevVersion.duration_days !== version.duration_days && (
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Duration</div>
                          <div style={styles.diffRemoved}>{prevVersion.duration_days} days</div>
                          <div style={styles.diffAdded}>{version.duration_days} days</div>
                        </div>
                      )}

                      {prevVersion.objective_summary === version.objective_summary &&
                       prevVersion.success_criteria_summary === version.success_criteria_summary &&
                       prevVersion.duration_days === version.duration_days && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>
                          No text changes detected between these versions.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
