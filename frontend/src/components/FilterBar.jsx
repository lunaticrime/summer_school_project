'use client';

import { Filter, X } from 'lucide-react';

const CHEVRON_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E`;

const FILTER_CONFIGS = [
  { key: 'class_code', placeholder: 'Class Code' },
  { key: 'assessment_code', placeholder: 'Assessment' },
  { key: 'subject', placeholder: 'Subject' },
  { key: 'priority_level', placeholder: 'Priority' },
  { key: 'plan_status', placeholder: 'Status' },
];

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    padding: '12px 0',
  },
  filterLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: '#64748b',
    fontSize: 13,
    fontWeight: 500,
    marginRight: 4,
  },
  select: {
    background: '#1a1a2e',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 8,
    color: '#f1f5f9',
    padding: '8px 32px 8px 12px',
    fontSize: 13,
    fontFamily: 'Inter',
    minWidth: 140,
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundImage: `url("${CHEVRON_SVG}")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    backgroundSize: '12px',
  },
  selectActive: {
    borderColor: 'rgba(196,242,13,0.3)',
  },
  clearButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#94a3b8',
    borderRadius: 8,
    padding: '8px 14px',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'Inter',
    transition: 'all 0.2s ease',
  },
};

function FilterBar({ filters, onFilterChange, options }) {
  const handleChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const handleClearAll = () => {
    onFilterChange({});
  };

  return (
    <div style={styles.container}>
      <span style={styles.filterLabel}>
        <Filter size={16} />
        Filters
      </span>

      {FILTER_CONFIGS.map((config) => {
        const isActive = filters[config.key] && filters[config.key] !== '';
        const filterOptions = (options && options[config.key]) || [];

        return (
          <select
            key={config.key}
            style={{
              ...styles.select,
              ...(isActive ? styles.selectActive : {}),
            }}
            value={filters[config.key] || ''}
            onChange={(e) => handleChange(config.key, e.target.value)}
          >
            <option value="">{config.placeholder}</option>
            {filterOptions.map((opt, index) => (
              <option key={index} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      })}

      <button
        style={styles.clearButton}
        onClick={handleClearAll}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#f1f5f9';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#94a3b8';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        }}
      >
        <X size={14} />
        Clear All
      </button>
    </div>
  );
}

export default FilterBar;
