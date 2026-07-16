'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles, TrendingUp, AlertTriangle, Target, CheckCircle2 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import ProgressRing from './ProgressRing';
import StatusBadge from './StatusBadge';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(10, 10, 15, 0.7)',
    backdropFilter: 'blur(8px)',
    zIndex: 999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    width: '100%', maxWidth: 800, maxHeight: '90vh',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    display: 'flex', flexDirection: 'column',
    animation: 'fade-in-up 0.3s ease-out',
    overflow: 'hidden',
  },
  header: {
    padding: '24px 32px',
    borderBottom: '1px solid var(--border)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    background: 'var(--bg-card)',
  },
  titleArea: {
    display: 'flex', alignItems: 'center', gap: 20,
  },
  closeBtn: {
    background: 'transparent', border: 'none',
    color: 'var(--text-muted)', cursor: 'pointer',
    padding: 4, borderRadius: 'var(--radius-sm)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s',
  },
  body: {
    padding: '32px',
    overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 24,
  },
  footer: {
    padding: '16px 32px',
    borderTop: '1px solid var(--border)',
    background: 'var(--bg-card)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: '0.8rem',
  },
  
  /* Sections */
  summaryCard: {
    background: 'var(--accent-dim)',
    border: '1px solid var(--border-accent)',
    borderRadius: 'var(--radius-md)',
    padding: '20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
  },
  sectionBox: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '20px',
    display: 'flex', flexDirection: 'column',
  },
  sectionTitle: {
    fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)',
    display: 'flex', alignItems: 'center', gap: 8,
    marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  
  /* Chips */
  chipWrap: {
    display: 'flex', flexWrap: 'wrap', gap: 8,
  },
  chip: (type) => ({
    padding: '6px 12px', borderRadius: 'var(--radius-pill)',
    fontSize: '0.8rem', fontWeight: 500,
    background: type === 'strength' ? 'var(--success-dim)' : 'var(--danger-dim)',
    color: type === 'strength' ? 'var(--success)' : 'var(--danger)',
    border: `1px solid ${type === 'strength' ? 'var(--success)' : 'var(--danger)'}`,
  }),
  
  /* Impact */
  impactBox: {
    background: 'var(--warning-dim)',
    borderLeft: '4px solid var(--warning)',
    borderRadius: 'var(--radius-md)',
    padding: '16px 20px',
  }
};

export default function DiagnosisModal({ studentName, subject, diagnosis, skills, onClose }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  if (!diagnosis) return null;

  const strengths = diagnosis.diagnosis_strengths?.split(',').map(s => s.trim()).filter(Boolean) || [];
  const weaknesses = diagnosis.diagnosis_weaknesses?.split(',').map(s => s.trim()).filter(Boolean) || [];
  
  const radarData = skills?.map(s => ({
    subject: s.skill_name,
    A: s.percentage,
    fullMark: 100,
  })) || [];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div 
        style={{...styles.modal, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)'}} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.titleArea}>
            <div style={{ transform: 'scale(0.8)', transformOrigin: 'left center' }}>
              <ProgressRing 
                percentage={diagnosis.global_score || 0} 
                size={80} strokeWidth={8} 
              />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                Pedagogical Diagnosis
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 12 }}>
                {studentName} <span style={{ color: 'var(--border)' }}>|</span> {subject}
                <StatusBadge status={diagnosis.priority_level} type="priority" />
              </div>
            </div>
          </div>
          <button 
            style={styles.closeBtn} 
            onClick={onClose}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {/* AI Summary */}
          <div style={styles.summaryCard}>
            <div style={{...styles.sectionTitle, color: 'var(--accent)', marginBottom: 8}}>
              <Sparkles size={16} /> AI Summary
            </div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {diagnosis.diagnosis_summary}
            </div>
          </div>

          <div style={styles.grid}>
            {/* Strengths & Weaknesses */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={styles.sectionBox}>
                <div style={styles.sectionTitle}>
                  <TrendingUp size={16} color="var(--success)" /> Identified Strengths
                </div>
                <div style={styles.chipWrap}>
                  {strengths.length > 0 ? strengths.map((s, i) => (
                    <span key={i} style={styles.chip('strength')}>{s}</span>
                  )) : <span style={{color: 'var(--text-muted)'}}>None identified</span>}
                </div>
              </div>

              <div style={styles.sectionBox}>
                <div style={styles.sectionTitle}>
                  <AlertTriangle size={16} color="var(--danger)" /> Critical Weaknesses
                </div>
                <div style={styles.chipWrap}>
                  {weaknesses.length > 0 ? weaknesses.map((s, i) => (
                    <span key={i} style={styles.chip('weakness')}>{s}</span>
                  )) : <span style={{color: 'var(--text-muted)'}}>None identified</span>}
                </div>
              </div>
            </div>

            {/* Radar Chart */}
            <div style={{...styles.sectionBox, padding: '20px 10px'}}>
              <div style={{...styles.sectionTitle, paddingLeft: 10}}>
                <Target size={16} color="var(--secondary)" /> Skill Profile
              </div>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} 
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar 
                      name="Student" 
                      dataKey="A" 
                      stroke="var(--accent)" 
                      fill="var(--accent)" 
                      fillOpacity={0.4} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Impact & Justification */}
          <div style={styles.impactBox}>
            <div style={{ fontWeight: 600, color: 'var(--warning)', marginBottom: 6, fontSize: '0.85rem' }}>
              Pedagogical Impact
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 12 }}>
              {diagnosis.pedagogical_impact}
            </div>
            
            {diagnosis.priority_justification && (
              <>
                <div style={{ height: 1, background: 'rgba(245, 158, 11, 0.2)', margin: '12px 0' }} />
                <div style={{ fontSize: '0.85rem', color: 'var(--warning)', fontWeight: 500, display: 'flex', gap: 6 }}>
                  <span style={{opacity: 0.8}}>Priority Justification:</span>
                  <span style={{color: 'var(--text-primary)'}}>{diagnosis.priority_justification}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: 'var(--text-muted)' }}>Confidence:</span>
            <span style={{ 
              display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600,
              color: diagnosis.confidence === 'high' ? 'var(--success)' : diagnosis.confidence === 'medium' ? 'var(--warning)' : 'var(--danger)'
            }}>
              <CheckCircle2 size={14} /> {diagnosis.confidence?.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>
          <div style={{ color: 'var(--text-muted)' }}>
            Model Engine: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>{diagnosis.model_name || 'unknown'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
