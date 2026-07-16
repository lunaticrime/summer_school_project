'use client';

import { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle2, Mail, MessageSquare, Loader2 } from 'lucide-react';
import { getWorkflowEvents } from '@/services/dashboardService';

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'var(--bg-surface)',
  },
  title: {
    fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)',
    display: 'flex', alignItems: 'center', gap: 8,
  },
  list: {
    padding: '12px',
    display: 'flex', flexDirection: 'column', gap: 8,
    maxHeight: 300, overflowY: 'auto',
  },
  item: {
    padding: '12px',
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    display: 'flex', alignItems: 'flex-start', gap: 12,
  },
  iconBox: (status) => ({
    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: status === 'success' ? 'var(--success-dim)' : 'var(--danger-dim)',
    color: status === 'success' ? 'var(--success)' : 'var(--danger)',
  }),
  content: {
    flex: 1, minWidth: 0,
  },
  itemHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 4,
  },
  studentId: {
    fontSize: '0.8rem', fontWeight: 600,
  },
  time: {
    fontSize: '0.7rem', color: 'var(--text-muted)',
  },
  message: {
    fontSize: '0.8rem', color: 'var(--text-secondary)',
    lineHeight: 1.4,
  },
  channelBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 6px', borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    fontSize: '0.7rem', color: 'var(--text-muted)',
    marginTop: 6,
  }
};

export default function NotificationTracker() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const res = await getWorkflowEvents({ workflow_id: 'WF-10' });
      if (res.success) {
        setNotifications(res.data);
      }
      setLoading(false);
    }
    loadData();
    
    // Optional polling could go here
    // const int = setInterval(loadData, 10000);
    // return () => clearInterval(int);
  }, []);

  return (
    <div style={styles.card} className="card">
      <div style={styles.header}>
        <div style={styles.title}>
          <Send size={16} color="var(--accent)" />
          Dispatch Tracker (WF-10)
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {notifications.length} recent
        </div>
      </div>
      
      <div style={styles.list}>
        {loading ? (
          <div style={{ padding: 20, display: 'flex', justifyContent: 'center' }}>
            <Loader2 size={24} className="spin" color="var(--text-muted)" />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No dispatch events found.
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} style={styles.item}>
              <div style={styles.iconBox(notif.status)}>
                {notif.status === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              </div>
              <div style={styles.content}>
                <div style={styles.itemHeader}>
                  <div style={styles.studentId}>
                    Plan #{notif.plan_id} (Student #{notif.student_id})
                  </div>
                  <div style={styles.time}>
                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={styles.message}>
                  {notif.status === 'error' ? notif.error_message : notif.message}
                </div>
                {notif.channel && (
                  <div style={styles.channelBadge}>
                    {notif.channel === 'gmail' ? <Mail size={12} /> : <MessageSquare size={12} />}
                    {notif.channel}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
