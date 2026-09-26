import { Tenant, UserProfile, PermissionKey, TenantModule } from '../types/hrms';

export interface NavRouteItem {
  id: string;
  label: string;
  module?: TenantModule;
  category: string;
  adminOnly?: boolean;
}

/**
 * Checks whether a given user in a specific tenant workspace has access to a navigation route/module.
 */
export const canUserAccessRoute = (
  routeId: string,
  tenant: Tenant,
  user: UserProfile,
  hasPermission: (perm: PermissionKey) => boolean
): boolean => {
  // 1. Personal Space & Root Workspace Dashboard are always accessible
  if (routeId === 'dashboard' || routeId === 'myspace') {
    return true;
  }

  // 2. Tenant & Plan Settings is restricted to Tenant Admins / Governance controllers
  if (routeId === 'settings') {
    return user.role === 'Tenant Admin' || hasPermission('configure_modules') || hasPermission('manage_rbac_matrix');
  }

  // 3. Module-linked routes require the tenant to have the module actively subscribed / on trial
  const moduleMap: Record<string, TenantModule> = {
    core_hr: 'core_hr',
    attendance: 'attendance',
    leave: 'leave',
    payroll: 'payroll',
    expenses: 'expenses',
    lifecycle: 'lifecycle',
    ats: 'ats',
    ai_hub: 'ai_hub'
  };

  const moduleId = moduleMap[routeId];
  if (moduleId) {
    const isSubscribed = tenant.activeModules.includes(moduleId);
    // If the tenant has not subscribed to the module, no regular user has access.
    if (!isSubscribed) {
      return false;
    }

    // Role-specific granular permission requirements
    switch (moduleId) {
      case 'core_hr':
      case 'attendance':
      case 'leave':
        // Core employee self-service and team operations are accessible to all workspace users
        return true;

      case 'payroll':
        // Only roles with payroll execution or compensation access can see the Payroll engine
        return (
          user.role === 'Tenant Admin' ||
          user.role === 'Finance Officer' ||
          hasPermission('execute_payroll') ||
          hasPermission('view_compensation')
        );

      case 'expenses':
        // Available to all users when module is subscribed (employees submit, managers approve)
        return true;

      case 'lifecycle':
        // Asset assignment & exit clearance management
        return (
          user.role === 'Tenant Admin' ||
          user.role === 'HR Manager' ||
          hasPermission('manage_assets') ||
          hasPermission('manage_exit_clearance')
        );

      case 'ats':
        // Recruitment applicant tracking system
        return (
          user.role === 'Tenant Admin' ||
          user.role === 'HR Manager' ||
          hasPermission('manage_ats')
        );

      case 'ai_hub':
        // AI Policy and HR Copilot tools
        return hasPermission('use_ai_tools');

      default:
        return true;
    }
  }

  return true;
};
