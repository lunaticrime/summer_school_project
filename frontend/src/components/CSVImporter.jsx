'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle,
  Download, Copy, ChevronRight, Trash2, Eye, Code,
} from 'lucide-react';

// ─── WF-01 Validation Logic (mirrors the 10 backend nodes) ───────

function normalizeIdentifiers(row) {
  return {
    ...row,
    student_code: (row.student_code || '').trim().toUpperCase(),
    class_code: (row.class_code || '').trim().toUpperCase(),
    teacher_code: (row.teacher_code || '').trim().toUpperCase(),
    assessment_code: (row.assessment_code || '').trim().toUpperCase(),
    skills: (row.skills || []).map(s => ({
      ...s,
      skill_code: (s.skill_code || '').trim().toUpperCase(),
    })),
  };
}

function normalizeStudent(row) {
  return {
    ...row,
    student_name: (row.student_name || '').trim(),
    student_email: (row.student_email || '').trim().toLowerCase(),
    assessment_title: (row.assessment_title || '').trim(),
    subject: (row.subject || '').trim().replace(/^(.)/, m => m.toUpperCase()),
    skills: row.skills.map(s => ({
      ...s,
      skill_name: (s.skill_name || '').trim(),
    })),
  };
}

function normalizeScores(row) {
  return {
    ...row,
    skills: row.skills.map(s => ({
      ...s,
      score: Number(s.score),
      max_score: Number(s.max_score),
    })),
  };
}

function validateRequired(row) {
  const errors = [];
  const required = ['student_code', 'student_name', 'student_email', 'class_code',
    'teacher_code', 'assessment_code', 'assessment_title', 'subject'];
  for (const field of required) {
    if (!row[field]) errors.push({ field, reason: 'missing_required_field' });
  }
  return errors;
}

function validateSkillCount(row) {
  const count = (row.skills || []).length;
  if (count < 3) return [{ field: 'skills', reason: 'minimum_3_skills_required' }];
  if (count > 5) return [{ field: 'skills', reason: 'maximum_5_skills_allowed' }];
  return [];
}

function validateScores(row) {
  const errors = [];
  (row.skills || []).forEach((s, i) => {
    if (isNaN(s.score) || isNaN(s.max_score)) {
      errors.push({ field: `skills[${i}].score`, reason: 'score_not_numeric' });
    } else {
      if (s.max_score <= 0) {
        errors.push({ field: `skills[${i}].max_score`, reason: 'max_score_must_be_positive' });
      }
      if (s.score < 0 || s.score > s.max_score) {
        errors.push({ field: `skills[${i}].score`, reason: 'score_out_of_range' });
      }
    }
  });
  return errors;
}

function detectDuplicates(row) {
  const codes = (row.skills || []).map(s => s.skill_code);
  const seen = new Set();
  const errors = [];
  codes.forEach((code, i) => {
    if (seen.has(code)) {
      errors.push({ field: `skills[${i}].skill_code`, reason: 'duplicate_skill_code' });
    }
    seen.add(code);
  });
  return errors;
}

function validateRow(rawRow) {
  let row = normalizeIdentifiers(rawRow);
  row = normalizeStudent(row);
  row = normalizeScores(row);

  const errors = [
    ...validateRequired(row),
    ...validateSkillCount(row),
    ...validateScores(row),
    ...detectDuplicates(row),
  ];

  return {
    normalized: row,
    valid: errors.length === 0,
    errors,
    skills_count: (row.skills || []).length,
  };
}

function generateIdempotencyKey(row) {
  return `${row.assessment_code}-${row.student_code}-V1`;
}

function buildWF01Payload(row) {
  return {
    transaction_id: `TX-${Date.now()}`,
    correlation_id: `CORR-${Date.now()}`,
    student_code: row.student_code,
    student_name: row.student_name,
    student_email: row.student_email,
    class_code: row.class_code,
    teacher_code: row.teacher_code,
    assessment_code: row.assessment_code,
    assessment_title: row.assessment_title,
    subject: row.subject,
    idempotency_key: generateIdempotencyKey(row),
    skills: row.skills.map(s => ({
      skill_code: s.skill_code,
      skill_name: s.skill_name,
      score: String(s.score),
      max_score: String(s.max_score),
    })),
  };
}

// ─── CSV Parsing ─────────────────────────────────────────────────

function parseCSV(text) {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = values[idx] || ''; });

    // Extract skills dynamically from skill_code_N, skill_name_N, score_N, max_score_N
    const skills = [];
    for (let n = 1; n <= 5; n++) {
      const code = obj[`skill_code_${n}`];
      const name = obj[`skill_name_${n}`];
      const score = obj[`score_${n}`];
      const maxScore = obj[`max_score_${n}`];
      if (code || name || score || maxScore) {
        skills.push({
          skill_code: code || '',
          skill_name: name || '',
          score: score || '',
          max_score: maxScore || '',
        });
      }
    }

    rows.push({
      student_code: obj.student_code || '',
      student_name: obj.student_name || '',
      student_email: obj.student_email || '',
      class_code: obj.class_code || '',
      teacher_code: obj.teacher_code || '',
      assessment_code: obj.assessment_code || '',
      assessment_title: obj.assessment_title || '',
      subject: obj.subject || '',
      skills,
    });
  }

  return rows;
}

const SAMPLE_CSV = `student_code,student_name,student_email,class_code,teacher_code,assessment_code,assessment_title,subject,skill_code_1,skill_name_1,score_1,max_score_1,skill_code_2,skill_name_2,score_2,max_score_2,skill_code_3,skill_name_3,score_3,max_score_3,skill_code_4,skill_name_4,score_4,max_score_4,skill_code_5,skill_name_5,score_5,max_score_5
STD001,Yassine El Amrani,yassine@example.com,L1-INFO-A,T001,ASSESS-PYTHON-001,Evaluation Python - Fondamentaux,Python,PY-VARIABLES,Variables,80,100,PY-LOOPS,Boucles,30,100,PY-FUNCTIONS,Fonctions,45,100,PY-LISTS,Listes,70,100,PY-LOGIC,Logique,50,100
STD002,Fatima Zahra,fatima@example.com,L1-INFO-A,T001,ASSESS-PYTHON-001,Evaluation Python - Fondamentaux,Python,PY-VARIABLES,Variables,90,100,PY-LOOPS,Boucles,75,100,PY-FUNCTIONS,Fonctions,60,100,PY-LISTS,Listes,85,100,PY-LOGIC,Logique,55,100
STD009,Ahmed Bensaid,ahmed@example.com,L1-INFO-B,T001,ASSESS-PYTHON-001,Evaluation Python - Fondamentaux,Python,PY-VARIABLES,Variables,20,100,PY-LOOPS,Boucles,15,100,PY-FUNCTIONS,Fonctions,10,100,,,,,,,,`;


// ─── Styles ──────────────────────────────────────────────────────

const styles = {
  container: {
    display: 'flex', flexDirection: 'column', gap: 24,
  },
  /* --- Stepper --- */
  stepper: {
    display: 'flex', alignItems: 'center', gap: 0,
    marginBottom: 8,
  },
  stepItem: (active, done) => ({
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 20px',
    background: active ? 'var(--bg-elevated)' : 'transparent',
    borderRadius: 'var(--radius-md)',
    cursor: done || active ? 'pointer' : 'default',
    opacity: active ? 1 : done ? 0.85 : 0.4,
    transition: 'all 0.2s',
  }),
  stepNumber: (active, done) => ({
    width: 28, height: 28, borderRadius: 'var(--radius-full)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.75rem', fontWeight: 700,
    background: done ? 'var(--success)' : active ? 'var(--accent)' : 'var(--bg-elevated)',
    color: done || active ? 'var(--text-inverse)' : 'var(--text-muted)',
  }),
  stepLabel: (active) => ({
    fontSize: '0.85rem', fontWeight: active ? 600 : 400,
    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
  }),
  stepConnector: {
    width: 32, height: 1, background: 'var(--border)',
  },

  /* --- Drop zone --- */
  dropZone: (dragging) => ({
    border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border-hover)'}`,
    borderRadius: 'var(--radius-lg)',
    padding: '48px 32px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
    background: dragging ? 'var(--accent-dim)' : 'var(--bg-card)',
    transition: 'all 0.25s ease',
    cursor: 'pointer',
    textAlign: 'center',
  }),
  dropIcon: (dragging) => ({
    width: 64, height: 64, borderRadius: 'var(--radius-full)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: dragging ? 'var(--accent)' : 'var(--bg-elevated)',
    color: dragging ? 'var(--text-inverse)' : 'var(--accent)',
    transition: 'all 0.25s',
  }),
  sampleBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', borderRadius: 'var(--radius-pill)',
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    color: 'var(--text-secondary)', cursor: 'pointer',
    fontSize: '0.8rem', fontWeight: 500,
    transition: 'all 0.2s',
  },

  /* --- Preview table --- */
  tableWrap: {
    overflowX: 'auto', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)', background: 'var(--bg-surface)',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' },
  th: {
    padding: '10px 12px', textAlign: 'left', fontSize: '0.7rem',
    fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase',
    letterSpacing: '0.05em', borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap', background: 'var(--bg-surface)',
  },
  td: (hasError) => ({
    padding: '10px 12px', borderBottom: '1px solid var(--border)',
    color: hasError ? 'var(--danger)' : 'var(--text-primary)',
    background: hasError ? 'var(--danger-dim)' : 'transparent',
    fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
    whiteSpace: 'nowrap',
  }),
  rowNum: {
    padding: '10px 12px', borderBottom: '1px solid var(--border)',
    color: 'var(--text-muted)', fontSize: '0.7rem', textAlign: 'center',
    width: 40,
  },
  validCell: {
    padding: '10px 12px', borderBottom: '1px solid var(--border)',
    textAlign: 'center', width: 40,
  },

  /* --- Error panel --- */
  errorPanel: {
    background: 'var(--danger-dim)', border: '1px solid var(--danger)',
    borderRadius: 'var(--radius-lg)', padding: 20,
  },
  errorTitle: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: '0.9rem', fontWeight: 600, color: 'var(--danger)',
    marginBottom: 12,
  },
  errorItem: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 0', fontSize: '0.8rem', color: 'var(--text-primary)',
  },

  /* --- Success panel --- */
  successPanel: {
    background: 'var(--success-dim)', border: '1px solid var(--success)',
    borderRadius: 'var(--radius-lg)', padding: 20,
    display: 'flex', alignItems: 'center', gap: 12,
  },

  /* --- JSON viewer --- */
  jsonWrap: {
    background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)', overflow: 'hidden',
  },
  jsonHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px', background: 'var(--bg-card)',
    borderBottom: '1px solid var(--border)',
  },
  jsonPre: {
    padding: 20, margin: 0,
    fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
    color: 'var(--accent)', lineHeight: 1.7,
    overflowX: 'auto', maxHeight: 500,
  },
  copyBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 14px', borderRadius: 'var(--radius-pill)',
    background: 'var(--accent)', color: 'var(--text-inverse)',
    border: 'none', cursor: 'pointer', fontWeight: 600,
    fontSize: '0.75rem',
  },

  /* --- Actions bar --- */
  actionsBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    gap: 12,
  },
};


// ─── Component ───────────────────────────────────────────────────

export default function CSVImporter() {
  const [step, setStep] = useState(0); // 0=upload, 1=preview, 2=json
  const [rawRows, setRawRows] = useState([]);
  const [validationResults, setValidationResults] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = useCallback((text, name) => {
    const rows = parseCSV(text);
    const results = rows.map(row => validateRow(row));
    setRawRows(rows);
    setValidationResults(results);
    setFileName(name);
    setStep(1);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => processFile(ev.target.result, file.name);
      reader.readAsText(file);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => processFile(ev.target.result, file.name);
      reader.readAsText(file);
    }
  }, [processFile]);

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sample_marks.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const allValid = validationResults.length > 0 && validationResults.every(r => r.valid);
  const totalErrors = validationResults.reduce((acc, r) => acc + r.errors.length, 0);

  const payloads = validationResults.map(r => buildWF01Payload(r.normalized));

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(payloads, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setStep(0);
    setRawRows([]);
    setValidationResults([]);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Field-level error check for highlighting
  const fieldHasError = (rowIdx, fieldName) => {
    if (!validationResults[rowIdx]) return false;
    return validationResults[rowIdx].errors.some(e => e.field === fieldName);
  };

  const stepDefs = [
    { label: 'Upload CSV', icon: Upload },
    { label: 'Preview & Validate', icon: Eye },
    { label: 'JSON Payload', icon: Code },
  ];

  return (
    <div style={styles.container}>
      {/* ─── Stepper ─── */}
      <div style={styles.stepper}>
        {stepDefs.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={styles.stepItem(step === i, step > i)}
              onClick={() => { if (step > i || (i === 1 && rawRows.length) || (i === 2 && allValid)) setStep(i); }}
            >
              <div style={styles.stepNumber(step === i, step > i)}>
                {step > i ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span style={styles.stepLabel(step === i)}>{s.label}</span>
            </div>
            {i < stepDefs.length - 1 && <div style={styles.stepConnector} />}
          </div>
        ))}
      </div>

      {/* ─── Step 0: Upload ─── */}
      {step === 0 && (
        <>
          <div
            style={styles.dropZone(dragging)}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={styles.dropIcon(dragging)}>
              <FileSpreadsheet size={28} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                {dragging ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                or click to browse — supports .csv files
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              style={styles.sampleBtn}
              onClick={downloadSample}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <Download size={14} /> Download Sample CSV
            </button>
          </div>

          {/* Format guide */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileSpreadsheet size={16} color="var(--accent)" />
              Expected CSV Format
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
              color: 'var(--text-secondary)', background: 'var(--bg-surface)',
              padding: 14, borderRadius: 'var(--radius-md)', overflowX: 'auto',
              lineHeight: 1.8,
            }}>
              <span style={{ color: 'var(--accent)' }}>student_code</span>, <span style={{ color: 'var(--accent)' }}>student_name</span>, <span style={{ color: 'var(--accent)' }}>student_email</span>, <span style={{ color: 'var(--accent)' }}>class_code</span>, <span style={{ color: 'var(--accent)' }}>teacher_code</span>,<br/>
              <span style={{ color: 'var(--info)' }}>assessment_code</span>, <span style={{ color: 'var(--info)' }}>assessment_title</span>, <span style={{ color: 'var(--info)' }}>subject</span>,<br/>
              <span style={{ color: 'var(--warning)' }}>skill_code_1</span>, <span style={{ color: 'var(--warning)' }}>skill_name_1</span>, <span style={{ color: 'var(--warning)' }}>score_1</span>, <span style={{ color: 'var(--warning)' }}>max_score_1</span>, ..., <span style={{ color: 'var(--warning)' }}>skill_code_5</span>, <span style={{ color: 'var(--warning)' }}>skill_name_5</span>, <span style={{ color: 'var(--warning)' }}>score_5</span>, <span style={{ color: 'var(--warning)' }}>max_score_5</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 10 }}>
              <strong>Validation rules (WF-01):</strong> 3–5 skills required · 0 ≤ score ≤ max_score · max_score &gt; 0 · no duplicate skill codes · all fields required
            </div>
          </div>
        </>
      )}

      {/* ─── Step 1: Preview & Validate ─── */}
      {step === 1 && (
        <>
          {/* Summary bar */}
          <div style={styles.actionsBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <FileSpreadsheet size={18} color="var(--accent)" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{fileName}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {rawRows.length} row{rawRows.length !== 1 ? 's' : ''} parsed
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={reset}>
                <Trash2 size={14} /> Clear
              </button>
              {allValid && (
                <button className="btn btn-primary btn-sm" onClick={() => setStep(2)}>
                  View JSON Payload <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Validation result banner */}
          {allValid ? (
            <div style={styles.successPanel}>
              <CheckCircle2 size={22} color="var(--success)" />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--success)', fontSize: '0.9rem' }}>
                  All {rawRows.length} rows passed WF-01 validation
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Data is ready to be sent to the backend pipeline
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.errorPanel}>
              <div style={styles.errorTitle}>
                <XCircle size={18} /> {totalErrors} validation error{totalErrors !== 1 ? 's' : ''} found across {validationResults.filter(r => !r.valid).length} row{validationResults.filter(r => !r.valid).length !== 1 ? 's' : ''}
              </div>
              {validationResults.map((r, rowIdx) =>
                r.errors.map((err, errIdx) => (
                  <div key={`${rowIdx}-${errIdx}`} style={styles.errorItem}>
                    <AlertTriangle size={13} color="var(--warning)" />
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                      Row {rowIdx + 1}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--danger)' }}>
                      {err.field}
                    </span>
                    <span style={{ fontSize: '0.8rem' }}>→ {err.reason.replace(/_/g, ' ')}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Data table */}
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>✓</th>
                  <th style={styles.th}>Student Code</th>
                  <th style={styles.th}>Student Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Class</th>
                  <th style={styles.th}>Teacher</th>
                  <th style={styles.th}>Assessment</th>
                  <th style={styles.th}>Subject</th>
                  <th style={styles.th}>Skills</th>
                </tr>
              </thead>
              <tbody>
                {validationResults.map((result, i) => (
                  <tr key={i}>
                    <td style={styles.rowNum}>{i + 1}</td>
                    <td style={styles.validCell}>
                      {result.valid
                        ? <CheckCircle2 size={16} color="var(--success)" />
                        : <XCircle size={16} color="var(--danger)" />}
                    </td>
                    <td style={styles.td(fieldHasError(i, 'student_code'))}>{result.normalized.student_code || '—'}</td>
                    <td style={styles.td(fieldHasError(i, 'student_name'))}>{result.normalized.student_name || '—'}</td>
                    <td style={styles.td(fieldHasError(i, 'student_email'))}>{result.normalized.student_email || '—'}</td>
                    <td style={styles.td(fieldHasError(i, 'class_code'))}>{result.normalized.class_code || '—'}</td>
                    <td style={styles.td(fieldHasError(i, 'teacher_code'))}>{result.normalized.teacher_code || '—'}</td>
                    <td style={styles.td(fieldHasError(i, 'assessment_code'))}>{result.normalized.assessment_code || '—'}</td>
                    <td style={styles.td(fieldHasError(i, 'subject'))}>{result.normalized.subject || '—'}</td>
                    <td style={styles.td(fieldHasError(i, 'skills'))}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {result.normalized.skills.map((skill, si) => {
                          const hasSkillError = result.errors.some(e => e.field.startsWith(`skills[${si}]`));
                          return (
                            <span key={si} style={{
                              padding: '2px 8px', borderRadius: 'var(--radius-pill)',
                              fontSize: '0.7rem', fontFamily: 'var(--font-mono)',
                              background: hasSkillError ? 'var(--danger-dim)' : 'var(--bg-elevated)',
                              color: hasSkillError ? 'var(--danger)' : 'var(--text-secondary)',
                              border: hasSkillError ? '1px solid var(--danger)' : '1px solid var(--border)',
                            }}>
                              {skill.skill_code}: {skill.score}/{skill.max_score}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ─── Step 2: JSON Payload ─── */}
      {step === 2 && (
        <>
          <div style={styles.actionsBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Code size={18} color="var(--accent)" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                WF-01 Input Payload — {payloads.length} record{payloads.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>
                ← Back to Preview
              </button>
              <button className="btn btn-ghost btn-sm" onClick={reset}>
                <Trash2 size={14} /> New Import
              </button>
            </div>
          </div>

          <div style={styles.successPanel}>
            <CheckCircle2 size={22} color="var(--success)" />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--success)', fontSize: '0.9rem' }}>
                Payload ready for POST /student-result/validate
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                This is the exact JSON format expected by WF-01 of the backend pipeline
              </div>
            </div>
          </div>

          <div style={styles.jsonWrap}>
            <div style={styles.jsonHeader}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                POST /student-result/validate
              </span>
              <button style={styles.copyBtn} onClick={copyJSON}>
                <Copy size={13} /> {copied ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>
            <pre style={styles.jsonPre}>
              {JSON.stringify(payloads, null, 2)}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
