'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Upload, FileSpreadsheet, Zap } from 'lucide-react';
import CSVImporter from '@/components/CSVImporter';

export default function ImportPage() {
  const pageRef = useRef(null);

  useEffect(() => {
    if (pageRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.import-section',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
        );
      }, pageRef);
      return () => ctx.revert();
    }
  }, []);

  return (
    <div ref={pageRef}>
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-lg)',
            background: 'var(--accent-dim)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Upload size={22} color="var(--accent)" />
          </div>
          <div>
            <h1>Bulk Import</h1>
            <p>Upload student marks via CSV — validated against the WF-01 pipeline</p>
          </div>
        </div>
      </div>

      {/* Pipeline info card */}
      <div className="import-section card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '4px 0',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-md)',
            background: 'var(--secondary-dim)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Zap size={20} color="var(--secondary)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>
              Backend Pipeline Integration
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              The CSV data is parsed and validated using the same rules as <strong style={{ color: 'var(--accent)' }}>Workflow 01 (WF-01)</strong> — 
              normalizing identifiers, validating score ranges, checking skill count (3–5), and detecting duplicates. 
              The generated JSON payload is the exact input format expected by <code style={{ 
                background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 4, 
                fontSize: '0.75rem', color: 'var(--accent)' 
              }}>POST /student-result/validate</code>.
            </div>
          </div>
        </div>
      </div>

      {/* CSV Importer */}
      <div className="import-section">
        <CSVImporter />
      </div>
    </div>
  );
}
