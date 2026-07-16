'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  LayoutDashboard, Users, AlertTriangle, FileCheck, Send as SendIcon,
  TrendingUp, Clock, CheckCircle2, BarChart3, PieChart,
  ArrowUpRight, ArrowDownRight, Minus, ChevronUp, ChevronDown,
  Search, X, Upload, ChevronRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RPieChart, Pie, Cell, Legend,
} from 'recharts';
import Sidebar from '@/components/Sidebar';
import KPICard from '@/components/KPICard';
import StatusBadge from '@/components/StatusBadge';
import NotificationTracker from '@/components/NotificationTracker';
import FilterBar from '@/components/FilterBar';
import { getDashboardData } from '@/services/dashboardService';

const CHART_COLORS = {
  // Priority
  standard: '#64748b',
  low: '#3b82f6',
  medium: '#f59e0b',
  high: '#ef4444',
  // Plan status
  generated: '#64748b',
  pending_teacher_validation: '#f59e0b',
  approved: '#3b82f6',
  sent: '#6366f1',
  in_progress: '#c4f20d',
  completed: '#22c55e',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem',
      }}>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.fill || p.color || '#c4f20d' }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [sortKey, setSortKey] = useState('global_score');
  const [sortDir, setSortDir] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const pageRef = useRef(null);

  useEffect(() => {
    async function loadDashboard() {
      const res = await getDashboardData(filters);
      if (res.success) setData(res.data);
      setLoading(false);
    }
    loadDashboard();
  }, [filters]);

  useEffect(() => {
    if (!loading && pageRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.admin-card',
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.05,
            ease: 'power3.out',
          }
        );
      }, pageRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  if (loading) {
    return (
      <>
        <Sidebar activeRole="admin" />
        <main className="main-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div className="loading-spinner" />
          </div>
        </main>
      </>
    );
  }

  const { summary, priority_distribution, plan_status_distribution, skill_gap_distribution, students } = data;

  // Prepare chart data
  const priorityChartData = Object.entries(priority_distribution).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    fill: CHART_COLORS[key],
  }));

  const planStatusChartData = Object.entries(plan_status_distribution).map(([key, value]) => ({
    name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value,
    fill: CHART_COLORS[key],
    key,
  }));

  const skillGapChartData = skill_gap_distribution.map(s => ({
    name: s.skill_name,
    students: s.students_count,
    avgScore: s.average_score,
    fill: s.average_score < 40 ? '#ef4444' : s.average_score < 50 ? '#f97316' : s.average_score < 60 ? '#f59e0b' : '#22c55e',
  }));

  // Sort and filter students
  let displayStudents = [...students];
  if (searchQuery) {
    displayStudents = displayStudents.filter(s =>
      s.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  displayStudents.sort((a, b) => {
    let aVal = a[sortKey];
    let bVal = b[sortKey];
    if (aVal == null) aVal = sortDir === 'asc' ? Infinity : -Infinity;
    if (bVal == null) bVal = sortDir === 'asc' ? Infinity : -Infinity;
    if (typeof aVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const filterOptions = {
    class_code: ['L1-INFO-A', 'L1-INFO-B'],
    subject: ['Python'],
    priority_level: ['standard', 'low', 'medium', 'high'],
    plan_status: ['generated', 'pending_teacher_validation', 'approved', 'sent', 'in_progress', 'completed'],
  };

  return (
    <>
      <Sidebar activeRole="admin" />
      <main className="main-content" ref={pageRef}>
        {/* Page Header */}
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-lg)',
              background: 'var(--info-dim)', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <LayoutDashboard size={22} color="var(--info)" />
            </div>
            <div>
              <h1>Admin Dashboard</h1>
              <p>Platform overview · Personalized Learning Path MVP</p>
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

        {/* KPI Cards */}
        <div className="admin-card grid-4" style={{ marginBottom: 24 }}>
          <KPICard
            title="Students Evaluated"
            value={summary.students_evaluated}
            icon={Users}
            accentColor="#3b82f6"
            subtitle="Total assessed"
          />
          <KPICard
            title="Students with Gaps"
            value={summary.students_with_gaps}
            icon={AlertTriangle}
            accentColor="#f59e0b"
            subtitle={`${Math.round(summary.students_with_gaps / summary.students_evaluated * 100)}% of total`}
          />
          <KPICard
            title="Critical Cases"
            value={summary.critical_students}
            icon={AlertTriangle}
            accentColor="#ef4444"
            subtitle="Require immediate intervention"
            trend="up"
            trendValue="Priority: high"
          />
          <KPICard
            title="Plans Generated"
            value={summary.plans_generated}
            icon={FileCheck}
            accentColor="#6366f1"
            subtitle={`${summary.plans_pending_validation} pending review`}
          />
          <KPICard
            title="Plans Approved"
            value={summary.plans_approved}
            icon={CheckCircle2}
            accentColor="#22c55e"
            subtitle={`${summary.plans_sent} sent to students`}
          />
          <KPICard
            title="Plans Sent"
            value={summary.plans_sent}
            icon={SendIcon}
            accentColor="#6366f1"
            subtitle="Delivered to students"
          />
          <KPICard
            title="Plans Completed"
            value={summary.plans_completed}
            icon={CheckCircle2}
            accentColor="#c4f20d"
            subtitle="Successfully finished"
          />
          <KPICard
            title="Avg Progress"
            value={summary.average_progress}
            icon={TrendingUp}
            accentColor="#c4f20d"
            subtitle="Across active plans"
            suffix="%"
          />
        </div>

        {/* Charts Row */}
        <div className="admin-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-6)', marginBottom: 24 }}>
          {/* Priority Distribution */}
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PieChart size={16} color="var(--accent)" />
                Priority Distribution
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <RPieChart>
                <Pie
                  data={priorityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {priorityChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '0.75rem', color: '#94a3b8' }}
                  formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
                />
              </RPieChart>
            </ResponsiveContainer>
          </div>

          {/* Plan Status Distribution */}
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={16} color="var(--accent)" />
                Plan Status
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={planStatusChartData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {planStatusChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Skill Gap Distribution */}
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={16} color="var(--accent)" />
                Skill Gaps
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={skillGapChartData} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="students" name="Students affected" radius={[0, 4, 4, 0]}>
                  {skillGapChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            options={filterOptions}
          />
        </div>

        {/* Student Table */}
        <div className="admin-card card">
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={16} color="var(--accent)" />
              Student Overview
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="input"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: 34, width: 220 }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                      display: 'flex', padding: 2,
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {displayStudents.length} students
              </span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {[
                    { key: 'student_name', label: 'Student' },
                    { key: 'global_score', label: 'Score' },
                    { key: 'main_gap', label: 'Main Gap' },
                    { key: 'priority_level', label: 'Priority' },
                    { key: 'plan_status', label: 'Plan Status' },
                    { key: 'completion_rate', label: 'Progress' },
                  ].map(col => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      style={{
                        padding: '10px 14px', textAlign: 'left', fontSize: '0.75rem',
                        fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase',
                        letterSpacing: '0.05em', borderBottom: '1px solid var(--border)',
                        cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {col.label}
                        {sortKey === col.key && (
                          sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayStudents.map((student, i) => (
                  <tr key={student.student_code} style={{
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.05)',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.05)'}
                  >
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 'var(--radius-full)',
                          background: 'var(--bg-elevated)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent)',
                        }}>
                          {student.student_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{student.student_name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{student.student_code}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{
                        fontWeight: 600, fontSize: '0.9rem',
                        color: student.global_score >= 70 ? 'var(--success)' : student.global_score >= 50 ? 'var(--warning)' : 'var(--danger)',
                      }}>
                        {student.global_score}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {student.main_gap}
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                      <StatusBadge status={student.priority_level} type="priority" />
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                      {student.plan_status ? (
                        <StatusBadge status={student.plan_status} type="plan" />
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No plan</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                      {student.completion_rate != null ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            height: 6, width: 60, background: 'var(--bg-elevated)',
                            borderRadius: 3, overflow: 'hidden',
                          }}>
                            <div style={{
                              height: '100%', width: `${student.completion_rate}%`,
                              background: student.completion_rate >= 75 ? 'var(--success)' : student.completion_rate >= 25 ? 'var(--accent)' : 'var(--warning)',
                              borderRadius: 3,
                            }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 500, minWidth: 32 }}>
                            {student.completion_rate}%
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
