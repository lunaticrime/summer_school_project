'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Color mapping for knowledge gap levels.
 * Each level maps to a specific color to visually communicate
 * the learner's mastery status at a glance.
 */
const GAP_LEVEL_COLORS = {
  mastered: '#22c55e',
  fragile: '#f59e0b',
  gap: '#f97316',
  critical_gap: '#ef4444',
};

const DEFAULT_COLOR = '#6366f1';

/**
 * SkillBar — Horizontal progress bar representing a learner's proficiency
 * in a particular skill, with animated fill and contextual gap-level badge.
 *
 * @param {string}  skillName  - Display name of the skill
 * @param {number}  percentage - Current proficiency percentage (0–100)
 * @param {string}  gapLevel   - One of 'mastered', 'fragile', 'gap', 'critical_gap'
 * @param {boolean} animated   - Whether to animate the bar fill on mount (default true)
 */
function SkillBar({ skillName, percentage, gapLevel, animated = true }) {
  const fillRef = useRef(null);

  const color = GAP_LEVEL_COLORS[gapLevel] || DEFAULT_COLOR;

  useEffect(() => {
    if (!animated || !fillRef.current) return;

    // Start from zero width and animate to target percentage
    gsap.set(fillRef.current, { width: '0%' });

    const tween = gsap.to(fillRef.current, {
      width: percentage + '%',
      duration: 1,
      ease: 'power2.out',
    });

    return () => {
      tween.kill();
    };
  }, [animated, percentage]);

  // Format gap level for display: replace underscores with spaces
  const formattedGapLevel = gapLevel ? gapLevel.replace(/_/g, ' ') : '';

  return (
    <div style={styles.container}>
      {/* Label row */}
      <div style={styles.labelRow}>
        <span style={styles.skillName}>{skillName}</span>
        <div style={styles.rightGroup}>
          <span style={styles.percentageText}>{percentage}%</span>
          {gapLevel && (
            <span
              style={{
                ...styles.badge,
                backgroundColor: `${color}26`, // 15% opacity (hex ~26)
                color: color,
              }}
            >
              {formattedGapLevel}
            </span>
          )}
        </div>
      </div>

      {/* Bar track */}
      <div style={styles.barContainer}>
        <div
          ref={fillRef}
          style={{
            ...styles.fillBar,
            backgroundColor: color,
            width: animated ? '0%' : percentage + '%',
          }}
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    marginBottom: 16,
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillName: {
    fontSize: 14,
    color: '#f1f5f9',
    fontWeight: 500,
  },
  rightGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  percentageText: {
    fontSize: 14,
    color: '#f1f5f9',
    fontWeight: 600,
  },
  badge: {
    display: 'inline-flex',
    padding: '2px 10px',
    borderRadius: 24,
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'capitalize',
  },
  barContainer: {
    width: '100%',
    height: 8,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fillBar: {
    height: '100%',
    borderRadius: 4,
  },
};

export default SkillBar;
