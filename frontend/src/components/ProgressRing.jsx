'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * ProgressRing — An SVG-based circular progress indicator with animated
 * stroke drawing, a subtle glow effect, and centered percentage / label text.
 *
 * @param {number} percentage  - Progress value from 0 to 100 (default 0)
 * @param {number} size        - Diameter of the SVG in pixels (default 180)
 * @param {number} strokeWidth - Thickness of the ring stroke (default 12)
 * @param {string} label       - Descriptive label rendered below the percentage (default '')
 */
function ProgressRing({ percentage = 0, size = 180, strokeWidth = 12, label = '' }) {
  const progressRef = useRef(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    if (!progressRef.current) return;

    // Animate strokeDashoffset from full circumference (empty) to target
    progressRef.current.setAttribute('stroke-dashoffset', circumference);

    const tween = gsap.to(progressRef.current, {
      attr: { 'stroke-dashoffset': targetOffset },
      duration: 1.5,
      ease: 'power2.out',
    });

    return () => {
      tween.kill();
    };
  }, [circumference, targetOffset]);

  return (
    <div style={styles.wrapper}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          fill="none"
          strokeWidth={strokeWidth}
        />

        {/* Animated progress arc */}
        <circle
          ref={progressRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#c4f20d"
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: 'drop-shadow(0 0 6px rgba(196,242,13,0.4))' }}
        />

        {/* Center percentage number */}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontSize: size * 0.2,
            fontWeight: 700,
            fill: '#f1f5f9',
            fontFamily: 'Space Grotesk',
          }}
        >
          {percentage}%
        </text>

        {/* Label text below the percentage */}
        {label && (
          <text
            x={size / 2}
            y={size / 2 + size * 0.12}
            textAnchor="middle"
            style={{
              fontSize: size * 0.07,
              fill: '#94a3b8',
              fontFamily: 'Inter',
            }}
          >
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'inline-flex',
    position: 'relative',
  },
};

export default ProgressRing;
