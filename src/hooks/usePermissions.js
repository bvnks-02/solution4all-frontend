// FILE: solution4all-frontend/src/hooks/usePermissions.js
import { useAdmin } from '../admin/AdminContext';

export function usePermissions() {
  const { admin } = useAdmin();
  const isAdmin = admin?.role === 'admin';
  return {
    isAdmin,
    canCreate: true,
    canUpdate: true,
    canDelete: isAdmin,
  };
}
