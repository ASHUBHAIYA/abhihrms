import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { PermissionKey, UserRole } from '../../types/hrms';
import { Shield, ShieldAlert, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

interface RbacGuardProps {
  permission?: PermissionKey;
  allowedRoles?: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showCorporateNotice?: boolean;
  featureName?: string;
}

export const RbacGuard: React.FC<RbacGuardProps> = ({
  permission,
  allowedRoles,
  children,
  fallback,
  showCorporateNotice = true,
  featureName = 'this corporate feature'
}) => {
  const { currentUser, hasPermission, switchUserRole, rolePermissions, navigateTo } = useTenant();

  let isAuthorized = true;

  if (permission && !hasPermission(permission)) {
    isAuthorized = false;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Tenant Admin always has master bypass
    if (currentUser.role !== 'Tenant Admin') {
      isAuthorized = false;
    }
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showCorporateNotice) {
    return null;
  }

  const roleConfig = rolePermissions[currentUser.role];

  return (
    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl max-w-2xl mx-auto my-6 text-center space-y-4 shadow-xs">
      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
        <ShieldAlert className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
          <Lock className="w-3 h-3" />
          Access Restricted by Corporate RBAC
        </div>
        <h3 className="text-base font-bold text-slate-900">
          Role Permission Required for {featureName}
        </h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          Your current active persona is <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.role}). 
          Corporate governance (SOC 2 / ISO 27001) enforces segregation of duties and least-privilege access for this operation.
        </p>
      </div>

      {/* Permission Explanation Card */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-left text-xs space-y-2 max-w-lg mx-auto">
        <div className="flex items-center justify-between font-semibold text-slate-800 border-b border-slate-100 pb-2">
          <span>Required Privilege:</span>
          <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {permission || 'Admin/Manager Access'}
          </span>
        </div>
        <div className="text-[11px] text-slate-500">
          To perform this action or test this workflow, switch to an authorized role below or modify RBAC policies in Organization Settings.
        </div>
      </div>

      {/* Quick Role Switcher Buttons for Demo */}
      <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => switchUserRole('Tenant Admin')}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
        >
          <Shield className="w-3.5 h-3.5" />
          Switch to Super Admin
        </button>

        <button
          onClick={() => switchUserRole('HR Manager')}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
        >
          Switch to HR Manager
        </button>

        <button
          onClick={() => switchUserRole('Finance Officer')}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
        >
          Switch to Finance Officer
        </button>

        <button
          onClick={() => navigateTo('settings')}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
        >
          View RBAC Settings
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
