'use client';

import { useState } from 'react';
import { GraduationCap, ClipboardCheck, LayoutDashboard, User, Upload, Activity } from 'lucide-react';

import { useRouter } from 'next/navigation';

const navItems = [
  { role: 'student', label: 'Student', icon: GraduationCap },
  { role: 'teacher', label: 'Teacher', icon: ClipboardCheck },
  { role: 'admin', label: 'Admin', icon: LayoutDashboard },
];

const styles = {
  sidebar: {
    width: 260,
    minWidth: 260,
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    backgroundColor: '#12121a',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 24,
    boxSizing: 'border-box',
    zIndex: 100,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  topSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 32,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    paddingBottom: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 700,
    color: '#f1f5f9',
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    letterSpacing: '-0.5px',
  },
  logoDot: {
    display: 'inline-block',
    width: 7,
    height: 7,
    borderRadius: '50%',
    backgroundColor: '#c4f20d',
    marginLeft: 3,
    marginBottom: 2,
    verticalAlign: 'middle',
  },
  navList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  navItemBase: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '12px 16px',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 500,
    transition: 'all 0.2s ease',
    borderLeft: '3px solid transparent',
    userSelect: 'none',
  },
  navItemActive: {
    backgroundColor: 'rgba(196,242,13,0.1)',
    color: '#c4f20d',
    borderLeft: '3px solid #c4f20d',
  },
  navItemInactive: {
    color: '#94a3b8',
    borderLeft: '3px solid transparent',
  },
  navItemHover: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  navLabel: {
    lineHeight: 1,
  },
  bottomSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 0 0 0',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  avatar: {
    width: 40,
    height: 40,
    minWidth: 40,
    borderRadius: '50%',
    backgroundColor: '#252540',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    overflow: 'hidden',
  },
  userName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#e2e8f0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userPlan: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: 400,
  },
};

function Sidebar({ activeRole, onRoleChange }) {
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleRoleChange = (role) => {
    if (onRoleChange) {
      onRoleChange(role);
    } else {
      router.push(`/${role}`);
    }
  };

  return (
    <aside style={styles.sidebar}>
      {/* Top: Logo + Navigation */}
      <div style={styles.topSection}>
        {/* Logo */}
        <div style={styles.logoContainer}>
          <span style={styles.logoText}>
            ATHENAI
            <span style={styles.logoDot} />
          </span>
        </div>

        {/* Navigation Items */}
        <nav>
          <ul style={styles.navList}>
            {navItems.map(({ role, label, icon: Icon }) => {
              const isActive = activeRole === role;
              const isHovered = hoveredItem === role && !isActive;

              const itemStyle = {
                ...styles.navItemBase,
                ...(isActive ? styles.navItemActive : styles.navItemInactive),
                ...(isHovered ? styles.navItemHover : {}),
              };

              return (
                <li
                  key={role}
                  style={itemStyle}
                  onClick={() => handleRoleChange(role)}
                  onMouseEnter={() => setHoveredItem(role)}
                  onMouseLeave={() => setHoveredItem(null)}
                  role="button"
                  tabIndex={0}
                  aria-current={isActive ? 'page' : undefined}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRoleChange(role);
                    }
                  }}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span style={styles.navLabel}>{label}</span>
                </li>
              );
            })}
          </ul>

          {/* Admin Sub-nav */}
          {activeRole === 'admin' && (
            <div style={{ marginTop: 8, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', padding: '0 14px', marginBottom: 8 }}>
                Tools
              </div>
              <ul style={styles.navList}>
                <li
                  style={{
                    ...styles.navItemBase,
                    ...styles.navItemInactive,
                    ...(hoveredItem === 'import' ? styles.navItemHover : {}),
                  }}
                  onClick={() => router.push('/admin/import')}
                  onMouseEnter={() => setHoveredItem('import')}
                  onMouseLeave={() => setHoveredItem(null)}
                  role="button"
                  tabIndex={0}
                >
                  <Upload size={20} strokeWidth={1.8} />
                  <span style={styles.navLabel}>Import Marks</span>
                </li>
                <li
                  style={{
                    ...styles.navItemBase,
                    ...styles.navItemInactive,
                    ...(hoveredItem === 'audit' ? styles.navItemHover : {}),
                  }}
                  onClick={() => router.push('/admin/audit')}
                  onMouseEnter={() => setHoveredItem('audit')}
                  onMouseLeave={() => setHoveredItem(null)}
                  role="button"
                  tabIndex={0}
                >
                  <Activity size={20} strokeWidth={1.8} />
                  <span style={styles.navLabel}>System Trace</span>
                </li>
              </ul>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom: User Profile */}
      <div style={styles.bottomSection}>
        <div style={styles.avatar}>
          <User size={20} color="#94a3b8" strokeWidth={1.8} />
        </div>
        <div style={styles.userInfo}>
          <span style={styles.userName}>Demo User</span>
          <span style={styles.userPlan}>Free Plan</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
