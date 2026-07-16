import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'Admin Dashboard — AthenAI',
  description: 'Monitor KPIs, skill gaps, plan statuses, and student overview.',
};

export default function AdminLayout({ children }) {
  return (
    <div className="app-layout">
      {children}
    </div>
  );
}
