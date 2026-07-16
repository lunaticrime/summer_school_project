import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'Teacher Review — AthenAI',
  description: 'Review generated learning plans, approve, regenerate, or reject with feedback.',
};

export default function TeacherLayout({ children }) {
  return (
    <div className="app-layout">
      {children}
    </div>
  );
}
