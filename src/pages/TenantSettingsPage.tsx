import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { TenantModule, TenantPlan } from '../types/hrms';
import { MODULE_CATALOG } from '../data/initialData';
import { 
  CheckCircle2, 
  Plus, 
  Check, 
  Sparkles, 
  X, 
  ArrowRight 
} from 'lucide-react';

export const TenantSettingsPage: React.FC = () => {
  const { 
    tenants, 
    currentTenant, 
    switchTenant, 
    toggleModule, 
    upgradePlan, 
    createTenant 
  } = useTenant();

  const [activeTab, setActiveTab] = useState<'modules' | 'plans' | 'all_tenants'>('modules');
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
            Dynamically toggle feature modules, configure plan tiers, and manage multi-tenant workspaces in real time.
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allModules.map(modId => {
              const meta = MODULE_CATALOG[modId];
              const isSubscribed = currentTenant.activeModules.includes(modId);

              return (
                <div
                  key={modId}
                  className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                    isSubscribed
                      ? 'bg-white border-blue-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-90'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{meta.name}</h3>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 font-medium">{meta.category}</span>
                      </div>

                      {/* Interactive Toggle Switch */}
                      <button
                        onClick={() => toggleModule(currentTenant.id, modId)}
                        className={`w-11 h-6 rounded-full transition-colors relative p-0.5 focus:outline-none ${
                          isSubscribed ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                        title={isSubscribed ? 'Deactivate Module' : 'Activate Module'}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                            isSubscribed ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {meta.shortDesc}
                    </p>

                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      {meta.features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      ${meta.pricePerUserMonthly.toFixed(2)}/user/mo
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      isSubscribed
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-amber-700 bg-amber-50 border-amber-200'
                    }`}>
                      {isSubscribed ? 'ENTITLED' : 'LOCKED'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Plan Tiers */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Starter Plan */}
            <div className={`p-6 rounded-xl border flex flex-col justify-between ${
              currentTenant.plan === 'Starter'
                ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-slate-900">Starter</h3>
                  {currentTenant.plan === 'Starter' && (
                    <span className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      CURRENT PLAN
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-slate-900">$6</span>
                  <span className="text-xs text-slate-500">/ user / month</span>
                </div>
                <p className="text-xs text-slate-500">
                  Essential HR database and time attendance for early teams up to 50 members.
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="text-[11px] font-bold text-slate-700 uppercase">Included Modules:</div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Check className="w-4 h-4 text-emerald-600" /> Core HR & People
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Check className="w-4 h-4 text-emerald-600" /> Time & Attendance
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <X className="w-4 h-4 text-slate-300" /> Leave & Absence
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <X className="w-4 h-4 text-slate-300" /> Payroll & Compensation
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <X className="w-4 h-4 text-slate-300" /> Recruitment ATS
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <X className="w-4 h-4 text-slate-300" /> AI Intelligence Hub
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => upgradePlan(currentTenant.id, 'Starter')}
                  disabled={currentTenant.plan === 'Starter'}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
                >
                  {currentTenant.plan === 'Starter' ? 'Current Tier' : 'Switch to Starter'}
                </button>
              </div>
            </div>

            {/* Growth Plan */}
            <div className={`p-6 rounded-xl border flex flex-col justify-between ${
              currentTenant.plan === 'Growth'
                ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-slate-900">Growth</h3>
                  {currentTenant.plan === 'Growth' && (
                    <span className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      CURRENT PLAN
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-slate-900">$12</span>
                  <span className="text-xs text-slate-500">/ user / month</span>
                </div>
                <p className="text-xs text-slate-500">
                  Full HR operations, leave approvals, and automated ACH payroll for scaling companies.
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="text-[11px] font-bold text-slate-700 uppercase">Included Modules:</div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Check className="w-4 h-4 text-emerald-600" /> Core HR & People
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Check className="w-4 h-4 text-emerald-600" /> Time & Attendance
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Check className="w-4 h-4 text-emerald-600" /> Leave & Absence
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Check className="w-4 h-4 text-emerald-600" /> Payroll & Compensation
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <X className="w-4 h-4 text-slate-300" /> Recruitment ATS
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <X className="w-4 h-4 text-slate-300" /> AI Intelligence Hub
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => upgradePlan(currentTenant.id, 'Growth')}
                  disabled={currentTenant.plan === 'Growth'}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  {currentTenant.plan === 'Growth' ? 'Current Tier' : 'Upgrade to Growth'}
                </button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className={`p-6 rounded-xl border flex flex-col justify-between ${
              currentTenant.plan === 'Enterprise'
                ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-slate-900">Enterprise Suite</h3>
                  {currentTenant.plan === 'Enterprise' && (
                    <span className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      CURRENT PLAN
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-slate-900">$21.50</span>
                  <span className="text-xs text-slate-500">/ user / month</span>
                </div>
                <p className="text-xs text-slate-500">
                  All 6 modules unlocked with Gen-AI HR assistant, recruitment ATS, and dedicated SLAs.
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="text-[11px] font-bold text-slate-700 uppercase">Included Modules:</div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Check className="w-4 h-4 text-emerald-600" /> Core HR & People
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Check className="w-4 h-4 text-emerald-600" /> Time & Attendance
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Check className="w-4 h-4 text-emerald-600" /> Leave & Absence
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Check className="w-4 h-4 text-emerald-600" /> Payroll & Compensation
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Check className="w-4 h-4 text-emerald-600" /> Recruitment ATS
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Check className="w-4 h-4 text-emerald-600" /> AI Intelligence Hub
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => upgradePlan(currentTenant.id, 'Enterprise')}
                  disabled={currentTenant.plan === 'Enterprise'}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  {currentTenant.plan === 'Enterprise' ? 'Current Tier' : 'Upgrade to Enterprise'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: All Tenants Grid & Switcher */}
      {activeTab === 'all_tenants' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Multi-Tenant Organizations</h2>
              <p className="text-xs text-slate-500">Switch between isolated enterprise tenant instances</p>
            </div>
            <span className="text-xs font-mono text-slate-500 font-medium">
              {tenants.length} Workspaces Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenants.map(t => {
              const isCurrent = t.id === currentTenant.id;
              return (
                <div
                  key={t.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    isCurrent 
                      ? 'bg-blue-50/50 border-blue-300 shadow-xs' 
                      : 'bg-white border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 text-blue-700 font-bold flex items-center justify-center text-sm shadow-2xs">
                          {t.logoInitials}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{t.name}</h3>
                          <div className="text-[11px] text-slate-500">{t.domain}</div>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {t.plan}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs pt-2">
                      <div className="p-2 bg-slate-50 border border-slate-200/70 rounded">
                        <span className="text-slate-500 block text-[10px] font-medium">Headcount</span>
                        <span className="font-mono text-slate-900 font-bold">{t.employeeCount}</span>
                      </div>
                      <div className="p-2 bg-slate-50 border border-slate-200/70 rounded">
                        <span className="text-slate-500 block text-[10px] font-medium">Modules</span>
                        <span className="font-mono text-emerald-700 font-bold">{t.activeModules.length} / 6</span>
                      </div>
                      <div className="p-2 bg-slate-50 border border-slate-200/70 rounded">
                        <span className="text-slate-500 block text-[10px] font-medium">Spend</span>
                        <span className="font-mono text-slate-800 font-bold">${t.monthlySpend}/mo</span>
                      </div>
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
