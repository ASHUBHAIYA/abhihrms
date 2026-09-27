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
  Shield,
  Square,
  Play
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
    logAttendanceClockOut,
    attendanceRecords,
    resetAllData,
    employees,
    canAccessRoute
  } = useTenant();

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
    myspace: 'My Space',
    dashboard: 'Dashboard',
    core_hr: 'Directory',
    attendance: 'Attendance',
    leave: 'Leave',
    payroll: 'Payroll',
    expenses: 'Expenses',
    lifecycle: 'Lifecycle & Assets',
    ats: 'Recruitment',
    ai_hub: 'AI Hub',
    settings: 'Settings'
  };

  // Determine attendance punch state for current user
  const todayStr = new Date().toISOString().split('T')[0];
  const userTodayRecord = attendanceRecords.find(a => 
    a.date === todayStr && 
    (a.employeeName.toLowerCase().includes(currentUser.name.toLowerCase()) || a.employeeId === currentUser.id)
  );

  const isClockedIn = Boolean(userTodayRecord && !(userTodayRecord.clockOut || userTodayRecord.clockOutTime));
  const isClockedOut = Boolean(userTodayRecord && (userTodayRecord.clockOut || userTodayRecord.clockOutTime));

  const handleQuickClockToggle = () => {
    if (isClockedIn && userTodayRecord) {
      logAttendanceClockOut(userTodayRecord.id);
    } else {
      const currentEmp = employees.find(e => e.email.toLowerCase() === currentUser.email.toLowerCase() || e.firstName.toLowerCase() === currentUser.name.split(' ')[0]?.toLowerCase());
      const empName = currentEmp ? `${currentEmp.firstName} ${currentEmp.lastName}` : currentUser.name;
      const dept = currentEmp?.department || currentUser.department || 'General';
      logAttendanceClockIn(empName, dept);
    }
  };

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'Tenant Admin', label: 'Tenant Admin', desc: 'Full administration' },
    { role: 'HR Manager', label: 'HR Manager', desc: 'HR, lifecycle & hiring' },
    { role: 'Finance Officer', label: 'Finance Officer', desc: 'Payroll & claims' },
    { role: 'Department Lead', label: 'Department Lead', desc: 'Team approvals' },
    { role: 'Employee', label: 'Employee', desc: 'Self-service' }
  ];

  return (
    <header className="sticky top-0 z-30 h-14 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between gap-3 shrink-0">
      {/* Zone 1: Mobile Hamburger & Tenant Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 lg:hidden rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Header Tenant Switcher */}
        <div className="relative" ref={tenantMenuRef}>
          <button
            onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-left group"
          >
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {currentTenant.logoInitials}
            </div>
            <div className="hidden sm:block min-w-0 max-w-[140px]">
              <div className="text-xs font-semibold text-slate-900 truncate leading-tight">
                {currentTenant.name}
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${tenantDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
          </button>

          {/* Tenant Switcher Popup */}
          {tenantDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in">
              <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Organizations
              </div>
              <div className="space-y-0.5">
                {tenants.map((t) => {
                  const isCurrent = t.id === currentTenant.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        switchTenant(t.id);
                        setTenantDropdownOpen(false);
                      }}
                      className={`w-full px-2.5 py-2 rounded-lg flex items-center justify-between text-left transition-colors ${
                        isCurrent
                          ? 'bg-blue-50 text-blue-900 font-medium'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-6 h-6 rounded font-bold text-xs flex items-center justify-center shrink-0 ${
                          isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {t.logoInitials}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-slate-900 block truncate">{t.name}</span>
                          <span className="text-[10px] text-slate-500 block truncate">{t.plan}</span>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {canAccessSettings && (
                <div className="mt-1 pt-1 border-t border-slate-100 px-1">
                  <button
                    onClick={() => {
                      setTenantDropdownOpen(false);
                      navigateTo('settings');
                    }}
                    className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium py-1 flex items-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Manage Organizations
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Minimal Breadcrumb */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 pl-1">
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-semibold truncate">
            {routeNames[activeRoute] || 'Overview'}
          </span>
        </div>
      </div>

      {/* Zone 2: Minimal Global Search */}
      <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Zone 3: Quick Actions & User Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Clock-in / Clock-out Button */}
        <button
          onClick={handleQuickClockToggle}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            isClockedIn
              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              : isClockedOut
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
          title={isClockedIn ? 'Click to clock out' : 'Click to clock in'}
        >
          {isClockedIn ? (
            <>
              <Square className="w-3 h-3 fill-current" />
              <span>Clock Out</span>
            </>
          ) : isClockedOut ? (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>Clock In Again</span>
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5" />
              <span>Clock In</span>
            </>
          )}
        </button>

        {/* Reset Demo Data */}
        <button
          onClick={resetAllData}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          title="Reset sample data"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* User Profile & Role Switcher */}
        <div className="relative pl-1 border-l border-slate-200" ref={userMenuRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {currentUser.avatarInitials}
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <span className="text-xs font-semibold text-slate-900 block">{currentUser.name}</span>
              <span className="text-[10px] text-slate-500 block">{currentUser.role}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden lg:block transition-transform ${userDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
          </button>

          {/* User Role Popup */}
          {userDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 animate-in fade-in">
              <div className="px-2 py-1.5 mb-1 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500">{currentUser.email}</div>
                <div className="text-[10px] text-blue-600 font-medium mt-0.5">{currentUser.role}</div>
              </div>

              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                Switch Role (RBAC)
              </div>
              <div className="space-y-0.5">
                {rolesList.map((item) => {
                  const isActive = currentUser.role === item.role;
                  return (
                    <button
                      key={item.role}
                      onClick={() => {
                        switchUser(item.role);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full px-2 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors text-left ${
                        isActive
                          ? 'bg-blue-50 text-blue-900 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Shield className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
