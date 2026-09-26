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
  Shield, 
  ChevronRight,
  TrendingUp,
  HelpCircle,
  Play,
  Square,
  Coffee,
  X
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
    showToast,
    isModuleSubscribed,
    navigateTo
  } = useTenant();

  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'leave' | 'payslips' | 'expenses' | 'assets' | 'copilot'>('overview');
  
  // Modals state
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Leave Form State
  const [leaveType, setLeaveType] = useState<string>('Paid Leave');
  const [leaveStartDate, setLeaveStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveEndDate, setLeaveEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveDays, setLeaveDays] = useState(1);
  const [leaveReason, setLeaveReason] = useState('');

  // Expense Form State
  const [expenseMerchant, setExpenseMerchant] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseClaim['category']>('Client Meal');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseNotes, setExpenseNotes] = useState('');

  // Copilot Assistant state
  const [copilotQuestion, setCopilotQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: `Hello ${currentUser.name}! I am your ${currentTenant.name} Employee Handbook & Policy Assistant. Ask me anything regarding leave entitlements, expense reimbursement limits, work-from-home guidelines, or health benefits.`,
      time: 'Just now'
    }
  ]);

  // Match or generate employee record for current user
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
      a.employeeName.toLowerCase().includes(currentEmpRecord.firstName.toLowerCase()) ||
      a.employeeName.toLowerCase().includes(currentUser.name.toLowerCase())
    );
  }, [attendanceRecords, currentEmpRecord, currentUser]);

  const todayRecord = myAttendance.find(a => a.date === new Date().toISOString().split('T')[0]);
  const isClockedIn = todayRecord && !todayRecord.clockOut;

  // Personal Leaves
  const myLeaves = useMemo(() => {
    return leaveRequests.filter(l => 
      l.employeeName.toLowerCase().includes(currentEmpRecord.firstName.toLowerCase()) ||
      l.employeeName.toLowerCase().includes(currentUser.name.toLowerCase())
    );
  }, [leaveRequests, currentEmpRecord, currentUser]);

  // Personal Payslips
  const myPayslips = useMemo(() => {
    return payslips.filter(p => 
      p.employeeName.toLowerCase().includes(currentEmpRecord.firstName.toLowerCase()) ||
      p.employeeName.toLowerCase().includes(currentUser.name.toLowerCase())
    );
  }, [payslips, currentEmpRecord, currentUser]);

  // Personal Expenses
  const myExpenses = useMemo(() => {
    return expenses.filter(e => 
      e.employeeName.toLowerCase().includes(currentEmpRecord.firstName.toLowerCase()) ||
      e.employeeName.toLowerCase().includes(currentUser.name.toLowerCase())
    );
  }, [expenses, currentEmpRecord, currentUser]);

  // Personal Assets
  const myAssets = useMemo(() => {
    return assets.filter(a => a.assignedToEmployeeId === currentEmpRecord.id);
  }, [assets, currentEmpRecord]);

  const handlePunchClock = () => {
    if (!isClockedIn) {
      logAttendanceClockIn(`${currentEmpRecord.firstName} ${currentEmpRecord.lastName}`, currentEmpRecord.department);
      showToast('Clocked In Successfully', `Logged check-in at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 'success');
    } else if (todayRecord) {
      logAttendanceClockOut(todayRecord.id);
      showToast('Clocked Out Successfully', `Logged check-out. Total hours recorded for today.`, 'info');
    }
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) {
      showToast('Validation Error', 'Please enter a brief reason for your leave.', 'warning');
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
    showToast('Leave Request Submitted', `Your ${leaveType} request for ${leaveDays} day(s) has been routed to your manager for approval.`, 'success');
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount);
    if (!expenseMerchant.trim() || isNaN(amt) || amt <= 0) {
      showToast('Validation Error', 'Please enter a valid merchant/title and amount.', 'warning');
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
      receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
      receiptName: 'Receipt_Attachment.pdf',
      notes: expenseNotes
    });

    setShowExpenseModal(false);
    setExpenseMerchant('');
    setExpenseAmount('');
    setExpenseNotes('');
    showToast('Expense Claim Submitted', `Submitted claim of ${currentTenant.currency || '$'}${amt} for approval.`, 'success');
  };

  const handleAskCopilot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuestion.trim()) return;

    const query = copilotQuestion.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let responseText = '';
    const qLower = query.toLowerCase();

    if (qLower.includes('leave') || qLower.includes('pto') || qLower.includes('vacation') || qLower.includes('sick')) {
      responseText = `According to ${currentTenant.name}'s policy handbook, full-time staff accrue paid leave monthly. You currently have ${currentEmpRecord.leaveBalance.paid} Paid Leave days and ${currentEmpRecord.leaveBalance.sick} Sick Leave days available in your wallet. Requests exceeding 3 consecutive business days require 1-week prior notification.`;
    } else if (qLower.includes('expense') || qLower.includes('reimburse') || qLower.includes('meal') || qLower.includes('travel')) {
      responseText = `${currentTenant.name} provides direct payroll reimbursements for approved business expenses. Client dinners are capped at $75/person, and travel lodging adheres to standard corporate tier limits. Receipts must be attached within 30 days of the spend date.`;
    } else if (qLower.includes('work from home') || qLower.includes('wfh') || qLower.includes('remote')) {
      responseText = `${currentTenant.name} operates on a flexible hybrid work model (2-3 days remote per week with manager coordination). Core collaboration hours are 10:00 AM to 4:00 PM in your local timezone.`;
    } else if (qLower.includes('payroll') || qLower.includes('salary') || qLower.includes('pay day')) {
      responseText = `Payroll at ${currentTenant.name} is processed monthly and disbursed directly to your registered bank account on the 28th of each calendar month. Digital payslips are immediately accessible under your "Payslips" tab.`;
    } else {
      responseText = `Under ${currentTenant.name} standard workplace guidelines, all staff enjoy comprehensive health coverage, continuous learning stipends up to $1,000/year, and ergonomic home-office allowances. Please consult your HR Manager (${currentUser.department}) for unique exception approvals.`;
    }

    setChatHistory(prev => [
      ...prev,
      { role: 'user', text: query, time: timeStr },
      { role: 'assistant', text: responseText, time: timeStr }
    ]);
    setCopilotQuestion('');
  };

  return (
    <div className="space-y-6 pb-12 max-w-full">
      {/* 1. Header Profile & Workspace Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-2xl text-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <User className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-bold text-white shrink-0 shadow-inner">
              {currentUser.avatarInitials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {currentUser.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-xs">
                  {currentUser.role}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                  {currentTenant.name}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-100 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{currentEmpRecord.department}</span>
                <span>•</span>
                <span>ID: <strong className="font-mono text-white">{currentEmpRecord.id}</strong></span>
                <span>•</span>
                <span>Location: {currentEmpRecord.location || currentTenant.headquarters}</span>
              </p>
            </div>
          </div>

          {/* Quick Clock-In / Punch Action */}
          <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 self-start md:self-auto">
            <div className="text-left pr-2">
              <div className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Attendance Status</div>
              <div className="text-sm font-bold flex items-center gap-1.5 text-white">
                <span className={`w-2.5 h-2.5 rounded-full ${isClockedIn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'}`} />
                {isClockedIn ? 'Clocked In (Active)' : 'Not Clocked In'}
              </div>
            </div>

            <button
              onClick={handlePunchClock}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                isClockedIn 
                  ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {isClockedIn ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  Clock Out
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Clock In Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. My Space Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar gap-1 bg-white p-1 rounded-xl shadow-2xs">
        {[
          { id: 'overview', label: 'My Dashboard', icon: TrendingUp },
          { id: 'attendance', label: 'My Attendance', icon: Clock },
          { id: 'leave', label: 'Leave & Time-Off', icon: CalendarOff, count: myLeaves.length },
          { id: 'payslips', label: 'Payslips & Comp', icon: Receipt, count: myPayslips.length },
          ...(isModuleSubscribed('expenses') ? [{ id: 'expenses', label: 'My Expenses', icon: CreditCard, count: myExpenses.length }] : []),
          ...(isModuleSubscribed('lifecycle') ? [{ id: 'assets', label: 'My Assets', icon: Laptop, count: myAssets.length }] : []),
          ...(isModuleSubscribed('ai_hub') ? [{ id: 'copilot', label: 'AI Policy Assistant', icon: Sparkles }] : []),
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}

      {/* TAB A: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 Self-Service Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Leave Wallet Summary */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Leave Balance</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <CalendarOff className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {currentEmpRecord.leaveBalance.paid + currentEmpRecord.leaveBalance.sick} <span className="text-xs font-normal text-slate-500">Days Available</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500">{currentEmpRecord.leaveBalance.paid} Paid • {currentEmpRecord.leaveBalance.sick} Sick</span>
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="text-blue-600 hover:text-blue-700 font-bold"
                >
                  Apply +
                </button>
              </div>
            </div>

            {/* 2. Today's Punch Time */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Check-In</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {todayRecord?.clockIn || '--:--'}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500">Shift: 09:00 - 18:00</span>
                <span className={`font-semibold ${isClockedIn ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {isClockedIn ? 'Active' : 'Off Clock'}
                </span>
              </div>
            </div>

            {/* 3. Monthly Net Salary */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Latest Net Salary</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {currentTenant.currency || '$'}{Math.round(currentEmpRecord.salary / 12 * 0.78).toLocaleString()}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500">Disbursed on 28th</span>
                <button
                  onClick={() => setActiveTab('payslips')}
                  className="text-blue-600 hover:text-blue-700 font-bold"
                >
                  View Slip
                </button>
              </div>
            </div>

            {/* 4. Company AI Policy Copilot */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Policy Copilot</span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="text-sm font-bold text-slate-800">
                24/7 Policy Answers
              </div>
              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500">Leave, perks & WFH</span>
                <button
                  onClick={() => setActiveTab('copilot')}
                  className="text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1"
                >
                  Ask Copilot
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Leaves */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Quick Actions Grid */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Quick Self-Service Actions
              </h2>

              <div className="space-y-2.5">
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="w-full p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-xs font-bold">
                      <CalendarOff className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Apply for Time-Off</div>
                      <div className="text-[11px] text-slate-500">Paid, sick, casual or parental leave</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                </button>

                {isModuleSubscribed('expenses') && (
                  <button
                    onClick={() => setShowExpenseModal(true)}
                    className="w-full p-3 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-600">Submit Expense Claim</div>
                        <div className="text-[11px] text-slate-500">Upload receipt for reimbursement</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('payslips')}
                  className="w-full p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Download Latest Payslip</div>
                      <div className="text-[11px] text-slate-500">PDF salary voucher & tax breakdown</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                </button>

                <button
                  onClick={() => navigateTo('core_hr')}
                  className="w-full p-3 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">View Team Directory & Org Chart</div>
                      <div className="text-[11px] text-slate-500">Colleagues and reporting hierarchy</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                </button>
              </div>
            </div>

            {/* Middle & Right: Leave & Attendance Status */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CalendarOff className="w-4 h-4 text-amber-600" />
                  My Recent Leave Requests
                </h2>
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  New Leave
                </button>
              </div>

              {myLeaves.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
                  <CalendarOff className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No active leave requests</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">You haven't requested any time-off recently.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Dates</th>
                        <th className="py-2.5 px-3">Days</th>
                        <th className="py-2.5 px-3">Reason</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myLeaves.slice(0, 5).map(l => (
                        <tr key={l.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {l.leaveType}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {l.startDate} to {l.endDate}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                            {l.days || l.daysCount || 1} {(l.days || l.daysCount) === 1 ? 'day' : 'days'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">
                            {l.reason}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              l.status === 'approved' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : l.status === 'rejected' 
                                ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
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
          </div>
        </div>
      )}

      {/* TAB B: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Clock Status Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Punch Status</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isClockedIn ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {isClockedIn ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>

              <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-3xl font-mono font-bold text-slate-900">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {currentTenant.headquarters} (Geofence Verified)
                </div>
              </div>

              <button
                onClick={handlePunchClock}
                className={`w-full py-3 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 ${
                  isClockedIn
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isClockedIn ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    Punch Out (End Today's Shift)
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Punch In (Start Shift)
                  </>
                )}
              </button>
            </div>

            {/* Shift Details */}
            <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Assigned Shift & Weekly Schedule</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
                  <div className="text-[11px] font-bold text-blue-700 uppercase">Primary Shift</div>
                  <div className="text-base font-bold text-slate-900 mt-1">General Day Shift</div>
                  <div className="text-xs text-slate-600 mt-1">09:00 AM - 06:00 PM (1h lunch break)</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Work Model</div>
                  <div className="text-base font-bold text-slate-900 mt-1">Hybrid (Flexible)</div>
                  <div className="text-xs text-slate-600 mt-1">2 Days Remote / 3 Days In-Office</div>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-500">
                Weekly Target: <strong>40.0 Hours</strong> • Overtime Policy: Automatic calculation over 8h/day.
              </div>
            </div>
          </div>

          {/* Punch History */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">My Attendance History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Clock In</th>
                    <th className="py-2.5 px-3">Clock Out</th>
                    <th className="py-2.5 px-3">Total Work</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myAttendance.map(att => (
                    <tr key={att.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-medium text-slate-900">{att.date}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-700 font-semibold">{att.clockIn || att.clockInTime || '09:00'}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{att.clockOut || att.clockOutTime || 'Active'}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{att.totalWorkHours || att.totalHoursWorked || 8.0} hrs</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          att.status === 'present' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {att.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB C: LEAVE & TIME-OFF */}
      {activeTab === 'leave' && (
        <div className="space-y-6">
          {/* 4 Leave Wallets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { type: 'Paid Vacation', available: currentEmpRecord.leaveBalance.paid, total: 20, color: 'blue' },
              { type: 'Sick / Medical', available: currentEmpRecord.leaveBalance.sick, total: 10, color: 'emerald' },
              { type: 'Casual Leave', available: currentEmpRecord.leaveBalance.casual, total: 8, color: 'amber' },
              { type: 'Parental / Family', available: currentEmpRecord.leaveBalance.parental, total: 12, color: 'purple' },
            ].map(w => (
              <div key={w.type} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">{w.type}</div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {w.available} <span className="text-xs font-normal text-slate-500">/ {w.total} days</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${(w.available / w.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900">My Leave Applications</h2>
              <p className="text-xs text-slate-500">Track pending and past time-off approvals</p>
            </div>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Apply Leave
            </button>
          </div>

          {/* Full Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Leave Category</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Total Days</th>
                  <th className="py-3 px-4">Reason / Comments</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myLeaves.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900 capitalize">{l.leaveType}</td>
                    <td className="py-3 px-4 text-slate-600">{l.startDate} → {l.endDate}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{l.days || l.daysCount || 1} days</td>
                    <td className="py-3 px-4 text-slate-500">{l.reason}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        l.status === 'approved' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : l.status === 'rejected' 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
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

      {/* TAB D: PAYSLIPS & COMPENSATION */}
      {activeTab === 'payslips' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Annual CTC Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Annual Compensation (CTC)</div>
              <div className="text-3xl font-extrabold text-slate-900">
                {currentTenant.currency || '$'}{currentEmpRecord.salary.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">
                Monthly Gross: <strong>{currentTenant.currency || '$'}{Math.round(currentEmpRecord.salary / 12).toLocaleString()}</strong>
              </div>
            </div>

            {/* Tax Bracket */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Withholding</div>
              <div className="text-3xl font-extrabold text-slate-900">
                22.0%
              </div>
              <div className="text-xs text-slate-500">
                Statutory Federal & State Tax deductions applied
              </div>
            </div>

            {/* Next Payout Date */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming Disbursal</div>
              <div className="text-3xl font-extrabold text-blue-600">
                28th of Month
              </div>
              <div className="text-xs text-slate-500">
                Direct ACH Deposit via {currentTenant.name} Treasury
              </div>
            </div>
          </div>

          {/* Payslips List */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Download Digital Payslip Vouchers</h2>

            {myPayslips.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
                <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No generated payslips for this period yet</p>
                <p className="text-[11px] text-slate-500">Your payroll officer will publish monthly statements on the 28th.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Pay Period</th>
                      <th className="py-3 px-4">Gross Salary</th>
                      <th className="py-3 px-4">Deductions</th>
                      <th className="py-3 px-4">Net Take-Home</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myPayslips.map(slip => (
                      <tr key={slip.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{slip.period}</td>
                        <td className="py-3 px-4 font-mono text-slate-700">{currentTenant.currency || '$'}{(slip.grossPay || 0).toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono text-rose-600">-{(currentTenant.currency || '$')}{(slip.totalDeductions || 0).toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">{currentTenant.currency || '$'}{(slip.netPay || 0).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              showToast('Downloading Payslip', `Generating official PDF voucher for ${slip.period}...`, 'info');
                            }}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-xs inline-flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            PDF Voucher
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB E: EXPENSES */}
      {activeTab === 'expenses' && isModuleSubscribed('expenses') && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900">My Expense Claims</h2>
              <p className="text-xs text-slate-500">Submit and track corporate reimbursements</p>
            </div>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              New Expense Claim
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Merchant & Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{exp.merchant}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{exp.category}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{exp.submittedAt || exp.transactionDate}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{exp.currency}{exp.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        exp.status === 'approved' || exp.status === 'disbursed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : exp.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
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

      {/* TAB F: ASSIGNED ASSETS */}
      {activeTab === 'assets' && isModuleSubscribed('lifecycle') && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Company Hardware Allocated to You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAssets.length === 0 ? (
                <div className="col-span-2 p-8 text-center border border-dashed border-slate-200 rounded-xl">
                  <Laptop className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No hardware assets registered under your profile</p>
                </div>
              ) : (
                myAssets.map(ast => (
                  <div key={ast.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900">{ast.name}</div>
                      <div className="text-[11px] text-slate-500">Serial: <span className="font-mono text-slate-800">{ast.serialNumber}</span></div>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-1">Condition: {ast.condition} • Allocated: {ast.allocatedDate}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB G: AI POLICY COPILOT */}
      {activeTab === 'copilot' && isModuleSubscribed('ai_hub') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[560px]">
          <div className="p-4 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900">{currentTenant.name} Employee Handbook Copilot</h2>
                <p className="text-[10px] text-purple-700">Instant answers regarding company policies & benefits</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {chatHistory.map((msg, i) => (
              <div 
                key={i} 
                className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-purple-100 text-purple-700'
                }`}>
                  {msg.role === 'user' ? currentUser.avatarInitials : 'AI'}
                </div>
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'
                }`}>
                  {msg.text}
                  <div className={`text-[9px] mt-1.5 opacity-70 ${msg.role === 'user' ? 'text-right' : ''}`}>{msg.time}</div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAskCopilot} className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
            <input
              type="text"
              value={copilotQuestion}
              onChange={e => setCopilotQuestion(e.target.value)}
              placeholder="Ask about leave rules, expense limits, insurance, or WFH..."
              className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Ask
            </button>
          </form>
        </div>
      )}

      {/* LEAVE APPLICATION MODAL */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarOff className="w-4 h-4 text-blue-600" />
                Submit Time-Off Application
              </h3>
              <button onClick={() => setShowLeaveModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Paid Leave">Paid Annual Vacation ({currentEmpRecord.leaveBalance.paid} days available)</option>
                  <option value="Sick Leave">Sick / Medical Leave ({currentEmpRecord.leaveBalance.sick} days available)</option>
                  <option value="Casual Leave">Casual Leave ({currentEmpRecord.leaveBalance.casual} days available)</option>
                  <option value="Parental Leave">Parental Leave ({currentEmpRecord.leaveBalance.parental} days available)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={leaveStartDate}
                    onChange={e => setLeaveStartDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={leaveEndDate}
                    onChange={e => setLeaveEndDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Days</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={leaveDays}
                  onChange={e => setLeaveDays(parseFloat(e.target.value) || 1)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason / Notes</label>
                <textarea
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  placeholder="E.g., Personal family commitment, medical checkup..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs h-20"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPENSE APPLICATION MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Submit Expense Claim
              </h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Merchant / Spend Purpose</label>
                <input
                  type="text"
                  value={expenseMerchant}
                  onChange={e => setExpenseMerchant(e.target.value)}
                  placeholder="E.g., Blue Bottle Coffee, AWS Training..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={expenseCategory}
                    onChange={e => setExpenseCategory(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Client Meal">Client Meal</option>
                    <option value="Travel">Travel & Transport</option>
                    <option value="Software/Tools">Software & Tools</option>
                    <option value="Home Office">Home Office</option>
                    <option value="Wellness">Wellness</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount ({currentTenant.currency || '$'})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseAmount}
                    onChange={e => setExpenseAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Business Purpose</label>
                <textarea
                  value={expenseNotes}
                  onChange={e => setExpenseNotes(e.target.value)}
                  placeholder="Briefly describe the business need..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs h-16"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
