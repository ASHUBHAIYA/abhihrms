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
  ChevronDown, 
  Building2, 
  Check, 
  CreditCard, 
  Laptop, 
  User,
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
    activeRoute, 
    navigateTo,
    canAccessRoute
  } = useTenant();

  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [spaceView, setSpaceView] = useState<'myspace' | 'team'>(() => {
    return activeRoute === 'myspace' ? 'myspace' : 'team';
  });

  const teamNavItems: { id: string; label: string; icon: any; module?: TenantModule }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'core_hr', label: 'Directory', icon: Users, module: 'core_hr' },
    { id: 'attendance', label: 'Attendance', icon: Clock, module: 'attendance' },
    { id: 'leave', label: 'Leave', icon: CalendarOff, module: 'leave' },
    { id: 'payroll', label: 'Payroll', icon: Receipt, module: 'payroll' },
    { id: 'expenses', label: 'Expenses', icon: CreditCard, module: 'expenses' },
    { id: 'lifecycle', label: 'Lifecycle & Assets', icon: Laptop, module: 'lifecycle' },
    { id: 'ats', label: 'Recruitment', icon: Briefcase, module: 'ats' },
    { id: 'ai_hub', label: 'AI Policy Hub', icon: Sparkles, module: 'ai_hub' },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  const mySpaceNavItems: { id: string; label: string; icon: any }[] = [
    { id: 'myspace', label: 'My Space', icon: User },
    { id: 'core_hr', label: 'Directory', icon: Building2 },
    { id: 'leave', label: 'Leave & Holidays', icon: CalendarOff },
    ...(canAccessRoute('ai_hub') ? [{ id: 'ai_hub', label: 'Policy Assistant', icon: Sparkles }] : [])
  ];

  const visibleTeamItems = teamNavItems.filter(item => canAccessRoute(item.id));
  const canAccessSettings = canAccessRoute('settings');

  const handleNavClick = (id: string) => {
    navigateTo(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
            N
          </div>
          <span className="text-sm font-bold text-slate-900 tracking-tight">
            NexusHR
          </span>
        </div>

        <button
          onClick={() => setMobileOpen(false)}
          className="p-1 text-slate-400 hover:text-slate-700 lg:hidden rounded-lg hover:bg-slate-100"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tenant Switcher */}
      <div className="p-3 border-b border-slate-100 relative shrink-0">
        <button
          onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
          className="w-full p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              {currentTenant.logoInitials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">
                {currentTenant.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {currentTenant.plan}
              </div>
            </div>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${tenantDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {tenantDropdownOpen && (
          <div className="absolute top-full left-3 right-3 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-50 animate-in fade-in">
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {tenants.map(t => {
                const isCurrent = t.id === currentTenant.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      switchTenant(t.id);
                      setTenantDropdownOpen(false);
                    }}
                    className={`w-full px-2 py-1.5 rounded-lg flex items-center justify-between text-left text-xs transition-colors ${
                      isCurrent ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{t.name}</span>
                    {isCurrent && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Workspace Switcher: My Space vs Team */}
      <div className="p-3 pb-1 shrink-0">
        <div className="bg-slate-100 p-0.5 rounded-lg flex items-center">
          <button
            onClick={() => {
              setSpaceView('myspace');
              navigateTo('myspace');
            }}
            className={`flex-1 py-1 px-2 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeRoute === 'myspace' || spaceView === 'myspace'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>My Space</span>
          </button>

          <button
            onClick={() => {
              setSpaceView('team');
              if (activeRoute === 'myspace') {
                navigateTo('dashboard');
              }
            }}
            className={`flex-1 py-1 px-2 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeRoute !== 'myspace' && spaceView === 'team'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Team & Org</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {spaceView === 'myspace' ? (
          <>
            {mySpaceNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </>
        ) : (
          <>
            {visibleTeamItems.map(item => {
              const Icon = item.icon;
              const isActive = activeRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Bottom info */}
      <div className="p-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between shrink-0">
        <span>{currentTenant.employeeCount} / {currentTenant.maxSeats} seats</span>
        {canAccessSettings && (
          <button onClick={() => handleNavClick('settings')} className="text-blue-600 font-semibold hover:underline">
            Manage
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-56 h-full shrink-0 z-20">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" 
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-56 max-w-[80vw] h-full shadow-xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
