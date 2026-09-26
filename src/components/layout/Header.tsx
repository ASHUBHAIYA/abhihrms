import React, { useState, useRef, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  Menu, 
  Search, 
  RotateCcw, 
  Clock, 
  CheckCircle2, 
  Sliders, 
  ChevronRight, 
  ChevronDown, 
  Check, 
  Shield 
} from 'lucide-react';
import { UserRole } from '../../types/hrms';

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setMobileOpen }) => {
  const { 
    tenants,
    currentTenant, 
    switchTenant,
    currentUser,
    switchUser,
    activeRoute, 
    navigateTo, 
    logAttendanceClockIn, 
    resetAllData,
    employees,
    canAccessRoute
  } = useTenant();

  const [hasClockedInToday, setHasClockedInToday] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const tenantMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const canAccessSettings = canAccessRoute('settings');

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tenantMenuRef.current && !tenantMenuRef.current.contains(event.target as Node)) {
        setTenantDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const routeNames: Record<string, string> = {
    myspace: 'My Personal Workspace (ESS)',
    dashboard: 'Executive Dashboard',
    core_hr: 'Core HR & Employee Master',
    attendance: 'Daily Attendance & Shifts',
    leave: 'Leave Management Engine',
    payroll: 'Payroll & Compensation',
    expenses: 'Expenses & Reimbursements',
    lifecycle: 'Assets & Lifecycle',
    ats: 'AI Recruiter / ATS',
    ai_hub: 'AI Policy Hub',
    settings: 'Tenant & Plan Settings'
  };

  const handleQuickClockIn = () => {
    const currentEmp = employees[0]?.firstName ? `${employees[0].firstName} ${employees[0].lastName}` : currentUser.name;
    const dept = employees[0]?.department || 'Management';
    logAttendanceClockIn(currentEmp, dept);
    setHasClockedInToday(true);
  };

  const rolesList: { role: UserRole; label: string; desc: string; badge: string }[] = [
    { role: 'Tenant Admin', label: 'Tenant Admin', desc: 'Full root org & RBAC control', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    { role: 'HR Manager', label: 'HR Manager', desc: 'Employee lifecycle & ATS lead', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { role: 'Finance Officer', label: 'Finance Officer', desc: 'Payroll & claims disbursement', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { role: 'Department Lead', label: 'Department Lead', desc: 'Team approvals & shift roster', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    { role: 'Employee', label: 'Employee (ESS)', desc: 'Self-service payslip & leaves', badge: 'bg-slate-100 text-slate-700 border-slate-200' }
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between gap-3 shadow-xs shrink-0">
      {/* Zone 1: Mobile Hamburger & Header Tenant Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 lg:hidden rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Prominent Header Tenant Switcher */}
        <div className="relative" ref={tenantMenuRef}>
          <button
            onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-left shadow-2xs group"
            title="Switch Active Tenant Organization"
          >
            <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs flex items-center justify-center shrink-0">
              {currentTenant.logoInitials}
            </div>
            <div className="hidden sm:block min-w-0 max-w-[130px] md:max-w-[170px]">
              <div className="text-xs font-semibold text-slate-900 truncate leading-tight group-hover:text-blue-600 transition-colors">
                {currentTenant.name}
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate leading-tight">
                {currentTenant.slug}
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${tenantDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
          </button>

          {/* Tenant Switcher Popup Dropdown */}
          {tenantDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in">
              <div className="px-2.5 py-1.5 mb-1 flex items-center justify-between border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Switch Organization</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">Multi-Tenant</span>
              </div>
              
              <div className="space-y-1">
                {tenants.map((t) => {
                  const isCurrent = t.id === currentTenant.id;

                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        switchTenant(t.id);
                        setTenantDropdownOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-lg flex items-start justify-between text-left transition-all ${
                        isCurrent
                          ? 'bg-blue-50 text-blue-900 border border-blue-200'
                          : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                          isCurrent 
                            ? 'bg-blue-600 text-white shadow-xs' 
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {t.logoInitials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold truncate text-slate-900">{t.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-slate-100 text-slate-600 border border-slate-200">
                              {t.plan}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            slug: <span className="text-blue-600 font-semibold">{t.slug}</span>
                          </div>
                          
                          {/* Module summary badge list */}
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {t.activeModules.map((m) => (
                              <span key={m} className="text-[9px] px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-medium">
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {isCurrent && (
                        <Check className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              {canAccessSettings && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between px-1">
                  <button
                    onClick={() => {
                      setTenantDropdownOpen(false);
                      navigateTo('settings');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Manage Plan & Modules
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono">{tenants.length} Tenants</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Breadcrumb Trail */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-500 min-w-0 pl-1 border-l border-slate-200">
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-900 font-semibold truncate">
            {routeNames[activeRoute] || 'Workspace'}
          </span>
        </div>
      </div>

      {/* Zone 2: Global Search Input */}
      <div className="hidden md:flex items-center gap-3 flex-1 max-w-xs xl:max-w-md mx-2">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search directory, shifts, requisitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors shadow-2xs"
          />
        </div>
      </div>

      {/* Zone 3: Quick Actions & User Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Clock-in Simulation */}
        <button
          onClick={handleQuickClockIn}
          disabled={hasClockedInToday}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shadow-2xs ${
            hasClockedInToday
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          title="Simulate GPS Clock-In for active employee"
        >
          {hasClockedInToday ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Clocked In</span>
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quick Clock In</span>
            </>
          )}
        </button>

        {/* Tenant Entitlement Settings Shortcut (Admin Only) */}
        {canAccessSettings && (
          <button
            onClick={() => navigateTo('settings')}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Super Admin Module Manager & Entitlements"
          >
            <Sliders className="w-4 h-4" />
          </button>
        )}

        {/* Reset Demo Data Button */}
        <button
          onClick={resetAllData}
          className="p-2 text-slate-500 hover:text-amber-700 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors"
          title="Reset All Tenants & Modules to Initial State"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* User Profile / Auth State Badge Dropdown */}
        <div className="relative border-l border-slate-200 pl-2" ref={userMenuRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-lg hover:bg-slate-100 transition-colors group"
            title="User Profile & Role Settings"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0">
              {currentUser.avatarInitials}
            </div>
            
            <div className="hidden lg:block text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {currentUser.role}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 leading-tight font-mono">
                @{currentTenant.slug}
              </div>
            </div>

            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden lg:block transition-transform ${userDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
          </button>

          {/* User Profile & Role Selector Dropdown */}
          {userDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2.5 z-50 animate-in fade-in">
              {/* User Identity Card */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                    {currentUser.avatarInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{currentUser.email}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                        {currentUser.role}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        tenant: <strong className="text-slate-800">{currentTenant.slug}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Switcher */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1 mb-1">
                  Switch Active Role (RBAC Simulation)
                </div>
                {rolesList.map((item) => {
                  const isActive = currentUser.role === item.role;
                  return (
                    <button
                      key={item.role}
                      onClick={() => {
                        switchUser(item.role);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full p-2 rounded-lg flex items-start justify-between text-xs transition-colors text-left ${
                        isActive
                          ? 'bg-blue-50 text-blue-900 font-semibold border border-blue-200'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <Shield className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{item.label}</span>
                            {isActive && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-bold">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal truncate mt-0.5">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      {isActive && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-1" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 text-center">
                Current Tenant: <span className="text-slate-800 font-semibold">{currentTenant.name}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
