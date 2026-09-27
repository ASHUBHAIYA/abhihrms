import React, { useState, useMemo } from 'react';
import { useTenant } from '../context/TenantContext';
import { 
  Clock, 
  CalendarOff, 
  Receipt, 
  CreditCard, 
  Laptop, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Plus, 
  FileText, 
  Download, 
  Send, 
  AlertCircle, 
  User, 
  Building2, 
  Briefcase, 
  ChevronRight,
  TrendingUp,
  Play,
  Square,
  X,
  Calendar,
  Gift,
  Award
} from 'lucide-react';
import { ExpenseClaim } from '../types/hrms';

export const MySpacePage: React.FC = () => {
  const { 
    currentTenant, 
    currentUser, 
    employees, 
    attendanceRecords, 
    logAttendanceClockIn, 
    logAttendanceClockOut,
    leaveRequests,
    submitLeaveRequest,
    payslips,
    expenses,
    submitExpenseClaim,
    assets,
    holidays,
    celebrations,
    showToast,
    isModuleSubscribed,
    navigateTo
  } = useTenant();

  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'leave' | 'payslips' | 'expenses' | 'assets' | 'copilot'>('overview');
  
  // Modals
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Leave Form
  const [leaveType, setLeaveType] = useState<string>('Paid Leave');
  const [leaveStartDate, setLeaveStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveEndDate, setLeaveEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveDays, setLeaveDays] = useState(1);
  const [leaveReason, setLeaveReason] = useState('');

  // Expense Form
  const [expenseMerchant, setExpenseMerchant] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseClaim['category']>('Client Meal');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseNotes, setExpenseNotes] = useState('');

  // Copilot Assistant
  const [copilotQuestion, setCopilotQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: `Hello ${currentUser.name}. Ask me about ${currentTenant.name}'s leave policy, expense limits, or benefits.`,
      time: 'Just now'
    }
  ]);

  // Current employee record
  const currentEmpRecord = useMemo(() => {
    const match = employees.find(e => 
      e.email.toLowerCase() === currentUser.email.toLowerCase() || 
      e.firstName.toLowerCase() === currentUser.name.split(' ')[0]?.toLowerCase()
    );
    return match || employees[0] || {
      id: 'EMP-ME',
      firstName: currentUser.name.split(' ')[0] || 'Employee',
      lastName: currentUser.name.split(' ')[1] || 'Staff',
      email: currentUser.email,
      role: currentUser.role,
      department: currentUser.department,
      location: currentTenant.headquarters,
      status: 'active' as const,
      joinDate: '2023-01-15',
      salary: 125000,
      leaveBalance: { paid: 14, sick: 7, casual: 6, parental: 12 }
    };
  }, [employees, currentUser, currentTenant]);

  // Personal Attendance Records
  const myAttendance = useMemo(() => {
    return attendanceRecords.filter(a => 
      a.employeeId === currentUser.id ||
      a.employeeName.toLowerCase().includes(currentEmpRecord.firstName.toLowerCase()) ||
      a.employeeName.toLowerCase().includes(currentUser.name.toLowerCase())
    );
  }, [attendanceRecords, currentEmpRecord, currentUser]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = myAttendance.find(a => a.date === todayStr);

  const isClockedIn = Boolean(todayRecord && !(todayRecord.clockOut || todayRecord.clockOutTime));
  const isClockedOut = Boolean(todayRecord && (todayRecord.clockOut || todayRecord.clockOutTime));

  // Personal Leaves
  const myLeaves = useMemo(() => {
    return leaveRequests.filter(l => 
      l.employeeId === currentEmpRecord.id ||
      l.employeeName.toLowerCase().includes(currentEmpRecord.firstName.toLowerCase()) ||
      l.employeeName.toLowerCase().includes(currentUser.name.toLowerCase())
    );
  }, [leaveRequests, currentEmpRecord, currentUser]);

  // Personal Payslips
  const myPayslips = useMemo(() => {
    return payslips.filter(p => 
      p.employeeId === currentEmpRecord.id ||
      p.employeeName.toLowerCase().includes(currentEmpRecord.firstName.toLowerCase()) ||
      p.employeeName.toLowerCase().includes(currentUser.name.toLowerCase())
    );
  }, [payslips, currentEmpRecord, currentUser]);

  // Personal Expenses
  const myExpenses = useMemo(() => {
    return expenses.filter(e => 
      e.employeeId === currentEmpRecord.id ||
      e.employeeName.toLowerCase().includes(currentEmpRecord.firstName.toLowerCase()) ||
      e.employeeName.toLowerCase().includes(currentUser.name.toLowerCase())
    );
  }, [expenses, currentEmpRecord, currentUser]);

  // Personal Assets
  const myAssets = useMemo(() => {
    return assets.filter(a => a.assignedToEmployeeId === currentEmpRecord.id);
  }, [assets, currentEmpRecord]);

  const handlePunchClock = () => {
    if (isClockedIn && todayRecord) {
      logAttendanceClockOut(todayRecord.id);
    } else {
      logAttendanceClockIn(`${currentEmpRecord.firstName} ${currentEmpRecord.lastName}`, currentEmpRecord.department);
    }
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) {
      showToast('Required', 'Please enter a brief reason.', 'warning');
      return;
    }

    submitLeaveRequest({
      employeeId: currentEmpRecord.id,
      employeeName: `${currentEmpRecord.firstName} ${currentEmpRecord.lastName}`,
      department: currentEmpRecord.department,
      leaveType: leaveType,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      days: Number(leaveDays),
      daysCount: Number(leaveDays),
      reason: leaveReason
    });

    setShowLeaveModal(false);
    setLeaveReason('');
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount);
    if (!expenseMerchant.trim() || isNaN(amt) || amt <= 0) {
      showToast('Required', 'Please enter merchant and a valid amount.', 'warning');
      return;
    }

    submitExpenseClaim({
      employeeId: currentEmpRecord.id,
      employeeName: `${currentEmpRecord.firstName} ${currentEmpRecord.lastName}`,
      department: currentEmpRecord.department,
      category: expenseCategory,
      merchant: expenseMerchant,
      amount: amt,
      currency: currentTenant.currency || '$',
      transactionDate: new Date().toISOString().split('T')[0],
      notes: expenseNotes
    });

    setShowExpenseModal(false);
    setExpenseMerchant('');
    setExpenseAmount('');
    setExpenseNotes('');
  };

  const handleAskCopilot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuestion.trim()) return;

    const query = copilotQuestion.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let responseText = '';
    const qLower = query.toLowerCase();

    if (qLower.includes('leave') || qLower.includes('pto') || qLower.includes('vacation') || qLower.includes('sick')) {
      responseText = `You have ${currentEmpRecord.leaveBalance.paid} Paid Leave and ${currentEmpRecord.leaveBalance.sick} Sick Leave days remaining.`;
    } else if (qLower.includes('expense') || qLower.includes('reimburse') || qLower.includes('meal')) {
      responseText = `Client meals are capped at $75/person. Submit receipts within 30 days for payroll reimbursement.`;
    } else if (qLower.includes('work from home') || qLower.includes('wfh') || qLower.includes('remote')) {
      responseText = `Hybrid policy allows 2 remote days weekly with core hours 10:00 AM - 4:00 PM.`;
    } else if (qLower.includes('payroll') || qLower.includes('salary') || qLower.includes('pay day')) {
      responseText = `Salaries are disbursed on the 28th of each month via direct deposit.`;
    } else {
      responseText = `For specific policy exceptions, contact HR (${currentUser.department}).`;
    }

    setChatHistory(prev => [
      ...prev,
      { role: 'user', text: query, time: timeStr },
      { role: 'assistant', text: responseText, time: timeStr }
    ]);
    setCopilotQuestion('');
  };

  return (
    <div className="space-y-5 pb-10 max-w-full">
      {/* 1. Header Profile Banner */}
      <div className="bg-slate-900 rounded-xl text-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-lg font-bold text-white shrink-0">
            {currentUser.avatarInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white">{currentUser.name}</h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {currentUser.role}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span>{currentEmpRecord.department}</span>
              <span>·</span>
              <span className="font-mono">{currentEmpRecord.id}</span>
              <span>·</span>
              <span>{currentTenant.name}</span>
            </div>
          </div>
        </div>

        {/* Punch In / Out Box */}
        <div className="flex items-center gap-3 bg-slate-800/80 px-3.5 py-2.5 rounded-lg border border-slate-700/60 self-start sm:self-auto">
          <div className="text-left pr-1">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Status</div>
            <div className="text-xs font-semibold flex items-center gap-1.5 text-white">
              <span className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-emerald-400 animate-pulse' : isClockedOut ? 'bg-blue-400' : 'bg-slate-500'}`} />
              {isClockedIn 
                ? `Active (${todayRecord?.clockIn || todayRecord?.clockInTime})` 
                : isClockedOut 
                ? `Clocked Out (${todayRecord?.clockOut || todayRecord?.clockOutTime})`
                : 'Not Clocked In'}
            </div>
          </div>

          <button
            onClick={handlePunchClock}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isClockedIn 
                ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                : isClockedOut
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isClockedIn ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                Clock Out
              </>
            ) : isClockedOut ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Clock In Again
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Clock In
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar gap-1 bg-white p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'attendance', label: 'Attendance', icon: Clock },
          { id: 'leave', label: 'Leave', icon: CalendarOff, count: myLeaves.length },
          { id: 'payslips', label: 'Payslips', icon: Receipt, count: myPayslips.length },
          ...(isModuleSubscribed('expenses') ? [{ id: 'expenses', label: 'Expenses', icon: CreditCard, count: myExpenses.length }] : []),
          ...(isModuleSubscribed('lifecycle') ? [{ id: 'assets', label: 'Assets', icon: Laptop, count: myAssets.length }] : []),
          ...(isModuleSubscribed('ai_hub') ? [{ id: 'copilot', label: 'Policy Bot', icon: Sparkles }] : []),
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                isActive 
                  ? 'bg-slate-900 text-white' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Leave Balance</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {currentEmpRecord.leaveBalance.paid + currentEmpRecord.leaveBalance.sick} <span className="text-xs font-normal text-slate-500">days</span>
              </div>
              <div className="mt-2 text-xs text-slate-500 flex justify-between items-center">
                <span>{currentEmpRecord.leaveBalance.paid} Paid · {currentEmpRecord.leaveBalance.sick} Sick</span>
                <button onClick={() => setShowLeaveModal(true)} className="text-blue-600 font-semibold hover:underline">Apply</button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Today's Attendance</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {todayRecord?.clockIn || todayRecord?.clockInTime || '—'}
              </div>
              <div className="mt-2 text-xs text-slate-500 flex justify-between items-center">
                <span>Out: {todayRecord?.clockOut || todayRecord?.clockOutTime || 'Active'}</span>
                <span className={`font-semibold ${isClockedIn ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {isClockedIn ? 'Working' : isClockedOut ? 'Ended' : 'Off'}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Monthly Pay</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {currentTenant.currency || '$'}{Math.round(currentEmpRecord.salary / 12 * 0.78).toLocaleString()}
              </div>
              <div className="mt-2 text-xs text-slate-500 flex justify-between items-center">
                <span>Next: 28th</span>
                <button onClick={() => setActiveTab('payslips')} className="text-blue-600 font-semibold hover:underline">View</button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Policy Help</div>
              <div className="text-base font-bold text-slate-900 mt-1">
                AI Assistant
              </div>
              <div className="mt-2 text-xs text-slate-500 flex justify-between items-center">
                <span>Company handbook</span>
                <button onClick={() => setActiveTab('copilot')} className="text-blue-600 font-semibold hover:underline">Open</button>
              </div>
            </div>
          </div>

          {/* Recent Leaves Table */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Leave Requests</h2>
              <button
                onClick={() => setShowLeaveModal(true)}
                className="px-2.5 py-1 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
              >
                + Request Leave
              </button>
            </div>

            {myLeaves.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No recent leave requests.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[11px]">
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Dates</th>
                      <th className="py-2 px-3">Days</th>
                      <th className="py-2 px-3">Reason</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myLeaves.slice(0, 5).map(l => (
                      <tr key={l.id}>
                        <td className="py-2 px-3 font-medium text-slate-900">{l.leaveType}</td>
                        <td className="py-2 px-3 text-slate-600">{l.startDate} to {l.endDate}</td>
                        <td className="py-2 px-3 text-slate-800 font-semibold">{l.days || l.daysCount || 1}d</td>
                        <td className="py-2 px-3 text-slate-500 truncate max-w-xs">{l.reason}</td>
                        <td className="py-2 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            l.status === 'approved' 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : l.status === 'rejected' 
                              ? 'bg-rose-50 text-rose-700' 
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Upcoming Holidays & Celebrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upcoming Company Holidays */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-700" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Upcoming Holidays</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Official Company Days</span>
              </div>

              <div className="divide-y divide-slate-100">
                {(holidays || []).slice(0, 3).map(h => {
                  const d = new Date(h.date);
                  const month = d.toLocaleString('en-US', { month: 'short' });
                  const day = d.getDate();

                  return (
                    <div key={h.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-center flex flex-col justify-center shrink-0">
                          <span className="text-[8px] font-bold text-slate-500 uppercase leading-none">{month}</span>
                          <span className="text-xs font-bold text-slate-900 font-mono leading-none mt-0.5">{day}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">{h.name}</div>
                          <div className="text-[11px] text-slate-500">{h.dayOfWeek} · {h.date}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                        h.type === 'Public / Statutory'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}>
                        {h.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Team Celebrations */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-purple-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Birthdays & Anniversaries</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Team Milestones</span>
              </div>

              <div className="divide-y divide-slate-100">
                {(celebrations || []).slice(0, 3).map(c => {
                  const isAnniversary = c.type === 'anniversary';

                  return (
                    <div key={c.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {c.avatarInitials}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">{c.employeeName}</div>
                          <div className="text-[11px] text-slate-500 truncate">{c.role} · {c.department}</div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                        isAnniversary 
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-purple-50 text-purple-800 border-purple-200'
                      }`}>
                        {isAnniversary ? (
                          <>
                            <Award className="w-3 h-3 text-amber-600" />
                            {c.yearsCount}y Work Anniversary
                          </>
                        ) : (
                          <>
                            <Gift className="w-3 h-3 text-purple-600" />
                            Birthday ({c.date.slice(5)})
                          </>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Shift & Check-in</h2>
              <p className="text-xs text-slate-500 mt-0.5">Shift: 09:00 - 18:00 · {currentTenant.headquarters}</p>
            </div>

            <button
              onClick={handlePunchClock}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                isClockedIn 
                  ? 'bg-rose-600 text-white hover:bg-rose-700' 
                  : isClockedOut
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isClockedIn ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isClockedIn ? 'Clock Out' : isClockedOut ? 'Clock In Again' : 'Clock In'}</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Clock In</th>
                  <th className="py-2.5 px-3">Clock Out</th>
                  <th className="py-2.5 px-3">Hours</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myAttendance.map(att => (
                  <tr key={att.id}>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{att.date}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-700">{att.clockIn || att.clockInTime || '—'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{att.clockOut || att.clockOutTime || 'Active'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-800">{att.totalWorkHours || att.totalHoursWorked || 8} hrs</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LEAVE */}
      {activeTab === 'leave' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { type: 'Paid Vacation', available: currentEmpRecord.leaveBalance.paid, total: 20 },
              { type: 'Sick Leave', available: currentEmpRecord.leaveBalance.sick, total: 10 },
              { type: 'Casual Leave', available: currentEmpRecord.leaveBalance.casual, total: 8 },
              { type: 'Parental', available: currentEmpRecord.leaveBalance.parental, total: 12 },
            ].map(w => (
              <div key={w.type} className="bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500">{w.type}</div>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {w.available} <span className="text-xs font-normal text-slate-400">/ {w.total}d</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-900 uppercase">My Requests</h2>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
            >
              + Apply Leave
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Dates</th>
                  <th className="py-2.5 px-3">Days</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myLeaves.map(l => (
                  <tr key={l.id}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{l.leaveType}</td>
                    <td className="py-2.5 px-3 text-slate-600">{l.startDate} to {l.endDate}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{l.days || l.daysCount || 1}d</td>
                    <td className="py-2.5 px-3 text-slate-500">{l.reason}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        l.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYSLIPS */}
      {activeTab === 'payslips' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Period</th>
                  <th className="py-2.5 px-3">Gross</th>
                  <th className="py-2.5 px-3">Deductions</th>
                  <th className="py-2.5 px-3">Net Pay</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myPayslips.map(slip => (
                  <tr key={slip.id}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{slip.period}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{currentTenant.currency || '$'}{(slip.grossPay || 0).toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-mono text-rose-600">-{(currentTenant.currency || '$')}{(slip.totalDeductions || 0).toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{currentTenant.currency || '$'}{(slip.netPay || 0).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => showToast('Payslip Ready', `Viewing slip for ${slip.period}`, 'info')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-xs inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EXPENSES */}
      {activeTab === 'expenses' && isModuleSubscribed('expenses') && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-900 uppercase">My Claims</h2>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
            >
              + Submit Claim
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Merchant</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myExpenses.map(exp => (
                  <tr key={exp.id}>
                    <td className="py-2.5 px-3 text-slate-600">{exp.transactionDate}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{exp.merchant}</td>
                    <td className="py-2.5 px-3 text-slate-500">{exp.category}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{exp.currency || '$'}{exp.amount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        exp.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ASSETS */}
      {activeTab === 'assets' && isModuleSubscribed('lifecycle') && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">Serial</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myAssets.map(asset => (
                  <tr key={asset.id}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{asset.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{asset.serialNumber}</td>
                    <td className="py-2.5 px-3 text-slate-600">{asset.category}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                        {asset.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COPILOT */}
      {activeTab === 'copilot' && isModuleSubscribed('ai_hub') && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
          <div className="h-64 overflow-y-auto space-y-3 p-2">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-md px-3.5 py-2 rounded-lg text-xs ${
                  msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1">{msg.time}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAskCopilot} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask a question..."
              value={copilotQuestion}
              onChange={e => setCopilotQuestion(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
            />
            <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold">
              Send
            </button>
          </form>
        </div>
      )}

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Request Leave</h3>
              <button onClick={() => setShowLeaveModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md bg-white"
                >
                  <option value="Paid Leave">Paid Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Parental Leave">Parental Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={leaveStartDate}
                    onChange={e => setLeaveStartDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={leaveEndDate}
                    onChange={e => setLeaveEndDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Days</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={leaveDays}
                  onChange={e => setLeaveDays(parseFloat(e.target.value) || 1)}
                  className="w-full p-2 border border-slate-200 rounded-md"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Reason</label>
                <textarea
                  rows={2}
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  placeholder="Reason..."
                  className="w-full p-2 border border-slate-200 rounded-md"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="flex-1 py-2 border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-900 text-white rounded-md font-semibold hover:bg-slate-800"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Submit Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1">Category</label>
                <select
                  value={expenseCategory}
                  onChange={e => setExpenseCategory(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-md bg-white"
                >
                  <option value="Client Meal">Client Meal</option>
                  <option value="Travel / Flight">Travel / Flight</option>
                  <option value="Hotel & Stay">Hotel & Stay</option>
                  <option value="Software Subscription">Software Subscription</option>
                  <option value="Office Supplies">Office Supplies</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Merchant / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Airline Ticket"
                  value={expenseMerchant}
                  onChange={e => setExpenseMerchant(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Amount ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={expenseAmount}
                  onChange={e => setExpenseAmount(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 py-2 border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-900 text-white rounded-md font-semibold hover:bg-slate-800"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
