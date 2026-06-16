import { lazy, Suspense } from 'react';
import { useAdmin } from './AdminContext';
import Spinner from '../components/ui/Spinner';

const AdminLayout = lazy(() => import('./AdminLayout'));
const AdminLogin = lazy(() => import('./AdminLogin'));

export default function AdminRoute() {
  const { isAuthenticated, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>}>
      {isAuthenticated ? <AdminLayout /> : <AdminLogin />}
    </Suspense>
  );
}
