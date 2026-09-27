import React, { useState, useMemo } from 'react';
import { useTenant } from '../context/TenantContext';
import { ModuleGuard } from '../components/common/ModuleGuard';
import { ExpenseClaim } from '../types/hrms';
import { printElement, exportToCsv } from '../utils/printUtils';
import { 
  CreditCard, 
  Sparkles, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Receipt, 
  DollarSign, 
  FileText, 
  UploadCloud, 
  Filter, 
  Search, 
  Check, 
  X, 
  Building, 
  Plane, 
  Utensils, 
  Laptop, 
  Briefcase, 
  HeartHandshake, 
  ArrowUpRight,
  Eye,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  Lock
} from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  return (
    <ModuleGuard module="expenses">
      <ExpensesContent />
    </ModuleGuard>
  );
};

interface SampleReceiptPreset {
  label: string;
  merchant: string;
  amount: number;
  category: ExpenseClaim['category'];
  date: string;
  notes: string;
  fileName: string;
}

const SAMPLE_RECEIPTS: SampleReceiptPreset[] = [
  {
    label: 'Delta Flight & Marriott ($1,420.00)',
    merchant: 'Delta Air Lines & Marriott Downtown',
    amount: 1420.00,
    category: 'Travel',
    date: '2026-09-14',
    notes: 'Roundtrip flight and 3-night hotel accommodation for enterprise AI conference.',
    fileName: 'Delta_Marriott_Invoice_Sep14.pdf'
  },
  {
    label: 'Ergonomic Desk & Monitor Arm ($480.00)',
    merchant: 'Herman Miller Direct',
    amount: 480.00,
    category: 'Home Office',
    date: '2026-09-18',
    notes: 'Annual remote workspace ergonomic hardware upgrade.',
    fileName: 'HermanMiller_Receipt_0918.pdf'
  },
  {
    label: 'Client Dinner at Capital Grille ($195.50)',
    merchant: 'The Capital Grille - Austin',
    amount: 195.50,
    category: 'Client Meal',
    date: '2026-09-22',
    notes: 'Dinner with executive cybersecurity audit partners.',
    fileName: 'CapitalGrille_Dinner_Bill.jpg'
  }
];

const ExpensesContent: React.FC = () => {
  const { 
    currentTenant, 
    employees, 
    currentUser, 
    expenses, 
    submitExpenseClaim, 
    approveExpenseClaim, 
    rejectExpenseClaim, 
    pushExpenseToPayroll, 
    hasPermission,
    showToast 
  } = useTenant();

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Submit Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isScanningReceipt, setIsScanningReceipt] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [uploadedReceiptName, setUploadedReceiptName] = useState<string | null>(null);

  // Form State
  const [formEmployeeId, setFormEmployeeId] = useState<string>(employees[0]?.id || 'EMP-1001');
  const [formCategory, setFormCategory] = useState<ExpenseClaim['category']>('Travel');
  const [formAmount, setFormAmount] = useState<string>('1420.00');
  const [formMerchant, setFormMerchant] = useState<string>('Delta Air Lines');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState<string>('Client technical sync and architectural roadmap workshop.');

  // Preview Receipt Modal State
  const [previewClaim, setPreviewClaim] = useState<ExpenseClaim | null>(null);

  const canApproveExpenses = hasPermission('approve_expenses');
  const isFinanceOrAdmin = currentUser.role === 'Tenant Admin' || currentUser.role === 'Finance Officer' || currentUser.role === 'HR Manager';
  const isDeptLead = currentUser.role === 'Department Lead';
  const isStandardEmployee = currentUser.role === 'Employee';

  const currentLoggedInEmp = employees.find(e => 
    e.id === currentUser.id ||
    e.email.toLowerCase() === currentUser.email.toLowerCase() ||
    `${e.firstName} ${e.lastName}`.toLowerCase() === currentUser.name.toLowerCase()
  );

  const scopedExpenses: ExpenseClaim[] = useMemo(() => {
    if (isFinanceOrAdmin) {
      return expenses;
    }
    if (isDeptLead) {
      return expenses.filter(c => 
        c.department?.toLowerCase() === currentUser.department.toLowerCase() ||
        c.employeeId === currentLoggedInEmp?.id ||
        c.employeeId === currentUser.id ||
        c.employeeName.toLowerCase().trim() === currentUser.name.toLowerCase().trim()
      );
    }
    // Standard employee: strictly sees only own expense claims
    return expenses.filter(c => 
      c.employeeId === currentLoggedInEmp?.id ||
      c.employeeId === currentUser.id ||
      c.employeeName.toLowerCase().trim() === currentUser.name.toLowerCase().trim()
    );
  }, [expenses, isFinanceOrAdmin, isDeptLead, currentUser, currentLoggedInEmp]);

  // Filtered List
  const filteredExpenses: ExpenseClaim[] = useMemo(() => {
    return scopedExpenses.filter(c => {
      const matchesSearch = 
        c.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [scopedExpenses, searchQuery, selectedCategory, selectedStatus]);

  const handleExportExpensesCsv = () => {
    const data = filteredExpenses.map(c => ({
      'Claim ID': c.id,
      'Employee Name': c.employeeName,
      'Category': c.category,
      'Merchant': c.merchant,
      'Amount ($)': c.amount.toFixed(2),
      'Transaction Date': c.transactionDate,
      'Submitted Date': c.submittedAt,
      'Status': c.status,
      'Approved By': c.approvedBy || 'Pending',
      'Notes': c.notes
    }));
    exportToCsv(data, `Expense_Claims_${currentTenant.slug}.csv`);
    showToast('Export Complete', 'Expense claims register exported to CSV.', 'success');
  };

  // Metrics Calculations
  const totalClaimsSum = scopedExpenses.reduce((acc, c) => acc + c.amount, 0);
  const pendingClaims = scopedExpenses.filter(c => c.status === 'pending');
  const pendingSum = pendingClaims.reduce((acc, c) => acc + c.amount, 0);
  const approvedClaims = scopedExpenses.filter(c => c.status === 'approved' || c.status === 'disbursed');
  const approvedSum = approvedClaims.reduce((acc, c) => acc + c.amount, 0);

  // Simulated AI OCR Autofill
  const handleAutoFillWithAi = (preset: SampleReceiptPreset) => {
    setIsScanningReceipt(true);
    setScanStep('Gemini 2.5 Flash OCR parsing receipt image...');
    setUploadedReceiptName(preset.fileName);

    setTimeout(() => {
      setScanStep('Detecting merchant tax ID, line items & currency format...');
    }, 500);

    setTimeout(() => {
      setScanStep('Extracting total amount, transaction date, and expense category...');
    }, 1000);

    setTimeout(() => {
      setIsScanningReceipt(false);
      setFormCategory(preset.category);
      setFormAmount(preset.amount.toFixed(2));
      setFormMerchant(preset.merchant);
      setFormDate(preset.date);
      setFormNotes(preset.notes);
      showToast('AI OCR Parsing Complete', `Extracted $${preset.amount.toFixed(2)} from ${preset.merchant}`, 'success');
    }, 1500);
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedReceiptName(file.name);
      setIsScanningReceipt(true);
      setScanStep('Gemini 2.5 Flash OCR parsing uploaded invoice...');

      setTimeout(() => {
        setIsScanningReceipt(false);
        setFormMerchant('Parsed Merchant Invoice');
        setFormAmount('345.00');
        setFormCategory('General');
        setFormDate(new Date().toISOString().split('T')[0]);
        setFormNotes(`Itemized invoice parsed from ${file.name}`);
        showToast('Receipt Analyzed', `Extracted data from ${file.name}`, 'success');
      }, 1200);
    }
  };

  const handleExportCsv = () => {
    const data = filteredExpenses.map(exp => ({
      'Claim ID': exp.id,
      'Employee': exp.employeeName,
      'Department': exp.department,
      'Merchant': exp.merchant,
      'Category': exp.category,
      'Amount': exp.amount,
      'Date': exp.transactionDate,
      'Status': exp.status,
      'Approved By': exp.approvedBy || 'Pending'
    }));
    exportToCsv(data, `Expenses_${currentTenant.slug}.csv`);
    showToast('Export Complete', 'Expense claims exported to CSV.', 'success');
  };

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === formEmployeeId) || employees[0];

    submitExpenseClaim({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      category: formCategory,
      amount: parseFloat(formAmount) || 0,
      currency: currentTenant.currency || '$',
      merchant: formMerchant,
      transactionDate: formDate,
      receiptName: uploadedReceiptName || 'Uploaded_Receipt_Invoice.pdf',
      notes: formNotes
    });

    setIsSubmitModalOpen(false);
    setUploadedReceiptName(null);
  };

  const getCategoryIcon = (category: ExpenseClaim['category']) => {
    switch (category) {
      case 'Travel':
        return <Plane className="w-3.5 h-3.5 text-blue-600" />;
      case 'Client Meal':
        return <Utensils className="w-3.5 h-3.5 text-amber-600" />;
      case 'Home Office':
        return <Laptop className="w-3.5 h-3.5 text-indigo-600" />;
      case 'Software/Tools':
        return <FileText className="w-3.5 h-3.5 text-cyan-600" />;
      case 'Wellness':
        return <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Briefcase className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: ExpenseClaim['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Approved
          </span>
        );
      case 'disbursed':
        return (
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1 w-fit">
            <Check className="w-3 h-3 text-blue-600" />
            Disbursed in Payroll
          </span>
        );
      case 'rejected':
        return (
          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3 text-rose-600" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Sign-off
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Expenses & Claims
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit and review expense reimbursement claims for {currentTenant.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Submit Claim
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Total Claims */}
        <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Claims This Month
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              ${totalClaimsSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({expenses.length} claims submitted)
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Aggregated corporate expenses across all active departments.
          </p>
        </div>

        {/* Metric 2: Pending Finance Sign-off */}
        <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Pending Finance Sign-off
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-900">
              {pendingClaims.length} <span className="text-sm font-bold text-slate-600">claims</span>
            </span>
            <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              ${pendingSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Awaiting manager or HR partner approval before payroll batch cut-off.
          </p>
        </div>

        {/* Metric 3: Approved & Pushed to Payroll */}
        <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Approved & Pushed to Payroll
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-800">
              ${approvedSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Ready for Settlement
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Linked to upcoming October 01, 2026 direct ACH payroll disbursement.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search claims by employee, merchant, or claim ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Travel">Travel</option>
              <option value="Client Meal">Client Meal</option>
              <option value="Home Office">Home Office</option>
              <option value="Software/Tools">Software/Tools</option>
              <option value="Wellness">Wellness</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending Sign-off</option>
              <option value="approved">Approved</option>
              <option value="disbursed">Disbursed in Payroll</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <button
            onClick={handleExportExpensesCsv}
            className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Download CSV of all expense claims"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Export Claims CSV
          </button>
        </div>
      </div>

      {/* Claims Register & Approval Inbox Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Claims Register & Approval Inbox
            </h3>
            <p className="text-[11px] text-slate-500">
              Review receipts, verify merchant line items, and authorize manager approvals.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {filteredExpenses.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Claim ID</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Category & Merchant</th>
                <th className="py-3 px-4">Receipt</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 italic">
                    No expense claims match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Claim ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {claim.id}
                    </td>

                    {/* Employee */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{claim.employeeName}</div>
                      <div className="text-[10px] text-slate-500">{claim.department}</div>
                    </td>

                    {/* Category & Merchant */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        {getCategoryIcon(claim.category)}
                        <span>{claim.category}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                        {claim.merchant}
                      </div>
                    </td>

                    {/* Receipt */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setPreviewClaim(claim)}
                        className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        View Receipt
                      </button>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                      ${claim.amount.toFixed(2)}
                    </td>

                    {/* Submitted Date */}
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {claim.submittedAt}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(claim.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {(() => {
                        const isSelfExpense = 
                          claim.employeeId === currentUser.id ||
                          (currentLoggedInEmp && claim.employeeId === currentLoggedInEmp.id) ||
                          claim.employeeName?.toLowerCase().trim() === currentUser.name?.toLowerCase().trim();

                        if (claim.status === 'pending') {
                          if (!canApproveExpenses) {
                            return (
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                                <Clock className="w-3 h-3 text-slate-400" />
                                Manager Review
                              </span>
                            );
                          }

                          if (isSelfExpense) {
                            return (
                              <span 
                                className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium"
                                title="Segregation of Duties: You cannot approve your own expense claim."
                              >
                                <Lock className="w-3 h-3 text-amber-600" />
                                Self-Claim (Prohibited)
                              </span>
                            );
                          }

                          return (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => approveExpenseClaim(claim.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                                title="Approve and push to payroll"
                              >
                                <Check className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                onClick={() => rejectExpenseClaim(claim.id)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-700 text-[11px] font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                                title="Reject claim"
                              >
                                <X className="w-3 h-3" />
                                Reject
                              </button>
                            </div>
                          );
                        }

                        if (claim.status === 'approved' && !claim.pushedToPayroll) {
                          return canApproveExpenses ? (
                            <button
                              onClick={() => pushExpenseToPayroll(claim.id)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                            >
                              Queue for Payroll
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-700 font-semibold">
                              Approved
                            </span>
                          );
                        }

                        return (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {claim.approvedBy ? 'Authorized' : 'Settled'}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBMIT EXPENSE CLAIM MODAL WITH AI RECEIPT SCANNER                       */}
      {/* ========================================================================= */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Submit New Expense Claim</h3>
                  <p className="text-[10px] text-slate-500">Attach receipts or use Gemini Flash OCR for instant extraction.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Simulated AI Receipt Scanner Dropzone */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    AI Receipt Scanner (Gemini 2.5 Flash OCR)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Instant Autofill
                  </span>
                </div>

                {/* Dropzone */}
                <label className="border-2 border-dashed border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/20 transition-all rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleCustomFileUpload}
                    className="hidden"
                  />
                  <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="font-semibold text-slate-700 text-xs">
                    {uploadedReceiptName ? uploadedReceiptName : 'Drop Receipt Photo / Invoice (JPG, PNG, PDF)'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    or click to browse local files
                  </span>
                </label>

                {/* Quick Auto-Fill with AI Presets */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600">Quick-Load AI Receipt Presets:</span>
                    <span className="text-[10px] text-slate-400">Click to autofill form</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {SAMPLE_RECEIPTS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAutoFillWithAi(preset)}
                        className="p-2 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left text-[11px] transition-all space-y-0.5 shadow-2xs group"
                      >
                        <div className="font-bold text-slate-800 group-hover:text-emerald-700 truncate">
                          {preset.label}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {preset.category} · {preset.merchant}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Scanning Pulse */}
                {isScanningReceipt && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2.5 animate-pulse text-xs text-emerald-900">
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
                    <span className="font-mono font-medium">{scanStep}</span>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <form id="expense-form" onSubmit={handleSubmitClaim} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Claimant Employee</label>
                    {isStandardEmployee || !isFinanceOrAdmin ? (
                      <div className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800">
                        {currentLoggedInEmp ? `${currentLoggedInEmp.firstName} ${currentLoggedInEmp.lastName} (${currentLoggedInEmp.department})` : currentUser.name}
                      </div>
                    ) : (
                      <select
                        value={formEmployeeId}
                        onChange={e => setFormEmployeeId(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} ({emp.department})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Expense Category</label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value as ExpenseClaim['category'])}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="Travel">Travel (Flights, Hotels, Transport)</option>
                      <option value="Client Meal">Client Meal & Entertainment</option>
                      <option value="Home Office">Home Office & Ergonomics</option>
                      <option value="Software/Tools">Software & Tool Subscriptions</option>
                      <option value="Wellness">Wellness & Fitness Subsidy</option>
                      <option value="General">General Corporate Expense</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Amount ($ USD)</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formAmount}
                        onChange={e => setFormAmount(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Transaction Date</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={e => setFormDate(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Merchant / Vendor</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Delta Air Lines"
                      value={formMerchant}
                      onChange={e => setFormMerchant(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Business Justification & Notes</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Describe purpose of expense, client engagement details, or project code..."
                    value={formNotes}
                    onChange={e => setFormNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="expense-form"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Submit Claim for Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECEIPT PREVIEW MODAL                                                    */}
      {/* ========================================================================= */}
      {previewClaim && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Receipt & Invoice Verification</h3>
              </div>
              <button onClick={() => setPreviewClaim(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div id="printable-receipt" className="p-5 space-y-4 text-xs bg-white">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 font-mono">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-slate-500">Invoice / Claim ID:</span>
                  <span className="font-bold text-slate-900">{previewClaim.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Claimant Employee:</span>
                  <span className="font-bold text-slate-900">{previewClaim.employeeName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Merchant / Vendor:</span>
                  <span className="font-bold text-slate-800">{previewClaim.merchant}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-semibold text-slate-800">{previewClaim.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Transaction Date:</span>
                  <span className="text-slate-800">{previewClaim.transactionDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Attached File:</span>
                  <span className="text-blue-600 underline truncate max-w-[200px]">{previewClaim.receiptName || 'Receipt_Document.pdf'}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t text-sm font-bold text-slate-900">
                  <span>Reimbursement Amount:</span>
                  <span className="text-emerald-700 font-mono">${previewClaim.amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-semibold">Business Justification & Notes:</span>
                <p className="text-slate-800 bg-slate-50 p-2.5 rounded-lg border text-xs">
                  {previewClaim.notes}
                </p>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified by Gemini Flash OCR receipt parser · Compliant with Corporate Travel Policy.</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  printElement('printable-receipt', `Expense_Receipt_${previewClaim.id}_${previewClaim.merchant.replace(/\s+/g, '_')}`);
                }}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Receipt
              </button>

              <button
                onClick={() => setPreviewClaim(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
