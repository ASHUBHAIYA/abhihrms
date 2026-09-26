import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { TenantModule } from '../../types/hrms';
import { 
  Users, 
  Clock, 
  CalendarOff, 
  Receipt, 
  Briefcase, 
  Sparkles, 
  LayoutDashboard, 
  Sliders, 
  Lock, 
  ChevronDown, 
  Building2, 
  Check, 
  Plus, 
  ShieldCheck, 
  CreditCard, 
  Laptop, 
  X 
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { 
    tenants, 
    currentTenant, 
    switchTenant, 
    isModuleSubscribed, 
    activeRoute, 
    navigateTo,
    currentUser
  } = useTenant();

  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);

  const navItems: { id: string; label: string; icon: any; module?: TenantModule; category: string; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, category: 'Main' },
    { id: 'core_hr', label: 'Core HR (Employees & Org)', icon: Users, module: 'core_hr', category: 'HR Operations' },
    { id: 'attendance', label: 'Attendance & Shifts', icon: Clock, module: 'attendance', category: 'HR Operations' },
    { id: 'leave', label: 'Leave Management', icon: CalendarOff, module: 'leave', category: 'HR Operations' },
    { id: 'payroll', label: 'Payroll Engine', icon: Receipt, module: 'payroll', category: 'Finance & Comp' },
    { id: 'expenses', label: 'Expenses & Claims', icon: CreditCard, module: 'expenses', category: 'Finance & Comp' },
    { id: 'lifecycle', label: 'Assets & Lifecycle', icon: Laptop, module: 'lifecycle', category: 'HR Operations' },
    { id: 'ats', label: 'AI Recruiter / ATS', icon: Briefcase, module: 'ats', category: 'Talent Acquisition' },
    { id: 'ai_hub', label: 'AI Policy Hub', icon: Sparkles, module: 'ai_hub', category: 'Intelligence' },
    { id: 'settings', label: 'Tenant & Plan Settings', icon: Sliders, category: 'Administration', adminOnly: true },
  ];

  const handleNavClick = (id: string) => {
    navigateTo(id);
    setMobileOpen(false);
  };

  const seatPercentage = Math.round((currentTenant.employeeCount / currentTenant.maxSeats) * 100);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-blue-500/30">
            N
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-slate-900 block leading-tight">
              NexusHR Cloud
            </span>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider block">
              MULTI-TENANT SAAS
            </span>
          </div>
        </div>

        {/* Close Button on Mobile Drawer */}
        <button
          onClick={() => setMobileOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tenant Switcher Section */}
      <div className="p-3 border-b border-slate-200 relative shrink-0 bg-slate-50/50">
        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-1 mb-1.5 flex items-center justify-between">
          <span>Active Tenant</span>
          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
            {currentTenant.plan}
          </span>
        </div>

        <button
          onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
          className="w-full p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs transition-colors flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
              {currentTenant.logoInitials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                {currentTenant.name}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {currentTenant.domain}
              </div>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${tenantDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
        </button>

        {/* Switcher Dropdown List */}
        {tenantDropdownOpen && (
          <div className="absolute top-full left-3 right-3 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in">
            <div className="text-[10px] font-bold text-slate-500 px-2 py-1 uppercase tracking-wider">
              Select Workspace Tenant
            </div>
            <div className="space-y-0.5 max-h-60 overflow-y-auto">
              {tenants.map(t => {
                const isCurrent = t.id === currentTenant.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      switchTenant(t.id);
                      setTenantDropdownOpen(false);
                    }}
                    className={`w-full p-2 rounded-lg flex items-center justify-between text-left transition-colors ${
                      isCurrent 
                        ? 'bg-blue-50 text-blue-900 border border-blue-200 font-medium' 
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center shrink-0 ${
                        isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {t.logoInitials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">{t.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {t.plan} · {t.activeModules.length} Modules
                        </div>
                      </div>
                    </div>
                    {isCurrent && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-1 pt-1 border-t border-slate-100">
              <button
                onClick={() => {
                  setTenantDropdownOpen(false);
                  navigateTo('settings');
                }}
                className="w-full p-1.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-1.5 rounded transition-colors font-medium"
              >
                <Plus className="w-3 h-3" />
                Manage / Add Tenant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-1">
            Workspaces & Modules
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;
            const isSubscribed = item.module ? isModuleSubscribed(item.module) : true;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {/* Lock Indicator for unsubscribed modules */}
                {item.module && !isSubscribed && (
                  <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ml-1 border ${
                    isActive 
                      ? 'bg-white/20 text-white border-white/30' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    <Lock className="w-2.5 h-2.5" />
                    LOCKED
                  </span>
                )}

                {/* AI Sparkle Tag */}
                {item.id === 'ai_hub' && isSubscribed && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold shrink-0 ml-1 border ${
                    isActive
                      ? 'bg-white/20 text-white border-white/30'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Workspace Metrics */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70 space-y-2.5 shrink-0">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-500 font-medium">Seats Utilized</span>
            <span className="font-mono text-slate-800 font-bold tabular-nums">
              {currentTenant.employeeCount} / {currentTenant.maxSeats}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                seatPercentage > 90 ? 'bg-rose-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, seatPercentage)}%` }}
            />
          </div>
        </div>

        <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-[11px] text-slate-700 font-medium">
              {currentTenant.activeModules.length}/6 Entitled
            </div>
          </div>
          <button
            onClick={() => handleNavClick('settings')}
            className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold hover:underline"
          >
            Configure
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Slide-Over Drawer with Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Dark Overlay */}
          <div 
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
          />

          {/* Sliding Sheet */}
          <aside className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 transition-transform duration-300 ease-out">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop Fixed Static Sidebar */}
      <aside className="hidden lg:flex w-64 h-full shrink-0 flex-col">
        {sidebarContent}
      </aside>
    </>
  );
};
