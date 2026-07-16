import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'Student Dashboard — AthenAI',
  description: 'Track your learning progress, view skill breakdown, and follow your personalized plan.',
};

export default function StudentLayout({ children }) {
  return (
    <div className="app-layout">
      {children}
    </div>
  );
}
