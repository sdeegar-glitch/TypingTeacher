import AdminDashboard from '../admin/AdminDashboard';
import Seo from '../components/Seo';

// This page file is kept minimal — all logic is in /admin/
export default function AdminDashboardPage() {
  return (
    <>
      <Seo title="Admin | FastTypingLab" description="FastTypingLab admin dashboard." noindex />
      <AdminDashboard />
    </>
  );
}
