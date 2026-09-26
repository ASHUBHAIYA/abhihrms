import React from 'react';
import { useTenant } from '../context/TenantContext';
import { MODULE_CATALOG } from '../data/initialData';
import { TenantModule } from '../types/hrms';
import { 
  Users, 
  Clock, 
  Receipt, 
  Briefcase, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Building2,
  TrendingUp,
  UserCheck,
  Check,
  User,
  X
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { 
    currentTenant, 
    currentUser,
    employees, 
    attendanceRecords, 
    leaveRequests, 
    payrollRuns, 
    jobRequisitions, 
    isModuleSubscribed, 
    canAccessRoute,
    navigateTo, 
    updateLeaveStatus 
  } = useTenant();

  // Metrics calculations
  const totalEmployees = employees.length;
  const onTimeAttendance = attendanceRecords.filter(a => a.status === 'on_time').length;
  const attendanceRate = totalEmployees > 0 ? Math.round((onTimeAttendance / totalEmployees) * 100) : 95;
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');
  const activeJobs = jobRequisitions.filter(j => j.status === 'open' || j.status === 'interviewing');
  const latestPayroll = payrollRuns[0];

  const departmentCounts: Record<string, number> = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const allModules: TenantModule[] = ['core_hr', 'attendance', 'leave', 'payroll', 'ats', 'ai_hub', 'expenses', 'lifecycle'];
  // Only show modules accessible to this user
  const accessibleModules = allModules.filter(m => canAccessRoute(m));
  const canAccessSettings = canAccessRoute('settings');

  return (
    <div className="space-y-6 pb-12 max-w-full">
      {/* Welcome & Tenant Scope Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-xs shrink-0">
            {currentTenant.logoInitials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight truncate">
                {currentTenant.name}
              </h1>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                {currentTenant.plan} Tier
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
              <span>{currentTenant.headquarters}</span>
              <span>·</span>
              <span className="font-mono text-slate-600">{currentTenant.domain}</span>
              <span>·</span>
              <span className="font-medium text-slate-700">{currentTenant.activeModules.length} of 6 Modules Active</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => navigateTo('myspace')}
            className="w-full sm:w-auto px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <User className="w-3.5 h-3.5" />
            My Space (ESS)
          </button>

          {canAccessSettings && (
            <button
              onClick={() => navigateTo('settings')}
              className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors border border-slate-200 flex items-center justify-center gap-1.5 shadow-2xs"
            >
              Manage Entitlements
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Top Level Executive KPI Metrics (Grid 1 -> 2 -> 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Headcount */}
        <div 
          onClick={() => navigateTo('core_hr')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Total Active Headcount</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {currentTenant.employeeCount}
            </div>
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
              +12% QoQ
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Capacity: {currentTenant.maxSeats} seats assigned
          </div>
        </div>

        {/* KPI 2: Today's Attendance Rate */}
        <div 
          onClick={() => navigateTo('attendance')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Attendance Rate Today</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {attendanceRate}%
            </div>
            <span className="text-xs text-slate-600 font-mono font-medium">
              {onTimeAttendance}/{totalEmployees} logged
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            GPS geofence verified checks
          </div>
        </div>

        {/* KPI 3: Monthly Payroll Disbursal */}
        <div 
          onClick={() => navigateTo('payroll')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group relative overflow-hidden shadow-2xs"
        >
          {!isModuleSubscribed('payroll') && (
            <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-mono">
              <Lock className="w-2.5 h-2.5" /> LOCKED
            </div>
          )}
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Latest Payroll Run</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5 text-indigo-600" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {latestPayroll ? `$${latestPayroll.totalNetPay.toLocaleString()}` : '$0'}
            </div>
            <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-semibold">
              {latestPayroll ? latestPayroll.status.toUpperCase() : 'N/A'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Period: {latestPayroll?.period || 'No runs yet'}
          </div>
        </div>

        {/* KPI 4: Open Job Requisitions */}
        <div 
          onClick={() => navigateTo('ats')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group relative overflow-hidden shadow-2xs"
        >
          {!isModuleSubscribed('ats') && (
            <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-mono">
              <Lock className="w-2.5 h-2.5" /> LOCKED
            </div>
          )}
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Active Talent Openings</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5 text-rose-600" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {activeJobs.length}
            </div>
            <span className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded font-semibold">
              {jobRequisitions.reduce((acc, j) => acc + j.applicantCount, 0)} applicants
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Engineering, ops & leadership
          </div>
        </div>
      </div>

      {/* Middle Section: 2 Cols for Entitlements / Actions, 1 Col for Approvals (Responsive 1 -> 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Tenant Feature Entitlements */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Dynamic Module Entitlements</h2>
              <p className="text-xs text-slate-500">
                Active modules for <span className="font-semibold text-slate-800">{currentTenant.name}</span>
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
              {currentTenant.activeModules.length}/6 Enabled
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {accessibleModules.map(modId => {
              const meta = MODULE_CATALOG[modId];
              if (!meta) return null;

              return (
                <div
                  key={modId}
                  onClick={() => navigateTo(modId)}
                  className="p-3.5 rounded-lg border transition-all cursor-pointer text-left relative bg-slate-50/70 border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 shadow-2xs group"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600">{meta.name}</span>
                    </div>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded border text-emerald-700 bg-emerald-50 border-emerald-200">
                      ACTIVE
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                    {meta.shortDesc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Pending Leave Approvals */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Pending Leave Approvals</h2>
              <p className="text-xs text-slate-500">Requires supervisor sign-off</p>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {pendingLeaves.length} Requests
            </span>
          </div>

          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {pendingLeaves.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                All time-off requests processed for this tenant.
              </div>
            ) : (
              pendingLeaves.map(req => (
                <div 
                  key={req.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{req.employeeName}</div>
                      <div className="text-[11px] text-slate-600 font-medium">
                        {req.leaveType} · {req.days} Day(s) ({req.startDate})
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {req.department}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 italic">
                    "{req.reason}"
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => updateLeaveStatus(req.id, 'approved', 'Executive Admin')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded transition-colors shadow-2xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateLeaveStatus(req.id, 'rejected', 'Executive Admin')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded border border-slate-200 transition-colors shadow-2xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Workforce Department Distribution & Fast Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Department Allocation
          </h3>
          <div className="space-y-3">
            {Object.entries(departmentCounts).map(([dept, count]) => {
              const pct = Math.round((count / totalEmployees) * 100) || 0;
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-medium">{dept}</span>
                    <span className="font-mono text-slate-600 tabular-nums">{count} members ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div 
                      className="h-full bg-blue-600 rounded-full" 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Operational Jump Links */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Quick Operational Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => navigateTo('core_hr')}
              className="p-3.5 bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-lg text-left transition-colors group shadow-2xs"
            >
              <Users className="w-5 h-5 text-emerald-600 mb-2" />
              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Employee Master</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Directory cards, profiles, search & new hire onboarding</div>
            </button>

            <button
              onClick={() => navigateTo('attendance')}
              className="p-3.5 bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-lg text-left transition-colors group shadow-2xs"
            >
              <Clock className="w-5 h-5 text-blue-600 mb-2" />
              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Daily Punch & Shifts</div>
              <div className="text-[11px] text-slate-500 mt-0.5">GPS punch widget, live roster matrix & shift scheduling</div>
            </button>

            <button
              onClick={() => navigateTo('leave')}
              className="p-3.5 bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-lg text-left transition-colors group shadow-2xs"
            >
              <Sparkles className="w-5 h-5 text-indigo-600 mb-2" />
              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Leave Management</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Live balance meters, time-off requests & approvals</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
