// FILE: solution4all-frontend/src/components/ui/PermissionGate.jsx
import { Lock } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';

export default function PermissionGate({ action, children, showLock = true }) {
  const { canDelete, canCreate, canUpdate } = usePermissions();

  const permissionMap = {
    create: canCreate,
    update: canUpdate,
    delete: canDelete,
  };

  const hasPermission = permissionMap[action] ?? false;

  if (hasPermission) {
    return <>{children}</>;
  }

  return (
    <div className="relative inline-block opacity-50 cursor-not-allowed pointer-events-none select-none">
      {children}
      {showLock && (
        <div className="absolute -top-1.5 -right-1.5 z-10">
          <Lock size={14} className="text-neutral-400" />
        </div>
      )}
    </div>
  );
}
