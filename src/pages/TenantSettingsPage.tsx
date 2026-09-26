import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { TenantModule, TenantPlan, UserRole, PermissionKey } from '../types/hrms';
import { MODULE_CATALOG } from '../data/initialData';
import { 
  CheckCircle2, 
  Plus, 
  Check, 
  Sparkles, 
  X, 
  ArrowRight,
  Shield,
  ShieldCheck,
  Lock,
  RotateCcw,
  Sliders,
  AlertCircle,
  FileText,
  UserCheck,
  Building2,
  Users
} from 'lucide-react';

export const TenantSettingsPage: React.FC = () => {
  const { 
    tenants, 
    currentTenant, 
    switchTenant, 
    toggleModule, 
    upgradePlan, 
    createTenant,
    currentUser,
    rolePermissions,
    updateRolePermission,
    resetRolePermissionsToDefault,
    switchUserRole
  } = useTenant();

  const [activeTab, setActiveTab] = useState<'modules' | 'plans' | 'all_tenants' | 'rbac'>('modules');
  const [isNewTenantModalOpen, setIsNewTenantModalOpen] = useState(false);

  // New Tenant Form State
  const [newTenantForm, setNewTenantForm] = useState({
    name: '',
    plan: 'Starter' as TenantPlan,
    billingCycle: 'monthly' as const,
    headquarters: 'Seattle, WA',
    employeeCount: 20,
    maxSeats: 50,
    selectedModules: ['core_hr', 'attendance'] as TenantModule[]
  });

  const allModules: TenantModule[] = ['core_hr', 'attendance', 'leave', 'payroll', 'expenses', 'lifecycle', 'ats', 'ai_hub'];

  const allRoles: UserRole[] = ['Tenant Admin', 'HR Manager', 'Finance Officer', 'Department Lead', 'Employee'];

  const permissionDefinitions: { key: PermissionKey; label: string; category: string; description: string }[] = [
    { key: 'manage_employees', label: 'Manage Employee Master Directory', category: 'Core HR', description: 'Add, edit, or terminate employee profiles and personal records' },
    { key: 'view_compensation', label: 'View Statutory CTC & Base Salary', category: 'Compensation', description: 'Access unmasked annual compensation, bank accounts, and tax numbers' },
    { key: 'execute_payroll', label: 'Run & Disburse Monthly Payroll', category: 'Compensation', description: 'Trigger bank clearing batches and authorize ACH/Wire disbursements' },
    { key: 'approve_leaves', label: 'Approve & Reject Leave Requests', category: 'Time & Leave', description: 'Authorize employee paid/sick leaves and manage team capacity' },
    { key: 'approve_expenses', label: 'Sign-off on Expense Claims', category: 'Finance', description: 'Audit travel receipts and push approved reimbursements to payroll' },
    { key: 'manage_ats', label: 'ATS & Candidate Pipeline', category: 'Talent', description: 'Post job requisitions, parse resumes with Gemini AI, and schedule interviews' },
    { key: 'manage_assets', label: 'IT Asset Allocation & Tracking', category: 'Operations', description: 'Assign MacBooks/monitors, manage hardware inventory and reclaim devices' },
    { key: 'manage_exit_clearance', label: 'Separation & Full/Final (F&F)', category: 'Lifecycle', description: 'Complete department exit checklist and issue statutory final settlements' },
    { key: 'configure_modules', label: 'Tenant Subscription & Modules', category: 'Administration', description: 'Toggle feature modules, manage billing plans and provision tenants' },
    { key: 'manage_rbac_matrix', label: 'Corporate RBAC Policy Settings', category: 'Administration', description: 'Modify role permission matrix and security governance rules' },
    { key: 'export_reports', label: 'Export Audit Logs & CSV Reports', category: 'Compliance', description: 'Download compliance reports, directory exports, and attendance rosters' },
    { key: 'use_ai_tools', label: 'Access AI Hub & Policy Assistant', category: 'Intelligence', description: 'Query RAG policy assistant, generate JDs, and draft performance reviews' }
  ];

  const handleCreateTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTenant({
      name: newTenantForm.name,
      plan: newTenantForm.plan,
      billingCycle: newTenantForm.billingCycle,
      headquarters: newTenantForm.headquarters,
      employeeCount: Number(newTenantForm.employeeCount),
      maxSeats: Number(newTenantForm.maxSeats),
      activeModules: newTenantForm.selectedModules
    });
    setIsNewTenantModalOpen(false);
    setNewTenantForm({
      name: '',
      plan: 'Starter',
      billingCycle: 'monthly',
      headquarters: 'Seattle, WA',
      employeeCount: 20,
      maxSeats: 50,
      selectedModules: ['core_hr', 'attendance']
    });
  };

  const toggleNewTenantModule = (mod: TenantModule) => {
    setNewTenantForm(prev => {
      const exists = prev.selectedModules.includes(mod);
      return {
        ...prev,
        selectedModules: exists 
          ? prev.selectedModules.filter(m => m !== mod)
          : [...prev.selectedModules, mod]
      };
    });
  };

  return (
    <div className="space-y-6 pb-12 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Tenant Entitlements & Subscription Switchboard
            </h1>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
              {currentTenant.name} ({currentTenant.plan})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamically toggle feature modules, configure plan tiers, and manage multi-tenant workspaces and RBAC policies in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tab buttons */}
          <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('modules')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'modules' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Module Entitlements
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'plans' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Plan Tiers
            </button>
            <button
              onClick={() => setActiveTab('rbac')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'rbac' ? 'bg-white text-blue-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              Corporate RBAC & Security
            </button>
            <button
              onClick={() => setActiveTab('all_tenants')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'all_tenants' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Tenants ({tenants.length})
            </button>
          </div>

          <button
            onClick={() => setIsNewTenantModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            New Tenant
          </button>
        </div>
      </div>

      {/* Tab 1: Module Entitlement Switchboard */}
      {activeTab === 'modules' && (
        <div className="space-y-5">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong className="text-blue-950 font-bold">Live Entitlement Guard Testing:</strong> Flip any module toggle below to immediately grant or revoke subscription access for <strong>{currentTenant.name}</strong>. Revoking a module locks that section behind the 403 Paywall guard.
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-blue-300 text-blue-800">
              {currentTenant.activeModules.length} Active Modules
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {allModules.map(modKey => {
              const meta = MODULE_CATALOG[modKey];
              const isSubscribed = currentTenant.activeModules.includes(modKey);

              return (
                <div 
                  key={modKey}
                  className={`bg-white border rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                    isSubscribed ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-200 opacity-90'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isSubscribed ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {modKey.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">{meta?.name || modKey}</h3>
                          <span className="text-[10px] text-slate-500 font-mono">Module ID: {modKey}</span>
                        </div>
                      </div>

                      {/* Live Toggle Switch */}
                      <button
                        onClick={() => toggleModule(currentTenant.id, modKey)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isSubscribed ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                        role="switch"
                        aria-checked={isSubscribed}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            isSubscribed ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {meta?.shortDesc}
                    </p>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Included Key Capabilities
                      </span>
                      <ul className="space-y-1">
                        {meta?.features.slice(0, 3).map((feat, idx) => (
                          <li key={idx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">
                      ${meta?.pricePerUserMonthly}/seat/mo
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isSubscribed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isSubscribed ? 'SUBSCRIBED' : 'DISABLED'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Subscription Plans */}
      {activeTab === 'plans' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['Starter', 'Growth', 'Enterprise'] as TenantPlan[]).map(planName => {
              const isCurrent = currentTenant.plan === planName;
              const price = planName === 'Starter' ? '$150' : planName === 'Growth' ? '$400' : '$1,200';
              const seatLimit = planName === 'Starter' ? 'Up to 25 seats' : planName === 'Growth' ? 'Up to 75 seats' : 'Up to 150+ seats';

              return (
                <div 
                  key={planName} 
                  className={`bg-white rounded-2xl p-6 border shadow-xs flex flex-col justify-between ${
                    isCurrent ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                        {planName}
                      </span>
                      {isCurrent && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active Plan
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-3xl font-extrabold text-slate-900 font-mono">
                        {price} <span className="text-xs font-sans text-slate-500 font-normal">/ month</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{seatLimit}</p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-700">
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-600" />
                        <span>{planName === 'Starter' ? 'Core HR, Attendance & Leave' : planName === 'Growth' ? 'Includes Payroll, ATS & AI Hub' : 'All 8 Enterprise Modules Unlocked'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-600" />
                        <span>Corporate RBAC Governance & Audit Trail</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-600" />
                        <span>Standard SLA Guarantee & Priority Support</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    {isCurrent ? (
                      <button disabled className="w-full py-2 bg-slate-100 text-slate-400 text-xs font-bold rounded-lg cursor-default">
                        Current Tier
                      </button>
                    ) : (
                      <button
                        onClick={() => upgradePlan(currentTenant.id, planName)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                      >
                        Switch to {planName}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Corporate RBAC & Security Policy Matrix */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          {/* Corporate Governance Callout */}
          <div className="p-5 bg-gradient-to-r from-blue-500/10 via-indigo-50/60 to-white border border-blue-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-700" />
                  SOC 2 Type II & ISO 27001 Compliant
                </span>
                <span className="text-xs font-mono text-slate-500">Corporate Governance Standard</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Corporate Role-Based Access Control (RBAC) & Segregation of Duties (SoD)
              </h3>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                <strong>Why is this setting necessary in corporate?</strong> Enterprises mandate strict segregation of duties (SoD) to prevent compensation exposure, unauthorized payroll execution, self-approved expense claims, and administrative privilege tampering.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={resetRolePermissionsToDefault}
                className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                title="Restore default enterprise permission matrix"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Security Defaults
              </button>
            </div>
          </div>

          {/* Persona Switcher Quick Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  Live Persona Switcher (Test RBAC Restrictions Across Workspaces)
                </span>
                <p className="text-[11px] text-slate-500">
                  Switch personas to instantly experience restricted view states, ESS self-service mode, and approval locks.
                </p>
              </div>
              <div className="text-xs font-mono">
                Current Persona: <strong className="text-blue-700">{currentUser.name}</strong> ({currentUser.role})
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {allRoles.map((r) => {
                const isActive = currentUser.role === r;
                return (
                  <button
                    key={r}
                    onClick={() => switchUserRole(r)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isActive 
                        ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100' 
                        : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{r}</span>
                        {isActive && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {rolePermissions[r]?.displayName || r}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-blue-600 mt-2 block">
                      {isActive ? '● CURRENT USER' : 'Click to Switch'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Granular Permission Matrix Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Granular Privilege Matrix by Corporate Role
                </h4>
                <p className="text-[11px] text-slate-500">
                  Toggle fine-grained capabilities. Tenant Admin holds root organizational bypass.
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                12 Permission Nodes Managed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 w-2/5">Capability & Permission Scope</th>
                    {allRoles.map(role => (
                      <th key={role} className="py-3 px-3 text-center">
                        <span className="block font-bold text-slate-900">{role}</span>
                        <span className="block text-[9px] font-normal text-slate-400 font-mono">
                          {role === 'Tenant Admin' ? '(Root)' : role === 'Employee' ? '(ESS)' : '(Manager)'}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {permissionDefinitions.map(perm => (
                    <tr key={perm.key} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{perm.label}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {perm.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{perm.description}</p>
                      </td>

                      {allRoles.map(role => {
                        const isGranted = role === 'Tenant Admin' ? true : !!rolePermissions[role]?.permissions[perm.key];
                        const isLockedRoot = role === 'Tenant Admin';

                        return (
                          <td key={role} className="py-3 px-3 text-center">
                            {isLockedRoot ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-700 border border-blue-200" title="Root Administrator (Bypass)">
                                <Lock className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <button
                                onClick={() => updateRolePermission(role, perm.key, !isGranted)}
                                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer mx-auto ${
                                  isGranted
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs'
                                    : 'bg-slate-50 border-slate-200 text-slate-300 hover:border-slate-300'
                                }`}
                                title={`Toggle "${perm.label}" for ${role}`}
                              >
                                {isGranted ? <Check className="w-4 h-4 font-bold" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: All Tenants Overview */}
      {activeTab === 'all_tenants' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenants.map((t) => {
              const isCurrent = t.id === currentTenant.id;
              return (
                <div 
                  key={t.id}
                  className={`bg-white rounded-xl p-5 border shadow-xs transition-all ${
                    isCurrent ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-sm ${
                        isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {t.logoInitials}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                        <div className="text-xs text-slate-500 font-mono">
                          ID: {t.id} · Domain: {t.domain}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {t.plan}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Seats Active</span>
                      <span className="font-bold text-slate-800">{t.employeeCount} / {t.maxSeats}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Monthly Billing</span>
                      <span className="font-bold text-slate-800">${t.monthlySpend}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Active Modules</span>
                      <span className="font-bold text-blue-700">{t.activeModules.length} Subscribed</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex justify-end">
                    {isCurrent ? (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Active Workspace
                      </span>
                    ) : (
                      <button
                        onClick={() => switchTenant(t.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-blue-700 text-xs rounded-lg transition-colors font-semibold flex items-center gap-1.5 border border-slate-200"
                      >
                        Switch To This Tenant <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Provision New Tenant Modal */}
      {isNewTenantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsNewTenantModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Provision New SaaS Tenant</h3>
            <p className="text-xs text-slate-500 mb-4">Initialize an isolated multi-tenant organization context.</p>

            <form onSubmit={handleCreateTenantSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Horizon Robotics Inc."
                  value={newTenantForm.name}
                  onChange={e => setNewTenantForm({ ...newTenantForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Subscription Plan</label>
                  <select
                    value={newTenantForm.plan}
                    onChange={e => setNewTenantForm({ ...newTenantForm, plan: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Growth">Growth</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Headquarters</label>
                  <input
                    type="text"
                    value={newTenantForm.headquarters}
                    onChange={e => setNewTenantForm({ ...newTenantForm, headquarters: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-semibold">Active Subscribed Modules</label>
                <div className="grid grid-cols-2 gap-2">
                  {allModules.map(mod => {
                    const isChecked = newTenantForm.selectedModules.includes(mod);
                    return (
                      <button
                        type="button"
                        key={mod}
                        onClick={() => toggleNewTenantModule(mod)}
                        className={`p-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                          isChecked 
                            ? 'bg-blue-50 border-blue-300 text-blue-950 font-semibold' 
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="text-xs capitalize">{mod.replace('_', ' ')}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-xs"
                >
                  Provision Tenant Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
