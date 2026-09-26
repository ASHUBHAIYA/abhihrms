import React, { useState, useMemo } from 'react';
import { useTenant } from '../context/TenantContext';
import { ModuleGuard } from '../components/common/ModuleGuard';
import { LeaveRequest } from '../types/hrms';
import { 
  CalendarOff, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Check, 
  X, 
  FileText, 
  AlertCircle, 
  Inbox, 
  History, 
  User 
} from 'lucide-react';

export const LeavePage: React.FC = () => {
  return (
    <ModuleGuard module="leave">
      <LeaveContent />
    </ModuleGuard>
  );
};

export const LeaveContent: React.FC = () => {
  const { currentTenant, leaveRequests, submitLeaveRequest, updateLeaveStatus, employees, currentUser } = useTenant();

  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'history'>('inbox');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [rejectModalTarget, setRejectModalTarget] = useState<LeaveRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0]?.id || 'EMP-1001');

  // Currently viewed employee for the balance meters
  const currentViewEmployee = useMemo(() => {
    return employees.find(e => e.id === selectedEmployeeId) || employees[0] || {
      id: 'EMP-1001',
      firstName: 'Sarah',
      lastName: 'Chen',
      role: 'VP of Engineering',
      department: 'Engineering',
      leaveBalance: { paid: 14, sick: 6, casual: 8, parental: 12 }
    };
  }, [employees, selectedEmployeeId]);

  // Form Data for Request
  const [formData, setFormData] = useState({
    employeeId: employees[0]?.id || 'EMP-1001',
    leaveType: 'Casual' as LeaveRequest['leaveType'],
    startDate: '2026-10-12',
    endDate: '2026-10-14',
    halfDay: 'full' as 'full' | 'first_half' | 'second_half',
    reason: ''
  });

  // Calculate business days between startDate and endDate
  const calculatedDays = useMemo(() => {
    try {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) return 0;

      let daysCount = 0;
      let cur = new Date(start);
      while (cur <= end) {
        const dayOfWeek = cur.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // exclude Sunday and Saturday
          daysCount++;
        }
        cur.setDate(cur.getDate() + 1);
      }
      return formData.halfDay !== 'full' ? Math.max(0.5, daysCount - 0.5) : Math.max(1, daysCount);
    } catch {
      return 1;
    }
  }, [formData.startDate, formData.endDate, formData.halfDay]);

  // Balance lookup for the applicant in the form
  const applicantEmployee = useMemo(() => {
    return employees.find(e => e.id === formData.employeeId) || currentViewEmployee;
  }, [employees, formData.employeeId, currentViewEmployee]);

  const availableBalanceForType = useMemo(() => {
    const bal = applicantEmployee.leaveBalance;
    if (formData.leaveType === 'Casual') return bal.casual || 8;
    if (formData.leaveType === 'Sick') return bal.sick || 6;
    if (formData.leaveType === 'Annual / Paid') return bal.paid || 14;
    if (formData.leaveType === 'Parental') return bal.parental || 12;
    return 99; // Unpaid
  }, [applicantEmployee, formData.leaveType]);

  const isExceedingBalance = calculatedDays > availableBalanceForType && formData.leaveType !== 'Unpaid';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === formData.employeeId) || employees[0];

    submitLeaveRequest({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeRole: emp.role,
      department: emp.department,
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      days: calculatedDays,
      reason: formData.reason.trim() || 'Personal time off and coverage arranged.'
    });

    setIsRequestModalOpen(false);
    setFormData({
      employeeId: employees[0]?.id || 'EMP-1001',
      leaveType: 'Casual',
      startDate: '2026-10-12',
      endDate: '2026-10-14',
      halfDay: 'full',
      reason: ''
    });
  };

  const handleApprove = (req: LeaveRequest) => {
    const approverName = currentUser.name ? `${currentUser.name} (${currentUser.role})` : 'Sarah Chen (Lead Manager)';
    updateLeaveStatus(req.id, 'approved', approverName);
  };

  const handleRejectConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectModalTarget) {
      const approverName = currentUser.name ? `${currentUser.name} (${currentUser.role})` : 'People Operations';
      updateLeaveStatus(rejectModalTarget.id, 'rejected', `${approverName} - Reason: ${rejectionReason || 'Coverage conflict'}`);
      setRejectModalTarget(null);
      setRejectionReason('');
    }
  };

  const pendingRequests = useMemo(() => {
    return leaveRequests.filter(l => l.status === 'pending');
  }, [leaveRequests]);

  const pastRequests = useMemo(() => {
    return leaveRequests.filter(l => l.status !== 'pending');
  }, [leaveRequests]);

  // Balance constants for meters
  const casualMax = 12;
  const sickMax = 10;
  const paidMax = 18;

  const casualAvailable = currentViewEmployee.leaveBalance?.casual ?? 8;
  const sickAvailable = currentViewEmployee.leaveBalance?.sick ?? 6;
  const paidAvailable = currentViewEmployee.leaveBalance?.paid ?? 14;

  return (
    <div className="space-y-6 pb-12 max-w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Leave & Absence Management Engine
            </h1>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
              Policy & Accruals
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated balance wallets, manager approval inbox, and leave quota policies for {currentTenant.name}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Apply for Leave
          </button>
        </div>
      </div>

      {/* Employee Selector Bar for Balance Meters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-700">
          <User className="w-4 h-4 text-blue-600" />
          <span className="font-medium">Viewing Entitlement Balances for:</span>
          <select
            value={selectedEmployeeId}
            onChange={e => setSelectedEmployeeId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 font-semibold rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500 shadow-2xs"
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName} ({emp.role} · {emp.department})
              </option>
            ))}
          </select>
        </div>

        <div className="text-[11px] font-mono text-slate-500">
          Policy Cycle: <strong className="text-slate-800">Jan 1, 2026 – Dec 31, 2026</strong>
        </div>
      </div>

      {/* Leave Balance Meters (Casual Leave: 8/12, Sick Leave: 6/10, Paid Leave: 14/18) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Casual Leave Meter */}
        <div className="p-5 bg-white border border-slate-200 hover:border-amber-300 rounded-2xl space-y-3 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Casual Leave (CL)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
                {casualAvailable}
              </span>
              <span className="text-xs font-mono text-slate-500">/ {casualMax} Days Available</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {casualMax - casualAvailable} days utilized this fiscal year
            </div>
          </div>

          {/* Visual Progress Meter Bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-500" 
              style={{ width: `${Math.round((casualAvailable / casualMax) * 100)}%` }} 
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
            <span>Accrual: +1.0/mo</span>
            <span className="text-amber-700 font-semibold">{Math.round((casualAvailable / casualMax) * 100)}% Remaining</span>
          </div>
        </div>

        {/* 2. Sick Leave Meter */}
        <div className="p-5 bg-white border border-slate-200 hover:border-blue-300 rounded-2xl space-y-3 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Sick & Medical (SL)</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
                {sickAvailable}
              </span>
              <span className="text-xs font-mono text-slate-500">/ {sickMax} Days Available</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {sickMax - sickAvailable} days utilized this fiscal year
            </div>
          </div>

          {/* Visual Progress Meter Bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-500" 
              style={{ width: `${Math.round((sickAvailable / sickMax) * 100)}%` }} 
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
            <span>Medical Proof &gt; 2d</span>
            <span className="text-blue-700 font-semibold">{Math.round((sickAvailable / sickMax) * 100)}% Remaining</span>
          </div>
        </div>

        {/* 3. Paid Leave (Annual) Meter */}
        <div className="p-5 bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl space-y-3 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Paid / Annual Leave (PL)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <CalendarOff className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
                {paidAvailable}
              </span>
              <span className="text-xs font-mono text-slate-500">/ {paidMax} Days Available</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {paidMax - paidAvailable} days utilized this fiscal year
            </div>
          </div>

          {/* Visual Progress Meter Bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
            <div 
              className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
              style={{ width: `${Math.round((paidAvailable / paidMax) * 100)}%` }} 
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
            <span>Carry-over max: 8d</span>
            <span className="text-emerald-700 font-semibold">{Math.round((paidAvailable / paidMax) * 100)}% Remaining</span>
          </div>
        </div>

        {/* 4. Parental Leave Meter */}
        <div className="p-5 bg-white border border-slate-200 hover:border-purple-300 rounded-2xl space-y-3 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Parental / Special Leave</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
                12
              </span>
              <span className="text-xs font-mono text-slate-500">/ 12 Weeks Entitlement</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              100% employer paid leave
            </div>
          </div>

          {/* Visual Progress Meter Bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
            <div className="h-full bg-purple-600 rounded-full w-full" />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
            <span>Statutory Entitlement</span>
            <span className="text-purple-700 font-semibold">100% Available</span>
          </div>
        </div>
      </div>

      {/* Subtabs for Manager Approval Inbox vs History */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('inbox')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'inbox'
                ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Inbox className="w-3.5 h-3.5 text-amber-600" />
            Manager Approval Inbox
            {pendingRequests.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-mono font-bold text-[10px] flex items-center justify-center ml-1">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'history'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Historical Leave Log ({pastRequests.length})
          </button>
        </div>
      </div>

      {/* View 1: Manager Approval Inbox (One-click Approve and Reject) */}
      {activeSubTab === 'inbox' ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Pending Leave Submissions Requiring Manager Decision</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  {pendingRequests.length} Action Items
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and decide on time-off requests. Approving updates employee leave balance automatically.
              </p>
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <div className="text-sm font-bold text-slate-900">All Caught Up!</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No pending leave requests pending manager review for <strong className="text-slate-700">{currentTenant.name}</strong>.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Leave Category</th>
                    <th className="py-3 px-4">Date Range & Duration</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                    <th className="py-3 px-4">Applied Date</th>
                    <th className="py-3 px-4 text-right min-w-[160px]">Manager Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs">{req.employeeName}</div>
                        <div className="text-[11px] text-slate-500">{req.employeeRole} · {req.department}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          req.leaveType === 'Casual'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : req.leaveType === 'Sick'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {req.leaveType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-slate-900 font-semibold">{req.startDate} → {req.endDate}</div>
                        <div className="text-blue-700 text-[11px] font-bold">
                          {req.days} {req.days === 1 ? 'Working Day' : 'Working Days'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 max-w-xs">
                        <p className="line-clamp-2 text-xs leading-relaxed">{req.reason}</p>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                        {req.appliedAt}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(req)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 active:scale-95"
                            title="Approve leave and deduct days from balance"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </button>

                          <button
                            onClick={() => {
                              setRejectModalTarget(req);
                              setRejectionReason('');
                            }}
                            className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 active:scale-95"
                            title="Reject leave request"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* View 2: Historical Leave Log */
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Historical Leave & Absence Audit Log</h2>
            <span className="text-xs text-slate-500 font-mono">
              {pastRequests.length} Decided Requests
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Leave Category</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Approver & Audit Stamp</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pastRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      No historical requests yet.
                    </td>
                  </tr>
                ) : (
                  pastRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{req.employeeName}</div>
                        <div className="text-[10px] text-slate-500">{req.department}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {req.leaveType}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700">
                        {req.startDate} to {req.endDate}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {req.days} days
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <span className="text-slate-800 font-medium">{req.approvedBy || 'System Automated Approval'}</span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                          req.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply for Leave Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsRequestModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <CalendarOff className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Apply for Leave / Time-Off
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Submit your absence request for managerial approval in <strong className="text-slate-800">{currentTenant.name}</strong>.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Employee Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Applicant Name *</label>
                <select
                  value={formData.employeeId}
                  onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.role} · {emp.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave Type Selector with Live Balance Pills */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Category *</label>
                <select
                  value={formData.leaveType}
                  onChange={e => setFormData({ ...formData, leaveType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                >
                  <option value="Casual">Casual Leave (CL) — {applicantEmployee.leaveBalance.casual} days available</option>
                  <option value="Sick">Sick / Medical Leave (SL) — {applicantEmployee.leaveBalance.sick} days available</option>
                  <option value="Annual / Paid">Annual / Paid Leave (PL) — {applicantEmployee.leaveBalance.paid} days available</option>
                  <option value="Parental">Parental Leave — {applicantEmployee.leaveBalance.parental || 12} weeks entitlement</option>
                  <option value="Unpaid">Unpaid Leave (Loss of Pay / LOP)</option>
                </select>

                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono">
                  <span>Available Balance:</span>
                  <span className="font-bold text-blue-700">
                    {availableBalanceForType} {formData.leaveType === 'Parental' ? 'Weeks' : 'Days'}
                  </span>
                </div>
              </div>

              {/* Date Range Picker */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono shadow-2xs"
                  />
                </div>
              </div>

              {/* Half-Day Option & Calculated Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Duration</label>
                  <select
                    value={formData.halfDay}
                    onChange={e => setFormData({ ...formData, halfDay: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                  >
                    <option value="full">Full Working Day(s)</option>
                    <option value="first_half">First Half (Morning Only)</option>
                    <option value="second_half">Second Half (Afternoon Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Calculated Days</label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-blue-700 font-mono font-bold">
                    {calculatedDays} Working {calculatedDays === 1 ? 'Day' : 'Days'}
                  </div>
                </div>
              </div>

              {/* Balance Overdraft Warning */}
              {isExceedingBalance && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Balance Exceeded:</span> Requested {calculatedDays} days, but only {availableBalanceForType} days are in the wallet. The excess will be categorized as Unpaid Leave.
                  </div>
                </div>
              )}

              {/* Reason / Handover Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Handover Note *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Attending family commitment; Marcus covering critical tickets during absence."
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Reject Modal */}
      {rejectModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setRejectModalTarget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-slate-900">
              Reject Time-Off Request
            </h3>
            <p className="text-xs text-slate-500">
              Reject leave request for <strong className="text-slate-900">{rejectModalTarget.employeeName}</strong> ({rejectModalTarget.leaveType} · {rejectModalTarget.days} days):
            </p>

            <form onSubmit={handleRejectConfirm} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Rejection</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Critical release sprint deadline on these dates; please reschedule."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectModalTarget(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
