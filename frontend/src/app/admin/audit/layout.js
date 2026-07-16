import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'System Trace — AthenAI',
  description: 'Workflow Audit and System Trace Viewer',
};

export default function AuditLayout({ children }) {
  return (
    <>
      <Sidebar activeRole="admin" />
      <main className="main-content">
        {children}
      </main>
    </>
  );
}
