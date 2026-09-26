import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { TenantModule } from '../../types/hrms';
import { MODULE_CATALOG } from '../../data/initialData';
import { 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  Zap, 
  HelpCircle,
  X,
  ExternalLink
} from 'lucide-react';

interface ModuleGuardProps {
  module: TenantModule;
  children: React.ReactNode;
}

export const ModuleGuard: React.FC<ModuleGuardProps> = ({ module, children }) => {
  const { 
    currentTenant, 
    tenants, 
    isModuleSubscribed, 
    activateModuleTrial, 
    upgradePlan, 
    switchTenant,
    showToast
  } = useTenant();

  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoFormData, setDemoFormData] = useState({ name: '', email: '', companySize: '50-250', notes: '' });
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  const isSubscribed = isModuleSubscribed(module);

  if (isSubscribed) {
    return <>{children}</>;
  }

  const moduleInfo = MODULE_CATALOG[module] || {
    id: module,
    name: 'Advanced HR Module',
    shortDesc: 'This module is restricted to upgraded workspace plans.',
    fullDesc: 'Unlock enterprise workflows, automated compliance, and real-time operational efficiency.',
    category: 'Operations',
    icon: 'Lock',
    badgeColor: 'blue',
    pricePerUserMonthly: 4.0,
    features: ['Automated workflows', 'Multi-level approvals', 'Audit trails', 'Custom reports'],
    roiMetric: 'Boosts operational throughput significantly'
  };

  // Find a tenant that has this module enabled for quick testing
  const demoTenantWithModule = tenants.find(t => t.activeModules.includes(module));

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitted(true);
    setTimeout(() => {
      setIsDemoModalOpen(false);
      setDemoSubmitted(false);
      showToast('Demo Requested', 'Our enterprise solutions architect will contact you in <15 minutes.', 'success');
    }, 1200);
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center py-6 px-3 sm:px-6">
      {/* 403 Card Container */}
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-10 relative overflow-hidden">
        
        {/* Header Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">HTTP 403 · LOCKED</span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-medium text-slate-500">TENANT: {currentTenant.name}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
                {moduleInfo.name} is Not Subscribed
              </h1>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg border sm:border-0 border-slate-200">
            <span className="text-xs text-slate-500 block font-medium">Current Workspace Plan</span>
            <span className="text-sm font-bold text-slate-800">
              {currentTenant.plan} Plan ({currentTenant.activeModules.length}/6 Active)
            </span>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Left Column: Description & Features */}
          <div className="lg:col-span-7 space-y-5">
            <p className="text-slate-600 text-sm leading-relaxed">
              {moduleInfo.fullDesc}
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
                <Zap className="w-4 h-4 text-blue-600" />
                ENTERPRISE CAPABILITIES INCLUDED:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {moduleInfo.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong className="text-blue-950 font-semibold">Expected Impact:</strong> {moduleInfo.roiMetric}
              </span>
            </div>
          </div>

          {/* Right Column: Pricing & Fast Activation Box */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Add-on Pricing</div>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
                  ${moduleInfo.pricePerUserMonthly.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500">/ user / month</span>
              </div>
              <p className="text-xs text-slate-500 leading-normal mb-5">
                Billed {currentTenant.billingCycle} with prorated seat allocation for your {currentTenant.employeeCount} team members.
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Button 1: Instant 14-day trial */}
              <button
                onClick={() => activateModuleTrial(module)}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Activate 14-Day Free Trial
              </button>

              {/* Button 2: Upgrade whole plan */}
              <button
                onClick={() => upgradePlan(currentTenant.id, 'Enterprise')}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-200 shadow-2xs"
              >
                Upgrade to Enterprise Plan
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Button 3: Talk to sales */}
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="w-full py-2 px-4 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Schedule Enterprise Consultation
              </button>
            </div>
          </div>
        </div>

        {/* Quick Multi-Tenant Preview Helper */}
        {demoTenantWithModule && (
          <div className="pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-slate-50/60 -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-4 sm:px-10">
            <div className="flex items-center gap-2 text-slate-600">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Want to test live demo data? This module is subscribed on{' '}
                <strong className="text-slate-900">{demoTenantWithModule.name}</strong>.
              </span>
            </div>
            <button
              onClick={() => switchTenant(demoTenantWithModule.id)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-blue-700 font-semibold rounded-md transition-colors border border-slate-200 shadow-2xs whitespace-nowrap flex items-center gap-1.5"
            >
              Switch to {demoTenantWithModule.name}
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Enterprise Demo Modal */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsDemoModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Request {moduleInfo.name} Demo
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Speak with a dedicated Solutions Architect for custom compliance & enterprise SSO.
            </p>

            <form onSubmit={handleDemoSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={demoFormData.name}
                  onChange={e => setDemoFormData({ ...demoFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="jane@company.com"
                  value={demoFormData.email}
                  onChange={e => setDemoFormData({ ...demoFormData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Team Size</label>
                <select
                  value={demoFormData.companySize}
                  onChange={e => setDemoFormData({ ...demoFormData, companySize: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="10-50">10 - 50 employees</option>
                  <option value="50-250">50 - 250 employees</option>
                  <option value="250-1000">250 - 1,000 employees</option>
                  <option value="1000+">1,000+ Enterprise</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={demoSubmitted}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  {demoSubmitted ? 'Submitting...' : 'Confirm Demo Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
