'use client';

import React from 'react';

/**
 * Color mappings for plan statuses.
 * Each key corresponds to a plan lifecycle state.
 */
const PLAN_STATUS_COLORS = {
  generated: '#64748b',
  pending_teacher_validation: '#f59e0b',
  approved: '#3b82f6',
  sent: '#6366f1',
  in_progress: '#c4f20d',
  completed: '#22c55e',
  rejected: '#ef4444',
};

/**
 * Color mappings for priority levels.
 */
const PRIORITY_COLORS = {
  standard: '#64748b',
  low: '#3b82f6',
  medium: '#f59e0b',
  high: '#ef4444',
};

/**
 * Converts a hex color string to an rgba() CSS value.
 *
 * @param {string} hex - A hex color string (e.g. '#3b82f6' or '3b82f6').
 * @param {number} alpha - Opacity value between 0 and 1.
 * @returns {string} An rgba() CSS color string.
 */
function hexToRgba(hex, alpha) {
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Formats a snake_case or underscore-separated string into Title Case.
 *
 * @param {string} str - The raw status/label string (e.g. 'pending_teacher_validation').
 * @returns {string} A human-readable label (e.g. 'Pending Teacher Validation').
 */
function formatLabel(str) {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * StatusBadge — A compact pill/badge component that displays a colored
 * status indicator. Supports both plan statuses and priority levels.
 *
 * @param {object} props
 * @param {string} props.status - The status key to display (e.g. 'approved', 'high').
 * @param {'plan'|'priority'} [props.type='plan'] - Which color map to use.
 * @returns {JSX.Element}
 */
function StatusBadge({ status, type = 'plan' }) {
  const colorMap = type === 'priority' ? PRIORITY_COLORS : PLAN_STATUS_COLORS;
  const color = colorMap[status] || '#64748b';

  const pillStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: 24,
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    background: hexToRgba(color, 0.15),
    color: color,
  };

  return (
    <span style={pillStyle}>
      {formatLabel(status)}
    </span>
  );
}

export default StatusBadge;
