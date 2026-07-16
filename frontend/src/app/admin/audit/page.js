'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Activity, Clock, Search, Filter, Server, Database, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { getWorkflowEvents } from '@/services/dashboardService';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';

export default function AuditPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterWorkflow, setFilterWorkflow] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const pageRef = useRef(null);

  useEffect(() => {
    async function loadEvents() {
      const res = await getWorkflowEvents(filterWorkflow !== 'all' ? { workflow_id: filterWorkflow } : {});
      if (res.success) setEvents(res.data);
      setLoading(false);
    }
    loadEvents();
  }, [filterWorkflow]);

  useEffect(() => {
    if (!loading && pageRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.audit-anim',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power3.out' }
        );
      }, pageRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const filteredEvents = events.filter(e => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return e.event_type?.toLowerCase().includes(q)
      || e.transaction_id?.toLowerCase().includes(q)
      || e.correlation_id?.toLowerCase().includes(q)
      || e.message?.toLowerCase().includes(q);
  });

  const columns = [
    {
      key: 'created_at',
      label: 'Timestamp',
      render: (val) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      )
    },
    {
      key: 'workflow_id',
      label: 'Workflow',
      render: (val) => (
        <span style={{
          padding: '2px 8px', borderRadius: 'var(--radius-pill)',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-mono)'
        }}>
          {val}
        </span>
      )
    },
    {
      key: 'event_type',
      label: 'Event Type',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: row.status === 'success' ? 'var(--success)' : row.status === 'error' ? 'var(--danger)' : 'var(--warning)',
            boxShadow: `0 0 8px ${row.status === 'success' ? 'var(--success)' : 'var(--danger)'}`,
          }} />
          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{val}</span>
        </div>
      )
    },
    {
      key: 'message',
      label: 'Details',
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{val}</span>
          {row.error_message && (
            <span style={{ fontSize: '0.75rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={12} /> {row.error_message}
            </span>
          )}
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
            <span>TX: {row.transaction_id}</span>
            <span>CORR: {row.correlation_id}</span>
          </div>
        </div>
      )
    },
    {
      key: 'duration_ms',
      label: 'Latency',
      render: (val) => (
        <span style={{ 
          fontSize: '0.8rem', fontWeight: 500, fontFamily: 'var(--font-mono)',
          color: val > 1000 ? 'var(--warning)' : val > 3000 ? 'var(--danger)' : 'var(--text-muted)'
        }}>
          {val} ms
        </span>
      )
    }
  ];

  return (
    <div ref={pageRef} style={{ padding: 'var(--space-6) var(--space-8)' }}>
      <div className="audit-anim" style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Activity size={28} color="var(--accent)" />
          System Trace Viewer
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Audit trail of workflow_events detailing system lineage across microservices.
        </p>
      </div>

      <div className="audit-anim card" style={{ padding: 20, marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search trace (TX, Event...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '8px 12px 8px 36px',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                  fontSize: '0.85rem', width: 260
                }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={16} color="var(--text-muted)" />
              <select
                value={filterWorkflow}
                onChange={(e) => { setLoading(true); setFilterWorkflow(e.target.value); }}
                style={{
                  padding: '8px 12px',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              >
                <option value="all">All Workflows</option>
                <option value="WF-01">WF-01 (Ingestion)</option>
                <option value="WF-04">WF-04 (Diagnosis)</option>
                <option value="WF-06">WF-06 (Plan Gen)</option>
                <option value="WF-08">WF-08 (Teacher Valid)</option>
                <option value="WF-09">WF-09 (Plan Regen)</option>
                <option value="WF-10">WF-10 (Notification)</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Server size={14} /> 4 Orchestrators
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Database size={14} /> workflow_events table
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="loading-spinner" />
          </div>
        ) : (
          <DataTable columns={columns} data={filteredEvents} />
        )}
      </div>
    </div>
  );
}
