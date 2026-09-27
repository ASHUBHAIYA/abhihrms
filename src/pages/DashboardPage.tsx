import React from 'react';
import { useTenant } from '../context/TenantContext';
import { MODULE_CATALOG } from '../data/initialData';
import { TenantModule } from '../types/hrms';
import { 
  Users, 
  Clock, 
  Receipt, 
  Briefcase, 
  ShieldCheck, 
  Lock, 
  ArrowRight,
  User,
  Check,
  X,
  Calendar,
  Gift,
  Award,
  Sparkles
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
    holidays,
    celebrations,
    canAccessRoute,
    hasPermission,
    navigateTo, 
    updateLeaveStatus 
  } = useTenant();

  const totalEmployees = employees.length;
  const onTimeAttendance = attendanceRecords.filter(a => a.status === 'on_time' || a.status === 'present').length;
  const attendanceRate = totalEmployees > 0 ? Math.round((onTimeAttendance / totalEmployees) * 100) : 95;
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');
  const activeJobs = jobRequisitions.filter(j => j.status === 'open' || j.status === 'interviewing');
  const latestPayroll = payrollRuns[0];

  const canApproveLeaves = hasPermission('approve_leaves');
  const currentLoggedInEmp = employees.find(e => 
    e.id === currentUser.id ||
    e.email.toLowerCase() === currentUser.email.toLowerCase() ||
    `${e.firstName} ${e.lastName}`.toLowerCase() === currentUser.name.toLowerCase()
  );

  const allModules: TenantModule[] = ['core_hr', 'attendance', 'leave', 'payroll', 'ats', 'ai_hub', 'expenses', 'lifecycle'];
  const accessibleModules = allModules.filter(m => canAccessRoute(m));
  const canAccessSettings = canAccessRoute('settings');

  // Sorted upcoming holidays & celebrations
  const upcomingHolidays = [...(holidays || [])].slice(0, 4);
  const upcomingCelebrations = [...(celebrations || [])].slice(0, 4);

  return (
    <div className="space-y-6 pb-12 max-w-full">
      {/* Overview Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-2xs">
            {currentTenant.logoInitials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 truncate">
                {currentTenant.name}
              </h1>
              <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                {currentTenant.plan} Plan
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {currentTenant.headquarters} · {currentTenant.employeeCount} Active Workforce Members
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigateTo('myspace')}
            className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            My Space
          </button>

          {canAccessSettings && (
            <button
              onClick={() => navigateTo('settings')}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200 cursor-pointer"
            >
              Settings
            </button>
          )}
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div 
          onClick={() => navigateTo('core_hr')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Headcount</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {currentTenant.employeeCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Max seats: <span className="font-medium text-slate-700">{currentTenant.maxSeats}</span>
          </div>
        </div>

        <div 
          onClick={() => navigateTo('attendance')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Attendance Rate</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {attendanceRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="font-medium text-slate-700">{onTimeAttendance}</span> check-ins recorded today
          </div>
        </div>

        <div 
          onClick={() => navigateTo('payroll')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Latest Net Payroll</span>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {latestPayroll ? `$${latestPayroll.totalNetPay.toLocaleString()}` : '$0'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Cycle: <span className="font-medium text-slate-700">{latestPayroll ? latestPayroll.period : 'No run'}</span>
          </div>
        </div>

        <div 
          onClick={() => navigateTo('ats')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Open Requisitions</span>
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {activeJobs.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="font-medium text-slate-700">{jobRequisitions.reduce((acc, j) => acc + j.applicantCount, 0)}</span> active candidates
          </div>
        </div>
      </div>

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 Cols): Quick Modules + Upcoming Holidays */}
        <div className="lg:col-span-2 space-y-5">
          {/* Modules Navigation */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                HR Operations & Modules
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                {accessibleModules.length} Modules Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {accessibleModules.map(modId => {
                const meta = MODULE_CATALOG[modId];
                if (!meta) return null;

                return (
                  <div
                    key={modId}
                    onClick={() => navigateTo(modId)}
                    className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">{meta.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{meta.category}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Holidays Widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-700" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Upcoming Statutory & Company Holidays
                </h2>
              </div>
              <button 
                onClick={() => navigateTo('leave')}
                className="text-[11px] font-semibold text-blue-700 hover:text-blue-800 hover:underline cursor-pointer"
              >
                View Leave Policy
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {upcomingHolidays.map(hol => {
                const d = new Date(hol.date);
                const month = d.toLocaleString('en-US', { month: 'short' });
                const day = d.getDate();

                return (
                  <div key={hol.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-center flex flex-col justify-center shrink-0">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-none">{month}</span>
                        <span className="text-sm font-bold text-slate-900 font-mono leading-none mt-0.5">{day}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">{hol.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {hol.dayOfWeek} · {hol.date}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                      hol.type === 'Public / Statutory'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}>
                      {hol.type}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Leave Approvals & Upcoming Birthdays / Anniversaries */}
        <div className="space-y-5">
          {/* Leave Approvals Widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Leave Approvals</h2>
              <span className="text-[11px] font-mono text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                {pendingLeaves.length} pending
              </span>
            </div>

            {pendingLeaves.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No pending leave requests.
              </div>
            ) : (
              <div className="space-y-2">
                {pendingLeaves.slice(0, 3).map(l => {
                  const isSelf = 
                    l.employeeId === currentUser.id ||
                    (currentLoggedInEmp && l.employeeId === currentLoggedInEmp.id) ||
                    l.employeeName?.toLowerCase().trim() === currentUser.name?.toLowerCase().trim();

                  return (
                    <div key={l.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-slate-900">{l.employeeName}</span>
                        <span className="text-[10px] font-mono text-slate-600 font-semibold">{l.days || l.daysCount || 1}d</span>
                      </div>
                      <div className="text-slate-500 text-[11px] truncate">{l.leaveType} · {l.startDate}</div>
                      
                      {canApproveLeaves && !isSelf ? (
                        <div className="flex gap-1.5 pt-1">
                          <button
                            onClick={() => updateLeaveStatus(l.id, 'approved')}
                            className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Check className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => updateLeaveStatus(l.id, 'rejected')}
                            className="flex-1 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded font-medium text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <X className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      ) : isSelf ? (
                        <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 text-center font-medium flex items-center justify-center gap-1">
                          <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                          Self-Request (Manager Review)
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-600 bg-slate-100 rounded-md px-2 py-1 text-center font-medium flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                          Pending Manager Action
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Birthdays & Milestones Widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-purple-600" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Upcoming Team Birthdays & Milestones
                </h2>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Q4 2026</span>
            </div>

            <div className="divide-y divide-slate-100">
              {upcomingCelebrations.map(cel => {
                const isAnniversary = cel.type === 'anniversary';

                return (
                  <div key={cel.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                        {cel.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {cel.employeeName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {cel.role} · {cel.department}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        isAnniversary
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-purple-50 text-purple-800 border-purple-200'
                      }`}>
                        {isAnniversary ? (
                          <>
                            <Award className="w-3 h-3 text-amber-600" />
                            {cel.yearsCount}y Work Anniversary
                          </>
                        ) : (
                          <>
                            <Gift className="w-3 h-3 text-purple-600" />
                            Birthday ({cel.date.slice(5)})
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
