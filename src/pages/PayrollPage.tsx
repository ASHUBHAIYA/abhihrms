import React, { useState, useMemo } from 'react';
import { useTenant } from '../context/TenantContext';
import { ModuleGuard } from '../components/common/ModuleGuard';
import { Payslip, Employee } from '../types/hrms';
import { 
  Play, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  Printer, 
  Search, 
  Download, 
  Mail, 
  CheckCircle2, 
  Sliders, 
  Calendar, 
  DollarSign, 
  Receipt, 
  Building2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Info, 
  FileText, 
  CreditCard, 
  ChevronRight,
  TrendingUp,
  Percent,
  Check,
  Award
} from 'lucide-react';

export const PayrollPage: React.FC = () => {
  return (
    <ModuleGuard module="payroll">
      <PayrollContent />
    </ModuleGuard>
  );
};

export const PayrollContent: React.FC = () => {
  const { 
    currentTenant, 
    employees, 
    payrollRuns, 
    payslips, 
    executePayrollRun, 
    currentUser,
    showToast 
  } = useTenant();

  // Active sub-tabs
  const [activeTab, setActiveTab] = useState<'register' | 'salary_structure' | 'batches'>('register');

  // Period Selector
  const [selectedPeriod, setSelectedPeriod] = useState('September 2026');
  const payPeriodRange = 'Aug 26, 2026 – Sep 25, 2026';
  const payDisbursalDate = '2026-10-01';

  // Filters for Employee Register
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Interactive Modals
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [attendanceConfirmed, setAttendanceConfirmed] = useState(false);
  const [bonusPoolPct, setBonusPoolPct] = useState(0);
  const [disbursementMethod, setDisbursementMethod] = useState<'Direct ACH' | 'Wire Transfer' | 'Manual'>('Direct ACH');

  // Payslip Drawer / Modal
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  // Live CTC Calculator State in Salary Structure Tab
  const [simulatedCtc, setSimulatedCtc] = useState<number>(150000);

  // Departments list
  const departments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department));
    return ['All', ...Array.from(depts)];
  }, [employees]);

  // Check if current period has already been processed
  const currentPeriodRun = useMemo(() => {
    return payrollRuns.find(r => r.period.toLowerCase() === selectedPeriod.toLowerCase());
  }, [payrollRuns, selectedPeriod]);

  // Top Metrics Calculations across active employees
  const totalGrossEstimated = useMemo(() => {
    return Math.round(employees.reduce((acc, e) => acc + (e.salary / 12), 0));
  }, [employees]);

  const totalBasicEstimated = useMemo(() => Math.round(totalGrossEstimated * 0.50), [totalGrossEstimated]);
  const totalPfEstimated = useMemo(() => Math.round(totalBasicEstimated * 0.12), [totalBasicEstimated]);
  const totalPtEstimated = useMemo(() => employees.length * 200, [employees.length]);
  const totalTdsEstimated = useMemo(() => Math.round(totalGrossEstimated * 0.15), [totalGrossEstimated]);
  const totalHealthEstimated = useMemo(() => employees.length * 350, [employees.length]);
  const totalStatutoryDeductions = useMemo(() => {
    return totalPfEstimated + totalPtEstimated + totalTdsEstimated + totalHealthEstimated;
  }, [totalPfEstimated, totalPtEstimated, totalTdsEstimated, totalHealthEstimated]);

  const totalNetEstimated = useMemo(() => {
    return totalGrossEstimated - totalStatutoryDeductions;
  }, [totalGrossEstimated, totalStatutoryDeductions]);

  // Attendance metrics
  const attendanceSettledRate = 96.4;
  const pendingRegularizations = 2;
  const totalLopDaysAcrossStaff = 1;

  // Filtered employee payroll records
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = 
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = selectedDept === 'All' || emp.department === selectedDept;
      return matchSearch && matchDept;
    });
  }, [employees, searchQuery, selectedDept]);

  // Format numbers with commas
  const formatMoney = (amount: number) => {
    return `$${Math.round(amount).toLocaleString()}`;
  };

  // Helper to convert number to words for payslip
  const numberToWords = (num: number): string => {
    const rounded = Math.round(num);
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (rounded === 0) return 'Zero Dollars Only';
    
    let words = '';
    const thousands = Math.floor(rounded / 1000);
    const remainder = rounded % 1000;
    
    if (thousands > 0) {
      if (thousands >= 100) {
        words += `${ones[Math.floor(thousands / 100)]} Hundred `;
        const tRem = thousands % 100;
        if (tRem > 0) {
          words += tRem < 20 ? `${ones[tRem]} ` : `${tens[Math.floor(tRem / 10)]} ${ones[tRem % 10]} `;
        }
      } else if (thousands >= 20) {
        words += `${tens[Math.floor(thousands / 10)]} ${ones[thousands % 10]} `;
      } else {
        words += `${ones[thousands]} `;
      }
      words += 'Thousand ';
    }
    
    if (remainder > 0) {
      if (remainder >= 100) {
        words += `${ones[Math.floor(remainder / 100)]} Hundred `;
        const rRem = remainder % 100;
        if (rRem > 0) {
          words += rRem < 20 ? `${ones[rRem]} ` : `${tens[Math.floor(rRem / 10)]} ${ones[rRem % 10]} `;
        }
      } else if (remainder >= 20) {
        words += `${tens[Math.floor(remainder / 10)]} ${ones[remainder % 10]} `;
      } else {
        words += `${ones[remainder]} `;
      }
    }
    
    return `${words.trim()} Dollars and Zero Cents Only`;
  };

  // Find or generate active payslip for an employee
  const handleOpenPayslipForEmployee = (emp: Employee) => {
    const existing = payslips.find(p => p.employeeId === emp.id && p.period === selectedPeriod) ||
      payslips.find(p => p.employeeId === emp.id) ||
      payslips[0];

    if (existing) {
      setSelectedPayslip(existing);
    } else {
      // Generate synthetic structured payslip on the fly for viewing
      const monthlyGross = Math.round(emp.salary / 12);
      const basic = Math.round(monthlyGross * 0.50);
      const housing = Math.round(monthlyGross * 0.20);
      const special = Math.round(monthlyGross * 0.20);
      const bonus = Math.round(monthlyGross * 0.10);
      const pf = Math.round(basic * 0.12);
      const pt = 200;
      const tds = Math.round(monthlyGross * 0.15);
      const health = 350;
      const totalDed = pf + pt + tds + health;
      const net = monthlyGross - totalDed;

      setSelectedPayslip({
        id: `SLIP-${emp.id}-LIVE`,
        payrollRunId: 'PAY-TECH-09',
        tenantId: currentTenant.id,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        role: emp.role,
        department: emp.department,
        period: selectedPeriod,
        payDate: payDisbursalDate,
        payPeriodRange,
        annualCtc: emp.salary,
        basicSalary: basic,
        housingAllowance: housing,
        transportAllowance: Math.round(housing * 0.4),
        specialAllowance: special,
        performanceBonus: bonus,
        grossPay: monthlyGross,
        taxDeduction: tds,
        providentFund: pf,
        professionalTax: pt,
        socialSecurity: pf,
        healthInsurance: health,
        lossOfPayDeduction: 0,
        totalDeductions: totalDed,
        netPay: net,
        paymentStatus: currentPeriodRun ? 'Paid' : 'Pending',
        bankAccountMasked: `•••• ${Math.floor(2000 + (emp.salary % 7000))} (Chase Corporate Direct)`,
        taxIdMasked: `XXX-XX-${Math.floor(1000 + (emp.salary % 8999))}`,
        routingMasked: '021000021',
        workedDays: 30,
        lopDays: 0
      });
    }
  };

  const handleFinishWizard = () => {
    executePayrollRun(selectedPeriod, payDisbursalDate, {
      disbursementMethod,
      bonusPoolPct,
      payPeriodRange
    });
    setWizardOpen(false);
    setWizardStep(1);
    setAttendanceConfirmed(false);
  };

  // CTC Simulator calculated values
  const simMonthlyGross = Math.round(simulatedCtc / 12);
  const simBasic = Math.round(simMonthlyGross * 0.50);
  const simHra = Math.round(simMonthlyGross * 0.20);
  const simSpecial = Math.round(simMonthlyGross * 0.20);
  const simBonus = Math.round(simMonthlyGross * 0.10);

  const simPf = Math.round(simBasic * 0.12);
  const simPt = 200;
  const simTds = Math.round(simMonthlyGross * 0.14);
  const simHealth = 350;
  const simTotalDeductions = simPf + simPt + simTds + simHealth;
  const simNetTakeHome = simMonthlyGross - simTotalDeductions;
  const simAnnualNet = simNetTakeHome * 12;

  return (
    <div className="space-y-6 pb-12 max-w-full">
      {/* 1. Cycle Summary Banner & Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Tenant & Cycle Title */}
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-xs shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Payroll Engine & Statutory Compensation
                </h1>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                  currentPeriodRun
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {currentPeriodRun ? '● SETTLED & DISBURSED' : '○ DRAFT · READY FOR SETTLEMENT'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated gross-to-net engine, 50-20-20-10 salary structuring, statutory PF/TDS/PT withholdings, and ACH disbursals for <strong className="text-slate-800">{currentTenant.name}</strong>.
              </p>
            </div>
          </div>

          {/* Action Button & Period Selector */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Period Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500 font-medium">Cycle:</span>
              <select
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="September 2026">September 2026</option>
                <option value="August 2026">August 2026</option>
                <option value="July 2026">July 2026</option>
                <option value="October 2026">October 2026 (Upcoming)</option>
              </select>
            </div>

            {/* Execute Payroll Run Button */}
            <button
              onClick={() => {
                setWizardStep(1);
                setWizardOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-xs active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Execute Payroll Run
            </button>
          </div>
        </div>

        {/* Timeline & Date Range Ribbon */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="text-slate-500 text-[11px] block">Pay Period Range</span>
              <span className="font-mono text-slate-800 font-bold">{payPeriodRange}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-slate-500 text-[11px] block">Payment Disbursal Date</span>
              <span className="font-mono text-emerald-700 font-bold">{payDisbursalDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <span className="text-slate-500 text-[11px] block">Disbursement Channel</span>
              <span className="font-medium text-slate-800">Direct ACH Batch Clearing</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four Key Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Gross Payroll */}
        <div className="p-5 bg-white border border-slate-200 hover:border-blue-300 rounded-2xl space-y-2 transition-all shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Total Gross Payroll</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {formatMoney(totalGrossEstimated)}
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
              +3.2% MoM
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            {employees.length} Active Staff · Basic 50% / HRA 20%
          </div>
        </div>

        {/* KPI 2: Net Disbursable Amount */}
        <div className="p-5 bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl space-y-2 transition-all shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Net Disbursable Amount</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              {formatMoney(totalNetEstimated)}
            </div>
            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-semibold">
              Take-Home
            </span>
          </div>

          <div className="text-[11px] text-slate-500">
            Gross minus statutory & tax withholdings
          </div>
        </div>

        {/* KPI 3: Total Statutory Deductions */}
        <div className="p-5 bg-white border border-slate-200 hover:border-amber-300 rounded-2xl space-y-2 transition-all shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Total Statutory Deductions</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
              {formatMoney(totalStatutoryDeductions)}
            </div>
            <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-semibold">
              Escrow
            </span>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="font-medium text-slate-700">PF ({formatMoney(totalPfEstimated)})</span>
            <span>·</span>
            <span className="font-medium text-slate-700">TDS / PT</span>
          </div>
        </div>

        {/* KPI 4: Attendance Settled & LOP */}
        <div className="p-5 bg-white border border-slate-200 hover:border-purple-300 rounded-2xl space-y-2 transition-all shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Attendance Settled & LOP</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-purple-700 tabular-nums">
              {attendanceSettledRate}%
            </div>
            <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 font-semibold">
              Reconciled
            </span>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>{pendingRegularizations} Regularized</span>
            <span>·</span>
            <span className="text-rose-600 font-semibold">{totalLopDaysAcrossStaff}d LOP</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('register')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Employee Payroll Register ({employees.length})
          </button>

          <button
            onClick={() => setActiveTab('salary_structure')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'salary_structure'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Salary Structures & CTC Calculator
          </button>

          <button
            onClick={() => setActiveTab('batches')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'batches'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Processed Batches ({payrollRuns.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: Employee Payroll Register & Payslip Actions */}
      {activeTab === 'register' && (
        <div className="space-y-4">
          {/* Search & Department Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[220px] max-w-md bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by employee name, ID, role or department..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-medium text-slate-500">Department:</span>
                <select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500 font-medium shadow-2xs"
                >
                  {departments.map(d => (
                    <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
                  ))}
                </select>
              </div>

              <span className="text-xs font-mono font-medium text-slate-500">
                Showing {filteredEmployees.length} of {employees.length} Staff
              </span>
            </div>
          </div>

          {/* Payroll Register Responsive Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Role & Dept</th>
                    <th className="py-3 px-4">Base Annual CTC</th>
                    <th className="py-3 px-4">Monthly Gross</th>
                    <th className="py-3 px-4">Deductions (PF+Tax+LOP)</th>
                    <th className="py-3 px-4">Net In-Hand Pay</th>
                    <th className="py-3 px-4 text-center">Payout Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-500 text-xs">
                        No employees found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp, idx) => {
                      const monthlyGross = Math.round(emp.salary / 12);
                      const basic = Math.round(monthlyGross * 0.50);
                      const pf = Math.round(basic * 0.12);
                      const pt = 200;
                      const tds = Math.round(monthlyGross * 0.15);
                      const health = 350;
                      const lopDeduction = emp.status === 'notice' ? Math.round(monthlyGross / 30) : 0;
                      const totalDed = pf + pt + tds + health + lopDeduction;
                      const netPay = monthlyGross - totalDed;

                      return (
                        <tr 
                          key={emp.id}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                          onClick={() => handleOpenPayslipForEmployee(emp)}
                        >
                          {/* Employee Name + Avatar */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                                {emp.firstName[0]}{emp.lastName[0]}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">
                                  {emp.firstName} {emp.lastName}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  ID: {emp.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role & Dept */}
                          <td className="py-3.5 px-4">
                            <div className="text-slate-900 font-semibold">{emp.role}</div>
                            <div className="text-[11px] text-slate-500">{emp.department}</div>
                          </td>

                          {/* Annual CTC */}
                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 tabular-nums">
                            ${(emp.salary / 1000).toFixed(0)}k / yr
                          </td>

                          {/* Monthly Gross */}
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 tabular-nums">
                            {formatMoney(monthlyGross)}
                          </td>

                          {/* Deductions Breakdown */}
                          <td className="py-3.5 px-4 font-mono text-amber-700 tabular-nums">
                            -{formatMoney(totalDed)}
                            {lopDeduction > 0 && (
                              <span className="block text-[10px] text-rose-600 font-sans font-medium">
                                (incl. 1d LOP)
                              </span>
                            )}
                          </td>

                          {/* Net Pay */}
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 tabular-nums">
                            {formatMoney(netPay)}
                          </td>

                          {/* Payout Status */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                              currentPeriodRun
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {currentPeriodRun ? 'Paid' : 'Approved'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => handleOpenPayslipForEmployee(emp)}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors border border-blue-200 shadow-2xs"
                              >
                                View Payslip
                              </button>
                              <button
                                onClick={() => {
                                  showToast('Payslip Downloaded', `Generated PDF payslip for ${emp.firstName} ${emp.lastName}.`, 'success');
                                }}
                                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Download PDF Payslip"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Salary Structures & Statutory Breakdown + Live CTC Simulator */}
      {activeTab === 'salary_structure' && (
        <div className="space-y-6">
          
          {/* Section: Component Architecture (Earnings vs Deductions) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Card: Earnings Component Architecture */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Earnings Component Structure</h3>
                    <p className="text-[11px] text-slate-500">Standardized 50-20-20-10 distribution model</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  100% CTC
                </span>
              </div>

              <div className="space-y-3">
                {/* 1. Basic Pay */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">1. Basic Pay</span>
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">50% of CTC</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Statutory foundational component. Forms the calculation base for employee & employer Provident Fund (PF) contributions. Fully taxable.
                  </p>
                </div>

                {/* 2. House Rent Allowance */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">2. House Rent Allowance (HRA)</span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">20% of CTC</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Designed to assist with residential rental accommodation. Eligible for statutory tax exemptions subject to submission of rent receipts.
                  </p>
                </div>

                {/* 3. Special Allowance */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">3. Special Allowance</span>
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">20% of CTC</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Flexible compensation balance component covering daily operational & incidental employee expenses. Fully taxable under income rules.
                  </p>
                </div>

                {/* 4. Performance Bonus */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">4. Performance Bonus / Variable</span>
                    <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">10% of CTC</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Quarterly/annual milestone-linked incentive pool disbursed based on organizational and individual OKR achievements.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card: Statutory Deductions & Tax Architecture */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                    <Percent className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Statutory Deductions Architecture</h3>
                    <p className="text-[11px] text-slate-500">Compliance withholdings & social security rules</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  STATUTORY ESCROW
                </span>
              </div>

              <div className="space-y-3">
                {/* 1. Provident Fund */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">1. Provident Fund (PF)</span>
                    <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">12% of Basic</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Mandatory retirement savings scheme. 12% deducted from employee basic salary with matching employer contribution deposited into the PF trust.
                  </p>
                </div>

                {/* 2. Professional Tax */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">2. Professional Tax (PT)</span>
                    <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">Flat $200 / mo</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Statutory municipal/state employment levy deducted monthly from salaried individuals in accordance with regional regulations.
                  </p>
                </div>

                {/* 3. Tax Deducted at Source */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">3. Tax Deducted at Source (TDS)</span>
                    <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Tiered (10% - 18%)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Advance income tax withholding based on annual estimated taxable slab, factoring standard deductions and investment declarations.
                  </p>
                </div>

                {/* 4. Loss of Pay */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">4. Loss of Pay (LOP)</span>
                    <span className="font-mono font-bold text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded border border-slate-300">Prorated / Day</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Applied automatically when an employee incurs unapproved leaves or exhausts all accrued paid/casual leave wallets. Formula: <code className="font-mono text-slate-800">(Gross / 30) * Absent Days</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Component Ratio Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Visual Ratio Breakdown of Gross CTC (50 : 20 : 20 : 10)
            </h4>

            {/* Segmented Ratio Bar */}
            <div className="h-6 w-full rounded-xl overflow-hidden flex shadow-inner border border-slate-200">
              <div style={{ width: '50%' }} className="bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold">
                Basic Pay (50%)
              </div>
              <div style={{ width: '20%' }} className="bg-emerald-600 flex items-center justify-center text-white text-[11px] font-bold">
                HRA (20%)
              </div>
              <div style={{ width: '20%' }} className="bg-indigo-600 flex items-center justify-center text-white text-[11px] font-bold">
                Special (20%)
              </div>
              <div style={{ width: '10%' }} className="bg-amber-500 flex items-center justify-center text-white text-[11px] font-bold">
                Bonus (10%)
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2 pt-1">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-600"></span> Basic Pay: 50%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-600"></span> HRA: 20%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-indigo-600"></span> Special Allowance: 20%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Performance Variable: 10%</span>
            </div>
          </div>

          {/* Section: Live Interactive CTC Simulator / Calculator */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Live Interactive CTC & In-Hand Simulator</h3>
                  <p className="text-xs text-slate-500">Test how annual CTC breaks down into monthly take-home pay</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Input CTC:</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">$</span>
                  <input
                    type="number"
                    min={30000}
                    max={500000}
                    step={5000}
                    value={simulatedCtc}
                    onChange={e => setSimulatedCtc(Number(e.target.value))}
                    className="pl-6 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs w-36"
                  />
                </div>
              </div>
            </div>

            {/* Simulated Live Breakdown Result Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Box 1: Monthly Earnings Computed */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <span className="text-emerald-700 uppercase tracking-wider text-[11px]">Monthly Earnings</span>
                  <span className="font-mono">{formatMoney(simMonthlyGross)}</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span>Basic Pay (50%)</span>
                    <span className="font-mono font-semibold text-slate-900">{formatMoney(simBasic)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>HRA (20%)</span>
                    <span className="font-mono font-semibold text-slate-900">{formatMoney(simHra)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Special Allowance (20%)</span>
                    <span className="font-mono font-semibold text-slate-900">{formatMoney(simSpecial)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Performance Bonus (10%)</span>
                    <span className="font-mono font-semibold text-slate-900">{formatMoney(simBonus)}</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Monthly Deductions Computed */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <span className="text-amber-700 uppercase tracking-wider text-[11px]">Monthly Deductions</span>
                  <span className="font-mono text-amber-700">-{formatMoney(simTotalDeductions)}</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span>Provident Fund (12% Basic)</span>
                    <span className="font-mono text-amber-700 font-medium">-{formatMoney(simPf)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Professional Tax (PT)</span>
                    <span className="font-mono text-amber-700 font-medium">-${simPt}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>TDS Income Tax (Est 14%)</span>
                    <span className="font-mono text-amber-700 font-medium">-{formatMoney(simTds)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Health Benefit Contribution</span>
                    <span className="font-mono text-amber-700 font-medium">-${simHealth}</span>
                  </div>
                </div>
              </div>

              {/* Box 3: Net In-Hand Summary Card */}
              <div className="p-5 bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-white border border-emerald-300 rounded-xl flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider block">
                    Estimated Monthly In-Hand
                  </span>
                  <div className="text-3xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
                    {formatMoney(simNetTakeHome)}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block font-mono">
                    Annual In-Hand: {formatMoney(simAnnualNet)} / year
                  </span>
                </div>

                <div className="p-2.5 bg-white border border-emerald-200 rounded-lg text-[11px] text-emerald-900 font-medium">
                  Tax Effective Ratio: ~{Math.round((simNetTakeHome / simMonthlyGross) * 100)}% of Gross CTC realized in-hand.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Processed Batches & Disbursement History */}
      {activeTab === 'batches' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Historical Disbursed Payroll Runs</h2>
              <p className="text-xs text-slate-500">Audit trail of bank clearing batches and authorization records</p>
            </div>
            <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {payrollRuns.length} Batches Processed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Batch ID</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Payment Date</th>
                  <th className="py-3 px-4">Gross Total</th>
                  <th className="py-3 px-4">Total Deductions</th>
                  <th className="py-3 px-4">Net Disbursed</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Authorized By</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrollRuns.map(run => (
                  <tr key={run.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-700">
                      {run.id}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {run.period}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {run.payDate}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 tabular-nums">
                      ${run.totalGrossPay.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-amber-700 tabular-nums font-semibold">
                      -${run.totalDeductions.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 tabular-nums">
                      ${run.totalNetPay.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                        {run.disbursementMethod || 'Direct ACH'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {run.processedBy || currentUser.name}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {run.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3-Step Interactive "Run Payroll" Execution Wizard Modal */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative space-y-5 animate-in fade-in max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setWizardOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Wizard Header & Progress */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Payroll Settlement Wizard: {selectedPeriod}
                </h3>
                <p className="text-xs text-slate-500">
                  Step {wizardStep} of 3 · Automated reconciliation for {employees.length} active employees
                </p>
              </div>

              {/* Progress Steps Pills */}
              <div className="flex items-center gap-2">
                {[
                  { step: 1, label: 'Lock Attendance' },
                  { step: 2, label: 'Gross-to-Net' },
                  { step: 3, label: 'Confirm & Disburse' }
                ].map(({ step, label }) => (
                  <div
                    key={step}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      wizardStep === step
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : wizardStep > step
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <span>{wizardStep > step ? '✓' : step}</span>
                    <span className="hidden md:inline">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 1: Lock Attendance & Leave */}
            {wizardStep === 1 && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-blue-900">
                    <Info className="w-4 h-4 text-blue-600" />
                    Attendance & Timesheet Reconciliation Summary
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Verify that all shift punches, biometric geotags, approved leaves, and pending regularization requests for the period <strong>{payPeriodRange}</strong> have been finalized before calculating statutory deductions.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-lg font-bold font-mono text-slate-900">{employees.length}</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">Active Workforce</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-lg font-bold font-mono text-emerald-700">96.4%</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">Attendance Logged</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-lg font-bold font-mono text-blue-700">6 Days</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">Approved Leaves</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-lg font-bold font-mono text-rose-700">1 Day</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">Loss of Pay (LOP)</div>
                  </div>
                </div>

                {/* Flagged Anomaly Resolution */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Reconciliation Adjustments</span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      2 Anomalies Resolved
                    </span>
                  </div>

                  <div className="divide-y divide-slate-200/60 text-slate-700 space-y-1 text-[11px]">
                    <div className="py-1.5 flex items-center justify-between">
                      <span>Liam Gallagher (Sales) · 3 Days Annual Leave Approved</span>
                      <span className="text-emerald-700 font-semibold font-mono">Paid Leave (0 LOP)</span>
                    </div>
                    <div className="py-1.5 flex items-center justify-between">
                      <span>David Kim (HR) · 1 Day Unexcused Absence</span>
                      <span className="text-rose-700 font-semibold font-mono">1 Day LOP (-$347.22)</span>
                    </div>
                  </div>
                </div>

                {/* Confirmation Checkbox */}
                <label className="flex items-center gap-2.5 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors shadow-2xs">
                  <input
                    type="checkbox"
                    checked={attendanceConfirmed}
                    onChange={e => setAttendanceConfirmed(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-900">
                    I confirm timesheets, approved leaves, and attendance records are locked for this pay period.
                  </span>
                </label>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setWizardStep(2)}
                    disabled={!attendanceConfirmed}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    Next: Compute Gross-to-Net
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Calculate Gross-to-Net (50-20-20-10) */}
            {wizardStep === 2 && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">Computed Gross-to-Net Register Preview</h4>
                    <p className="text-[11px] text-slate-500">50% Basic · 20% HRA · 20% Special · 10% Variable · 12% PF Withholding</p>
                  </div>

                  {/* Bonus Pool Adjustment Slider */}
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <span className="text-[11px] font-medium text-slate-600">Bonus Pool:</span>
                    <input
                      type="range"
                      min={0}
                      max={15}
                      step={5}
                      value={bonusPoolPct}
                      onChange={e => setBonusPoolPct(Number(e.target.value))}
                      className="w-20 accent-blue-600 cursor-pointer"
                    />
                    <span className="font-mono font-bold text-blue-700">+{bonusPoolPct}%</span>
                  </div>
                </div>

                {/* Table of Employee Breakdowns */}
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] font-bold uppercase sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">Employee</th>
                        <th className="py-2.5 px-3">Basic (50%)</th>
                        <th className="py-2.5 px-3">HRA+Spec</th>
                        <th className="py-2.5 px-3">PF (12%)</th>
                        <th className="py-2.5 px-3">TDS / Tax</th>
                        <th className="py-2.5 px-3 text-right">Net In-Hand</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {employees.map(emp => {
                        const monthlyGross = Math.round(emp.salary / 12);
                        const basic = Math.round(monthlyGross * 0.50);
                        const hraSpec = Math.round(monthlyGross * 0.40);
                        const bonus = Math.round(monthlyGross * (0.10 + bonusPoolPct / 100));
                        const grossWithBonus = basic + hraSpec + bonus;
                        const pf = Math.round(basic * 0.12);
                        const pt = 200;
                        const tds = Math.round(grossWithBonus * 0.15);
                        const health = 350;
                        const lopDeduction = emp.status === 'notice' ? Math.round(monthlyGross / 30) : 0;
                        const net = grossWithBonus - (pf + pt + tds + health + lopDeduction);

                        return (
                          <tr key={emp.id} className="hover:bg-slate-50/70">
                            <td className="py-2 px-3">
                              <span className="font-semibold text-slate-900">{emp.firstName} {emp.lastName}</span>
                              <span className="block text-[10px] text-slate-500">{emp.role}</span>
                            </td>
                            <td className="py-2 px-3 font-mono font-medium text-slate-800">{formatMoney(basic)}</td>
                            <td className="py-2 px-3 font-mono text-slate-700">{formatMoney(hraSpec)}</td>
                            <td className="py-2 px-3 font-mono text-amber-700">-{formatMoney(pf)}</td>
                            <td className="py-2 px-3 font-mono text-amber-700">-{formatMoney(tds + pt)}</td>
                            <td className="py-2 px-3 font-mono font-bold text-emerald-700 text-right">{formatMoney(net)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal Summary Strip */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Total Gross Pool</span>
                    <span className="font-bold font-mono text-slate-900 text-sm">{formatMoney(totalGrossEstimated)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Total Deductions</span>
                    <span className="font-bold font-mono text-amber-700 text-sm">-{formatMoney(totalStatutoryDeductions)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Total Net Disbursable</span>
                    <span className="font-bold font-mono text-emerald-700 text-sm">{formatMoney(totalNetEstimated)}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setWizardStep(3)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    Next: Confirm & Lock Run
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Confirmation & Lock */}
            {wizardStep === 3 && (
              <div className="space-y-4 text-xs">
                <div className="p-5 bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-white border border-emerald-300 rounded-xl text-center space-y-2">
                  <ShieldCheck className="w-9 h-9 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Ready for Bank ACH Transmission & Payslip Issuance
                  </h4>
                  <div className="text-3xl font-bold font-mono text-emerald-700 tabular-nums">
                    {formatMoney(totalNetEstimated)}
                  </div>
                  <p className="text-slate-600 text-[11px] max-w-md mx-auto">
                    Settling this run will mark <strong>{selectedPeriod}</strong> as processed, disburse funds to {employees.length} employee accounts, and generate itemized PDF payslips.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Payment Transmission Channel</label>
                    <select
                      value={disbursementMethod}
                      onChange={e => setDisbursementMethod(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                    >
                      <option value="Direct ACH">Direct ACH Batch Clearing</option>
                      <option value="Wire Transfer">Corporate Wire / NEFT Transfer</option>
                      <option value="Manual">Manual Bank Check Issuance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Value Settlement Date</label>
                    <input
                      type="date"
                      value={payDisbursalDate}
                      readOnly
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-mono shadow-2xs"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px] text-slate-700">
                  <div className="flex justify-between font-semibold">
                    <span>Authorized By:</span>
                    <span className="text-slate-900">{currentUser.name} ({currentUser.role})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tenant Entity:</span>
                    <span className="font-mono text-slate-900">{currentTenant.name} ({currentTenant.slug})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Statutory Tax Escrow Deposit:</span>
                    <span className="font-mono text-amber-700 font-bold">{formatMoney(totalStatutoryDeductions)}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleFinishWizard}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    Authorize & Disburse Payroll
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Professional & Printable Payslip Drawer / Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative space-y-5 animate-in fade-in max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPayslip(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Payslip Document Container */}
            <div id="printable-payslip" className="border border-slate-200 rounded-xl bg-white p-5 sm:p-6 space-y-5 shadow-xs">
              
              {/* Top Header: Company Info + Payslip Title */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {currentTenant.logoInitials}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                      {currentTenant.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {currentTenant.headquarters} · Domain: {currentTenant.domain}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      EIN / Tax Reg: US-EIN-{currentTenant.slug.toUpperCase()}-8921
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right bg-blue-50/70 border border-blue-200/80 p-2 sm:p-2.5 rounded-lg">
                  <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
                    CONFIDENTIAL SALARY PAYSLIP
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900 block">
                    {selectedPayslip.period}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Ref: {selectedPayslip.id}
                  </span>
                </div>
              </div>

              {/* Employee & Pay Details Grid (2 cols x 3 rows) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block font-medium">Employee Name</span>
                  <span className="text-slate-900 font-bold">{selectedPayslip.employeeName}</span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block font-medium">Designation & Dept</span>
                  <span className="text-slate-800 font-medium">{selectedPayslip.role} ({selectedPayslip.department})</span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block font-medium">Employee ID</span>
                  <span className="text-blue-700 font-mono font-bold">{selectedPayslip.employeeId}</span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block font-medium">Disbursal Bank A/C</span>
                  <span className="text-slate-800 font-mono font-medium">{selectedPayslip.bankAccountMasked}</span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block font-medium">PAN / Tax ID</span>
                  <span className="text-slate-800 font-mono">{selectedPayslip.taxIdMasked || 'XXX-XX-8912'}</span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block font-medium">Worked Days / LOP</span>
                  <span className="text-slate-900 font-mono font-bold">
                    {selectedPayslip.workedDays || 30} Days ({selectedPayslip.lopDays || 0} LOP)
                  </span>
                </div>
              </div>

              {/* Side-by-Side Earnings vs Deductions Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Left: Earnings Column */}
                <div className="border border-emerald-200 rounded-xl overflow-hidden">
                  <div className="bg-emerald-50 px-3 py-2 border-b border-emerald-200 flex justify-between font-bold text-emerald-900 text-xs">
                    <span>Earnings Component</span>
                    <span>Amount ($)</span>
                  </div>
                  <div className="p-3 space-y-2 divide-y divide-slate-100">
                    <div className="flex justify-between pt-1 text-slate-700">
                      <span>Basic Pay (50%)</span>
                      <span className="font-mono font-semibold text-slate-900">${Math.round(selectedPayslip.basicSalary).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 text-slate-700">
                      <span>House Rent Allowance (HRA 20%)</span>
                      <span className="font-mono font-semibold text-slate-900">${Math.round(selectedPayslip.housingAllowance).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 text-slate-700">
                      <span>Special Allowance (20%)</span>
                      <span className="font-mono font-semibold text-slate-900">${Math.round(selectedPayslip.specialAllowance || selectedPayslip.transportAllowance).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 text-slate-700">
                      <span>Performance Bonus (10%)</span>
                      <span className="font-mono font-semibold text-slate-900">${Math.round(selectedPayslip.performanceBonus || (selectedPayslip.basicSalary * 0.2)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-900">
                      <span>Total Gross Earnings</span>
                      <span className="font-mono text-emerald-700">${Math.round(selectedPayslip.grossPay).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Deductions Column */}
                <div className="border border-amber-200 rounded-xl overflow-hidden">
                  <div className="bg-amber-50 px-3 py-2 border-b border-amber-200 flex justify-between font-bold text-amber-900 text-xs">
                    <span>Statutory Deductions</span>
                    <span>Amount ($)</span>
                  </div>
                  <div className="p-3 space-y-2 divide-y divide-slate-100">
                    <div className="flex justify-between pt-1 text-slate-700">
                      <span>Provident Fund (PF 12%)</span>
                      <span className="font-mono text-amber-700">-${Math.round(selectedPayslip.providentFund || selectedPayslip.socialSecurity).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 text-slate-700">
                      <span>Tax Deducted at Source (TDS)</span>
                      <span className="font-mono text-amber-700">-${Math.round(selectedPayslip.taxDeduction).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 text-slate-700">
                      <span>Professional Tax (PT)</span>
                      <span className="font-mono text-amber-700">-${selectedPayslip.professionalTax || 200}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 text-slate-700">
                      <span>Health Benefits & Insurance</span>
                      <span className="font-mono text-amber-700">-${selectedPayslip.healthInsurance || 350}</span>
                    </div>
                    {selectedPayslip.lossOfPayDeduction ? (
                      <div className="flex justify-between pt-1.5 text-slate-700">
                        <span>Loss of Pay (1 Day LOP)</span>
                        <span className="font-mono text-rose-700">-${selectedPayslip.lossOfPayDeduction}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-900">
                      <span>Total Deductions</span>
                      <span className="font-mono text-amber-700">-${Math.round(selectedPayslip.totalDeductions).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Highlighted Net Take-Home Pay Card */}
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider block">
                    Net Take-Home Pay (Disbursed via Direct ACH)
                  </span>
                  <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums block mt-0.5">
                    ${Math.round(selectedPayslip.netPay).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-600 italic block mt-0.5">
                    Amount in Words: {numberToWords(selectedPayslip.netPay)}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-md border border-emerald-300 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    PAID · SETTLED
                  </span>
                </div>
              </div>

              {/* Footer Audit Hash */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Verification Hash: TX-{selectedPayslip.id}-SECURE-ACH</span>
                <span>System Generated · Compliant with Statutory Labor Standards</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
              <button
                onClick={() => {
                  showToast('Email Sent', `Payslip for ${selectedPayslip.period} emailed to ${selectedPayslip.employeeName}.`, 'success');
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 font-semibold transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                Email to Employee
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 font-semibold transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>

                <button
                  onClick={() => {
                    showToast('Downloaded PDF', `Payslip ${selectedPayslip.id}.pdf saved to your device.`, 'success');
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 font-bold shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
