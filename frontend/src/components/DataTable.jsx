'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * DataTable — A sortable, styled data table with hover highlights,
 * alternating row backgrounds, and an empty-state fallback.
 *
 * @param {object} props
 * @param {Array<{key: string, label: string, sortable?: boolean, render?: Function}>} props.columns
 *   Column definitions. `render(cellValue, row)` is called when provided.
 * @param {Array<object>} props.data - Row data objects keyed by column keys.
 * @param {Function} [props.onSort] - Callback invoked with the column key when a sortable header is clicked.
 * @param {string} [props.sortKey] - The currently sorted column key.
 * @param {'asc'|'desc'} [props.sortDir] - The current sort direction.
 * @returns {JSX.Element}
 */
function DataTable({ columns, data, onSort, sortKey, sortDir }) {
  const [hoveredRow, setHoveredRow] = useState(null);

  /* ------------------------------------------------------------------ */
  /*  Styles                                                             */
  /* ------------------------------------------------------------------ */

  const wrapperStyle = {
    overflowX: 'auto',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.06)',
    background: '#12121a',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const theadRowStyle = {
    background: '#12121a',
  };

  const baseTh = {
    padding: '14px 16px',
    textAlign: 'left',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748b',
    fontWeight: 600,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    fontFamily: 'Inter, sans-serif',
    whiteSpace: 'nowrap',
  };

  const sortableWrapperStyle = {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    userSelect: 'none',
  };

  const sortIconContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  };

  const baseTd = {
    padding: '14px 16px',
    fontSize: 14,
    color: '#f1f5f9',
    fontFamily: 'Inter, sans-serif',
  };

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                            */
  /* ------------------------------------------------------------------ */

  /**
   * Returns the inline style for a given <th>, applying active-sort
   * highlighting when the column is the current sort target.
   */
  function getThStyle(column) {
    const isSorted = sortKey === column.key;
    return {
      ...baseTh,
      ...(isSorted ? { color: '#f1f5f9' } : {}),
    };
  }

  /**
   * Returns the inline style for a table row, incorporating hover and
   * zebra-stripe backgrounds.
   */
  function getRowStyle(index) {
    const isHovered = hoveredRow === index;
    const isEven = index % 2 === 0;

    return {
      borderTop: '1px solid rgba(255,255,255,0.04)',
      transition: 'background 0.15s ease',
      background: isHovered
        ? 'rgba(255,255,255,0.08)'
        : isEven
          ? 'rgba(255,255,255,0.05)'
          : 'transparent',
    };
  }

  /**
   * Renders the stacked sort chevrons for a sortable column header.
   * The active-direction icon is highlighted; the other is dimmed.
   */
  function renderSortIcons(columnKey) {
    const isActive = sortKey === columnKey;

    const upStyle = {
      color: isActive && sortDir === 'asc' ? '#f1f5f9' : '#64748b',
      opacity: isActive && sortDir === 'asc' ? 1 : 0.6,
    };

    const downStyle = {
      color: isActive && sortDir === 'desc' ? '#f1f5f9' : '#64748b',
      opacity: isActive && sortDir === 'desc' ? 1 : 0.6,
    };

    return (
      <span style={sortIconContainerStyle}>
        <ChevronUp size={12} style={upStyle} />
        <ChevronDown size={12} style={downStyle} />
      </span>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <div style={wrapperStyle}>
      <table style={tableStyle}>
        {/* -------- Header -------- */}
        <thead>
          <tr style={theadRowStyle}>
            {columns.map((column) => (
              <th
                key={column.key}
                style={getThStyle(column)}
                onClick={
                  column.sortable && onSort
                    ? () => onSort(column.key)
                    : undefined
                }
              >
                {column.sortable ? (
                  <span style={sortableWrapperStyle}>
                    {column.label}
                    {renderSortIcons(column.key)}
                  </span>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>

        {/* -------- Body -------- */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  textAlign: 'center',
                  padding: '48px 16px',
                  color: '#64748b',
                  fontSize: 14,
                }}
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={index}
                style={getRowStyle(index)}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {columns.map((column) => (
                  <td key={column.key} style={baseTd}>
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
