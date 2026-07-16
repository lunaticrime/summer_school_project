import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'Bulk Import — AthenAI',
  description: 'Upload student marks via CSV and validate against the WF-01 pipeline.',
};

export default function ImportLayout({ children }) {
  return (
    <>
      <Sidebar activeRole="admin" />
      <main className="main-content">
        {children}
      </main>
    </>
  );
}
