'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const trendConfig = {
  up: { icon: TrendingUp, color: '#22c55e' },
  down: { icon: TrendingDown, color: '#ef4444' },
  neutral: { icon: Minus, color: '#64748b' },
};

const styles = {
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 24,
    border: '1px solid rgba(255,255,255,0.06)',
    cursor: 'default',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  cardHovered: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  topRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    minWidth: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: 500,
    color: '#94a3b8',
    lineHeight: 1.3,
  },
  value: {
    fontSize: 32,
    fontWeight: 700,
    color: '#f1f5f9',
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    lineHeight: 1.1,
    letterSpacing: '-0.5px',
  },
  trendRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trendValue: {
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: 400,
    lineHeight: 1.4,
  },
  bottomSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
};

/**
 * Extracts a numeric value and surrounding formatting from a display string.
 * e.g. "$1,234.5" → { prefix: "$", numericValue: 1234.5, suffix: "" }
 *      "89%"      → { prefix: "", numericValue: 89, suffix: "%" }
 *      "12.4k"    → { prefix: "", numericValue: 12.4, suffix: "k" }
 */
function parseDisplayValue(val) {
  if (typeof val === 'number') {
    return { prefix: '', numericValue: val, suffix: '', decimals: 0 };
  }

  const str = String(val);
  // Match optional prefix (non-digit, non-dot, non-comma, non-minus chars),
  // then the numeric part (digits, dots, commas, minus),
  // then optional suffix
  const match = str.match(/^([^0-9.,\-]*)([\-]?[\d,]*\.?\d+)(.*)$/);
  if (!match) {
    return null; // Not a parseable number
  }

  const prefix = match[1];
  const rawNumber = match[2].replace(/,/g, '');
  const suffix = match[3];
  const numericValue = parseFloat(rawNumber);

  if (isNaN(numericValue)) {
    return null;
  }

  // Determine decimal places from original value
  const dotIndex = match[2].replace(/,/g, '').indexOf('.');
  const decimals = dotIndex >= 0 ? match[2].replace(/,/g, '').length - dotIndex - 1 : 0;

  return { prefix, numericValue, suffix, decimals };
}

/**
 * Formats a number with commas for thousands separators.
 */
function formatWithCommas(num, decimals) {
  const fixed = num.toFixed(decimals);
  const parts = fixed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, accentColor = '#c4f20d' }) {
  const [isHovered, setIsHovered] = useState(false);
  const valueRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const parsed = parseDisplayValue(value);

    if (!parsed || !valueRef.current) {
      // Not a number — just display the raw value
      if (valueRef.current) {
        valueRef.current.innerText = String(value);
      }
      return;
    }

    const { prefix, numericValue, suffix, decimals } = parsed;
    const proxy = { val: 0 };

    animationRef.current = gsap.to(proxy, {
      val: numericValue,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate() {
        if (valueRef.current) {
          valueRef.current.innerText =
            prefix + formatWithCommas(proxy.val, decimals) + suffix;
        }
      },
      onComplete() {
        // Ensure final value is exact
        if (valueRef.current) {
          valueRef.current.innerText =
            prefix + formatWithCommas(numericValue, decimals) + suffix;
        }
      },
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [value]);

  const cardStyle = {
    ...styles.card,
    ...(isHovered ? styles.cardHovered : {}),
  };

  const iconContainerStyle = {
    ...styles.iconContainer,
    backgroundColor: accentColor + '26', // 15% opacity hex suffix
  };

  // Resolve trend indicator
  const trendInfo = trend && trendConfig[trend] ? trendConfig[trend] : null;
  const TrendIcon = trendInfo ? trendInfo.icon : null;
  const trendColor = trendInfo ? trendInfo.color : '#64748b';

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Row: Icon + Title */}
      <div style={styles.topRow}>
        {Icon && (
          <div style={iconContainerStyle}>
            <Icon size={22} color={accentColor} strokeWidth={1.8} />
          </div>
        )}
        <span style={styles.title}>{title}</span>
      </div>

      {/* Value + Trend + Subtitle */}
      <div style={styles.bottomSection}>
        <span ref={valueRef} style={styles.value}>
          0
        </span>

        {trendInfo && trendValue && (
          <div style={styles.trendRow}>
            <TrendIcon size={15} color={trendColor} strokeWidth={2.2} />
            <span style={{ ...styles.trendValue, color: trendColor }}>
              {trendValue}
            </span>
          </div>
        )}

        {subtitle && <span style={styles.subtitle}>{subtitle}</span>}
      </div>
    </div>
  );
}

export default KPICard;
