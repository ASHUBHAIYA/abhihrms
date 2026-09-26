import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Tenant, 
  TenantModule, 
  TenantPlan, 
  Employee, 
  AttendanceRecord, 
  LeaveRequest, 
  PayrollRun, 
  Payslip, 
  JobRequisition, 
  Candidate,
  UserProfile,
  UserRole,
  ExpenseClaim,
  Asset,
  ExitClearance
} from '../types/hrms';
import { 
  INITIAL_TENANTS, 
  INITIAL_EMPLOYEES, 
  INITIAL_ATTENDANCE, 
  INITIAL_LEAVE_REQUESTS, 
  INITIAL_PAYROLL_RUNS, 
  INITIAL_PAYSLIPS, 
  INITIAL_JOBS, 
  INITIAL_CANDIDATES,
  INITIAL_USERS,
  INITIAL_EXPENSES,
  INITIAL_ASSETS,
  INITIAL_EXIT_CLEARANCES,
  MODULE_CATALOG
} from '../data/initialData';

interface ToastInfo {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface TenantContextType {
  tenants: Tenant[];
  currentTenant: Tenant;
  switchTenant: (tenantId: string) => void;
  isModuleSubscribed: (moduleId: TenantModule) => boolean;
  toggleModule: (tenantId: string, moduleId: TenantModule) => void;
  activateModuleTrial: (moduleId: TenantModule) => void;
  upgradePlan: (tenantId: string, plan: TenantPlan) => void;
  createTenant: (tenantData: Partial<Tenant>) => Tenant;
  updateTenantDetails: (tenantId: string, updates: Partial<Tenant>) => void;
  resetAllData: () => void;

  // Current User & RBAC Auth State
  currentUser: UserProfile;
  users: UserProfile[];
  switchUser: (role: UserRole) => void;
  switchUserRole: (role: UserRole) => void;
  setCurrentUser: (user: UserProfile) => void;
  
  // Active Tenant Scoped Entities
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id' | 'tenantId'>) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  attendanceRecords: AttendanceRecord[];
  logAttendanceClockIn: (employeeName: string, department: string) => void;
  logAttendanceClockOut: (recordId: string) => void;

  leaveRequests: LeaveRequest[];
  submitLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'tenantId' | 'appliedAt' | 'status'>) => void;
  updateLeaveStatus: (id: string, status: 'approved' | 'rejected', approver?: string) => void;

  payrollRuns: PayrollRun[];
  payslips: Payslip[];
  executePayrollRun: (
    period: string, 
    payDate: string, 
    options?: { 
      disbursementMethod?: 'Direct ACH' | 'Wire Transfer' | 'Manual'; 
      bonusPoolPct?: number; 
      payPeriodRange?: string;
    }
  ) => void;

  jobRequisitions: JobRequisition[];
  createJobRequisition: (job: Omit<JobRequisition, 'id' | 'tenantId' | 'applicantCount' | 'postedDate'>) => void;

  candidates: Candidate[];
  updateCandidateStage: (candidateId: string, newStage: Candidate['stage']) => void;
  addCandidate: (candidate: Omit<Candidate, 'id' | 'tenantId' | 'appliedDate'>) => void;

  // Expenses & Claims
  expenses: ExpenseClaim[];
  submitExpenseClaim: (claim: Omit<ExpenseClaim, 'id' | 'tenantId' | 'submittedAt' | 'status'>) => void;
  approveExpenseClaim: (claimId: string) => void;
  rejectExpenseClaim: (claimId: string) => void;
  pushExpenseToPayroll: (claimId: string) => void;

  // Asset Tracking
  assets: Asset[];
  assignAsset: (assetId: string, employeeId: string) => void;
  unassignAsset: (assetId: string) => void;
  createAsset: (assetData: Omit<Asset, 'id' | 'tenantId'>) => void;

  // Employee Lifecycle & Exit Clearance
  exitClearances: ExitClearance[];
  toggleClearanceItem: (clearanceId: string, key: 'itClearance' | 'adminClearance' | 'financeClearance' | 'hrExitInterview') => void;
  calculateFandF: (clearanceId: string) => void;
  settleFandF: (clearanceId: string) => void;

  // Navigation State
  activeRoute: string;
  navigateTo: (route: string) => void;

  // Toasts
  toasts: ToastInfo[];
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_TENANTS = 'nexushr_tenants_v3';
const LOCAL_STORAGE_KEY_CURRENT = 'nexushr_current_tenant_v3';
const LOCAL_STORAGE_KEY_USER = 'nexushr_current_user_v3';
const LOCAL_STORAGE_KEY_EMPLOYEES = 'nexushr_employees_v3';
const LOCAL_STORAGE_KEY_ATTENDANCE = 'nexushr_attendance_v3';
const LOCAL_STORAGE_KEY_LEAVE = 'nexushr_leave_v3';
const LOCAL_STORAGE_KEY_PAYROLL = 'nexushr_payroll_v3';
const LOCAL_STORAGE_KEY_PAYSLIPS = 'nexushr_payslips_v3';
const LOCAL_STORAGE_KEY_JOBS = 'nexushr_jobs_v3';
const LOCAL_STORAGE_KEY_CANDIDATES = 'nexushr_candidates_v3';
const LOCAL_STORAGE_KEY_EXPENSES = 'nexushr_expenses_v3';
const LOCAL_STORAGE_KEY_ASSETS = 'nexushr_assets_v3';
const LOCAL_STORAGE_KEY_EXITS = 'nexushr_exits_v3';

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load state from localStorage or initial
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TENANTS);
    return saved ? JSON.parse(saved) : INITIAL_TENANTS;
  });

  const [currentTenantId, setCurrentTenantId] = useState<string>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT);
    return saved || 'tenant-acme';
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  const [allEmployees, setAllEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_EMPLOYEES);
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ATTENDANCE);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [allLeave, setAllLeave] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_LEAVE);
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
  });

  const [allPayroll, setAllPayroll] = useState<PayrollRun[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PAYROLL);
    return saved ? JSON.parse(saved) : INITIAL_PAYROLL_RUNS;
  });

  const [allPayslips, setAllPayslips] = useState<Payslip[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PAYSLIPS);
    return saved ? JSON.parse(saved) : INITIAL_PAYSLIPS;
  });

  const [allJobs, setAllJobs] = useState<JobRequisition[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_JOBS);
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  const [allCandidates, setAllCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CANDIDATES);
    return saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
  });

  const [allExpenses, setAllExpenses] = useState<ExpenseClaim[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_EXPENSES);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [allAssets, setAllAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ASSETS);
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [allExits, setAllExits] = useState<ExitClearance[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_EXITS);
    return saved ? JSON.parse(saved) : INITIAL_EXIT_CLEARANCES;
  });

  const [activeRoute, setActiveRoute] = useState<string>('dashboard');
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_TENANTS, JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT, currentTenantId);
  }, [currentTenantId]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_EMPLOYEES, JSON.stringify(allEmployees));
  }, [allEmployees]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ATTENDANCE, JSON.stringify(allAttendance));
  }, [allAttendance]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_LEAVE, JSON.stringify(allLeave));
  }, [allLeave]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PAYROLL, JSON.stringify(allPayroll));
  }, [allPayroll]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PAYSLIPS, JSON.stringify(allPayslips));
  }, [allPayslips]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_JOBS, JSON.stringify(allJobs));
  }, [allJobs]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_CANDIDATES, JSON.stringify(allCandidates));
  }, [allCandidates]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSES, JSON.stringify(allExpenses));
  }, [allExpenses]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ASSETS, JSON.stringify(allAssets));
  }, [allAssets]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_EXITS, JSON.stringify(allExits));
  }, [allExits]);

  // Current active tenant object
  const currentTenant = useMemo(() => {
    const found = tenants.find(t => t.id === currentTenantId);
    return found || tenants[0] || INITIAL_TENANTS[0];
  }, [tenants, currentTenantId]);

  // Toast Helpers
  const showToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const switchTenant = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setCurrentTenantId(tenantId);
      showToast('Tenant Switched', `Active organization set to ${tenant.name}`, 'info');
    }
  };

  const switchUserRole = (role: UserRole) => {
    const user = INITIAL_USERS.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      showToast('Role Switched', `Now operating as ${user.name} (${role})`, 'info');
    }
  };

  const isModuleSubscribed = (moduleId: TenantModule): boolean => {
    return currentTenant.activeModules.includes(moduleId);
  };

  const toggleModule = (tenantId: string, moduleId: TenantModule) => {
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        const hasModule = t.activeModules.includes(moduleId);
        const newModules = hasModule 
          ? t.activeModules.filter(m => m !== moduleId)
          : [...t.activeModules, moduleId];
        
        // Recalculate monthly spend
        const basePlanSpend = t.plan === 'Enterprise' ? 1200 : t.plan === 'Growth' ? 400 : 150;
        const modulesSpend = newModules.reduce((acc, mod) => {
          const meta = MODULE_CATALOG[mod];
          return acc + (meta ? meta.pricePerUserMonthly * t.employeeCount : 0);
        }, 0);

        return {
          ...t,
          activeModules: newModules,
          monthlySpend: Math.round(basePlanSpend + modulesSpend)
        };
      }
      return t;
    }));

    const modName = MODULE_CATALOG[moduleId]?.name || moduleId;
    showToast('Module Entitlement Updated', `${modName} status toggled for tenant.`, 'info');
  };

  const activateModuleTrial = (moduleId: TenantModule) => {
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        if (!t.activeModules.includes(moduleId)) {
          return {
            ...t,
            activeModules: [...t.activeModules, moduleId]
          };
        }
      }
      return t;
    }));

    const modName = MODULE_CATALOG[moduleId]?.name || moduleId;
    showToast('14-Day Free Trial Activated', `You now have full access to ${modName}.`, 'success');
  };

  const upgradePlan = (tenantId: string, plan: TenantPlan) => {
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        let maxSeats = 25;
        let activeModules = t.activeModules;
        if (plan === 'Enterprise') {
          maxSeats = 150;
          activeModules = ['core_hr', 'attendance', 'leave', 'payroll', 'ats', 'ai_hub', 'expenses', 'lifecycle'];
        } else if (plan === 'Growth') {
          maxSeats = 50;
        }

        return {
          ...t,
          plan,
          maxSeats,
          activeModules
        };
      }
      return t;
    }));
    showToast('Plan Upgraded', `Tenant upgraded to ${plan} Tier.`, 'success');
  };

  const createTenant = (tenantData: Partial<Tenant>): Tenant => {
    const id = `tenant-${Date.now().toString(36)}`;
    const newTenant: Tenant = {
      id,
      slug: (tenantData.name || 'new-org').toLowerCase().replace(/\s+/g, '-'),
      name: tenantData.name || 'New Organization',
      plan: tenantData.plan || 'Growth',
      billingCycle: tenantData.billingCycle || 'monthly',
      activeModules: tenantData.activeModules || ['core_hr', 'attendance', 'leave'],
      employeeCount: 1,
      maxSeats: tenantData.plan === 'Enterprise' ? 100 : 25,
      currency: tenantData.currency || '$',
      headquarters: tenantData.headquarters || 'San Francisco, CA',
      domain: `${(tenantData.name || 'new-org').toLowerCase().replace(/\s+/g, '')}.nexus.io`,
      subscriptionStatus: 'active',
      monthlySpend: 420,
      themeColor: tenantData.themeColor || 'indigo',
      logoInitials: (tenantData.name || 'NO').substring(0, 2).toUpperCase(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTenants(prev => [...prev, newTenant]);
    setCurrentTenantId(id);
    showToast('Tenant Created', `Switched to newly provisioned tenant: ${newTenant.name}`, 'success');
    return newTenant;
  };

  const updateTenantDetails = (tenantId: string, updates: Partial<Tenant>) => {
    setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, ...updates } : t));
    showToast('Organization Settings Saved', 'Tenant metadata updated.', 'success');
  };

  const resetAllData = () => {
    localStorage.clear();
    setTenants(INITIAL_TENANTS);
    setCurrentTenantId('tenant-acme');
    setAllEmployees(INITIAL_EMPLOYEES);
    setAllAttendance(INITIAL_ATTENDANCE);
    setAllLeave(INITIAL_LEAVE_REQUESTS);
    setAllPayroll(INITIAL_PAYROLL_RUNS);
    setAllPayslips(INITIAL_PAYSLIPS);
    setAllJobs(INITIAL_JOBS);
    setAllCandidates(INITIAL_CANDIDATES);
    setAllExpenses(INITIAL_EXPENSES);
    setAllAssets(INITIAL_ASSETS);
    setAllExits(INITIAL_EXIT_CLEARANCES);
    showToast('System Reset', 'All data restored to pristine initial state.', 'warning');
  };

  // Scoped Employees
  const employees = useMemo(() => {
    return allEmployees.filter(e => e.tenantId === currentTenant.id);
  }, [allEmployees, currentTenant.id]);

  const addEmployee = (empData: Omit<Employee, 'id' | 'tenantId'>) => {
    const newEmp: Employee = {
      ...empData,
      id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId: currentTenant.id,
    };
    setAllEmployees(prev => [newEmp, ...prev]);
    // update tenant employee count
    setTenants(prev => prev.map(t => t.id === currentTenant.id ? { ...t, employeeCount: t.employeeCount + 1 } : t));
    showToast('Employee Enrolled', `${newEmp.firstName} ${newEmp.lastName} added to organization.`, 'success');
  };

  const updateEmployee = (id: string, empUpdates: Partial<Employee>) => {
    setAllEmployees(prev => prev.map(e => e.id === id ? { ...e, ...empUpdates } : e));
    showToast('Profile Updated', 'Employee record saved.', 'info');
  };

  const deleteEmployee = (id: string) => {
    setAllEmployees(prev => prev.filter(e => e.id !== id));
    setTenants(prev => prev.map(t => t.id === currentTenant.id ? { ...t, employeeCount: Math.max(1, t.employeeCount - 1) } : t));
    showToast('Employee Removed', 'Employee record archived from directory.', 'info');
  };

  // Attendance Records
  const attendanceRecords = useMemo(() => {
    return allAttendance.filter(a => a.tenantId === currentTenant.id);
  }, [allAttendance, currentTenant.id]);

  const logAttendanceClockIn = (employeeName: string, department: string) => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      tenantId: currentTenant.id,
      employeeId: currentUser.id,
      employeeName,
      department,
      date: today,
      clockInTime: nowTime,
      status: 'present',
      locationType: 'Office (HQ)'
    };

    setAllAttendance(prev => [newRecord, ...prev]);
    showToast('Clocked In Successfully', `Recorded check-in at ${nowTime} for ${employeeName}`, 'success');
  };

  const logAttendanceClockOut = (recordId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    setAllAttendance(prev => prev.map(r => {
      if (r.id === recordId) {
        return {
          ...r,
          clockOutTime: nowTime,
          totalHoursWorked: 8.5
        };
      }
      return r;
    }));
    showToast('Clocked Out Successfully', `Recorded check-out at ${nowTime}.`, 'info');
  };

  // Leave Requests
  const leaveRequests = useMemo(() => {
    return allLeave.filter(l => l.tenantId === currentTenant.id);
  }, [allLeave, currentTenant.id]);

  const submitLeaveRequest = (req: Omit<LeaveRequest, 'id' | 'tenantId' | 'appliedAt' | 'status'>) => {
    const newReq: LeaveRequest = {
      ...req,
      id: `LR-${Math.floor(100 + Math.random() * 900)}`,
      tenantId: currentTenant.id,
      appliedAt: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setAllLeave(prev => [newReq, ...prev]);
    showToast('Leave Request Submitted', `${newReq.daysCount} days requested for ${newReq.leaveType}`, 'success');
  };

  const updateLeaveStatus = (id: string, status: 'approved' | 'rejected', approver: string = currentUser.name) => {
    setAllLeave(prev => prev.map(l => {
      if (l.id === id) {
        return {
          ...l,
          status,
          reviewedBy: approver,
          reviewedAt: new Date().toISOString().split('T')[0]
        };
      }
      return l;
    }));
    showToast(`Leave Request ${status.toUpperCase()}`, `Processed by ${approver}`, status === 'approved' ? 'success' : 'warning');
  };

  // Payroll Runs & Payslips
  const payrollRuns = useMemo(() => {
    return allPayroll.filter(p => p.tenantId === currentTenant.id);
  }, [allPayroll, currentTenant.id]);

  const payslips = useMemo(() => {
    return allPayslips.filter(p => p.tenantId === currentTenant.id);
  }, [allPayslips, currentTenant.id]);

  const executePayrollRun = (
    period: string, 
    payDate: string, 
    options?: { 
      disbursementMethod?: 'Direct ACH' | 'Wire Transfer' | 'Manual'; 
      bonusPoolPct?: number; 
      payPeriodRange?: string;
    }
  ) => {
    const method = options?.disbursementMethod || 'Direct ACH';
    const bonusPct = options?.bonusPoolPct ?? 0;
    const periodRange = options?.payPeriodRange || `Aug 26, 2026 - Sep 25, 2026`;

    let totalGrossSum = 0;
    let totalDeductionsSum = 0;
    let totalNetSum = 0;

    const newSlips: Payslip[] = employees.map(emp => {
      const annual = emp.salary || 140000;
      const monthly = annual / 12;

      const basic = Math.round(monthly * 0.50);
      const hra = Math.round(monthly * 0.20);
      const special = Math.round(monthly * 0.20);
      const bonus = Math.round((monthly * (bonusPct / 100)) + (monthly * 0.10));
      const gross = basic + hra + special + bonus;

      const pf = Math.round(basic * 0.12);
      const pt = 200;
      const tds = Math.round(gross * 0.10);
      const lop = 0;
      const deductions = pf + pt + tds + lop;
      const net = gross - deductions;

      totalGrossSum += gross;
      totalDeductionsSum += deductions;
      totalNetSum += net;

      return {
        id: `PS-${emp.id}-${period.replace(/\s+/g, '')}`,
        payrollRunId: '', // populated below
        tenantId: currentTenant.id,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        role: emp.role,
        department: emp.department,
        period,
        payDate,
        payPeriodRange: periodRange,
        annualCtc: annual,
        basicSalary: basic,
        housingAllowance: hra,
        transportAllowance: 0,
        specialAllowance: special,
        performanceBonus: bonus,
        grossPay: gross,
        providentFund: pf,
        professionalTax: pt,
        taxDeduction: tds,
        socialSecurity: Math.round(gross * 0.062),
        healthInsurance: 350,
        lossOfPayDeduction: lop,
        totalDeductions: deductions,
        netPay: net,
        paymentStatus: 'Paid',
        bankAccountMasked: emp.bankAccount || `•••• •••• ${Math.floor(1000 + Math.random() * 9000)}`,
        taxIdMasked: emp.panNumber || `ABCDE${Math.floor(1000 + Math.random() * 9000)}F`,
        routingMasked: `••••0812`,
        workedDays: 22,
        lopDays: 0
      };
    });

    const newRun: PayrollRun = {
      id: `PR-${Date.now().toString(36).toUpperCase()}`,
      tenantId: currentTenant.id,
      period,
      payDate,
      status: 'completed',
      totalGrossPay: Math.round(totalGrossSum),
      totalDeductions: Math.round(totalDeductionsSum),
      totalNetPay: Math.round(totalNetSum),
      employeeCount: employees.length,
      processedBy: currentUser.name,
      disbursementMethod: method
    };

    const linkedSlips = newSlips.map(s => ({ ...s, payrollRunId: newRun.id }));

    setAllPayroll(prev => [newRun, ...prev]);
    setAllPayslips(prev => [...linkedSlips, ...prev]);
    showToast(
      'Payroll Batch Disbursed Successfully',
      `Period ${period} settled for ${employees.length} employees ($${Math.round(totalNetSum).toLocaleString()} disbursed via ${method}).`,
      'success'
    );
  };

  const jobRequisitions = useMemo(() => {
    return allJobs.filter(j => j.tenantId === currentTenant.id);
  }, [allJobs, currentTenant.id]);

  const createJobRequisition = (jobData: Omit<JobRequisition, 'id' | 'tenantId' | 'applicantCount' | 'postedDate'>) => {
    const newJob: JobRequisition = {
      ...jobData,
      id: `JOB-${Math.floor(300 + Math.random() * 700)}`,
      tenantId: currentTenant.id,
      applicantCount: 0,
      postedDate: new Date().toISOString().split('T')[0]
    };
    setAllJobs(prev => [newJob, ...prev]);
    showToast('Job Requisition Published', `Requisition "${newJob.title}" is live on the careers portal.`, 'success');
  };

  const candidates = useMemo(() => {
    return allCandidates.filter(c => c.tenantId === currentTenant.id);
  }, [allCandidates, currentTenant.id]);

  const updateCandidateStage = (candidateId: string, newStage: Candidate['stage']) => {
    setAllCandidates(prev => prev.map(c => {
      if (c.id === candidateId) {
        return { ...c, stage: newStage };
      }
      return c;
    }));
    showToast('Candidate Pipeline Updated', `Moved candidate to stage: ${newStage.toUpperCase()}`, 'info');
  };

  const addCandidate = (candData: Omit<Candidate, 'id' | 'tenantId' | 'appliedDate'>) => {
    const newCand: Candidate = {
      ...candData,
      id: `CAND-${Math.floor(700 + Math.random() * 300)}`,
      tenantId: currentTenant.id,
      appliedDate: new Date().toISOString().split('T')[0]
    };
    setAllCandidates(prev => [newCand, ...prev]);
    setAllJobs(prev => prev.map(j => j.id === newCand.jobId ? { ...j, applicantCount: j.applicantCount + 1 } : j));
    showToast('Candidate Added', `Candidate ${newCand.name} enrolled into pipeline.`, 'success');
  };

  // ==========================================
  // EXPENSES & CLAIMS METHODS
  // ==========================================
  const expenses = useMemo(() => {
    return allExpenses.filter(e => e.tenantId === currentTenant.id);
  }, [allExpenses, currentTenant.id]);

  const submitExpenseClaim = (claimData: Omit<ExpenseClaim, 'id' | 'tenantId' | 'submittedAt' | 'status'>) => {
    const newClaim: ExpenseClaim = {
      ...claimData,
      id: `EXP-${Math.floor(300 + Math.random() * 700)}`,
      tenantId: currentTenant.id,
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setAllExpenses(prev => [newClaim, ...prev]);
    showToast('Expense Claim Submitted', `Claim for $${newClaim.amount.toFixed(2)} (${newClaim.category}) submitted for manager sign-off.`, 'success');
  };

  const approveExpenseClaim = (claimId: string) => {
    setAllExpenses(prev => prev.map(c => {
      if (c.id === claimId) {
        return {
          ...c,
          status: 'approved',
          approvedBy: `${currentUser.name} (${currentUser.role})`,
          approvedAt: new Date().toISOString().split('T')[0],
          pushedToPayroll: true
        };
      }
      return c;
    }));
    showToast('Expense Approved', 'Claim approved and queued for next payroll disbursement batch.', 'success');
  };

  const rejectExpenseClaim = (claimId: string) => {
    setAllExpenses(prev => prev.map(c => {
      if (c.id === claimId) {
        return {
          ...c,
          status: 'rejected',
          approvedBy: `${currentUser.name} (${currentUser.role})`,
          approvedAt: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    }));
    showToast('Expense Rejected', 'Claim was rejected with feedback.', 'warning');
  };

  const pushExpenseToPayroll = (claimId: string) => {
    setAllExpenses(prev => prev.map(c => {
      if (c.id === claimId) {
        return { ...c, pushedToPayroll: true };
      }
      return c;
    }));
    showToast('Queued for Payroll', 'Expense reimbursement linked to payroll batch.', 'info');
  };

  // ==========================================
  // ASSETS & HARDWARE METHODS
  // ==========================================
  const assets = useMemo(() => {
    return allAssets.filter(a => a.tenantId === currentTenant.id);
  }, [allAssets, currentTenant.id]);

  const assignAsset = (assetId: string, employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    setAllAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          assignedToEmployeeId: emp.id,
          assignedToName: `${emp.firstName} ${emp.lastName}`,
          department: emp.department,
          allocatedDate: new Date().toISOString().split('T')[0],
          status: 'allocated'
        };
      }
      return a;
    }));
    showToast('Hardware Asset Assigned', `Allocated to ${emp.firstName} ${emp.lastName}`, 'success');
  };

  const unassignAsset = (assetId: string) => {
    setAllAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          assignedToEmployeeId: undefined,
          assignedToName: undefined,
          department: undefined,
          allocatedDate: undefined,
          status: 'in_inventory'
        };
      }
      return a;
    }));
    showToast('Asset Reclaimed', 'Hardware returned to central inventory pool.', 'info');
  };

  const createAsset = (assetData: Omit<Asset, 'id' | 'tenantId'>) => {
    const newAsset: Asset = {
      ...assetData,
      id: `AST-${Math.floor(700 + Math.random() * 300)}`,
      tenantId: currentTenant.id
    };
    setAllAssets(prev => [newAsset, ...prev]);
    showToast('Asset Registered', `${newAsset.name} added to IT hardware inventory.`, 'success');
  };

  // ==========================================
  // EXIT CLEARANCE & LIFECYCLE METHODS
  // ==========================================
  const exitClearances = useMemo(() => {
    return allExits.filter(ex => ex.tenantId === currentTenant.id);
  }, [allExits, currentTenant.id]);

  const toggleClearanceItem = (clearanceId: string, key: 'itClearance' | 'adminClearance' | 'financeClearance' | 'hrExitInterview') => {
    setAllExits(prev => prev.map(ex => {
      if (ex.id === clearanceId) {
        return {
          ...ex,
          [key]: !ex[key]
        };
      }
      return ex;
    }));
    showToast('Department Clearance Updated', 'Checklist sign-off updated.', 'info');
  };

  const calculateFandF = (clearanceId: string) => {
    setAllExits(prev => prev.map(ex => {
      if (ex.id === clearanceId) {
        const gratuity = 6500;
        const encashmentDays = 6;
        const encashmentAmount = 3300;
        const noticePay = 14000;
        const deductions = 350;
        const net = gratuity + encashmentAmount + noticePay - deductions;

        return {
          ...ex,
          ffStatus: 'calculated',
          gratuityAmount: gratuity,
          leaveEncashmentDays: encashmentDays,
          leaveEncashmentAmount: encashmentAmount,
          noticePeriodPay: noticePay,
          deductionsAmount: deductions,
          netSettlementAmount: net
        };
      }
      return ex;
    }));
    showToast('F&F Statement Calculated', 'Full & Final settlement computed with statutory gratuity & leave encashment.', 'success');
  };

  const settleFandF = (clearanceId: string) => {
    setAllExits(prev => prev.map(ex => {
      if (ex.id === clearanceId) {
        return {
          ...ex,
          ffStatus: 'settled'
        };
      }
      return ex;
    }));
    showToast('F&F Settlement Finalized', 'Full & Final payment processed and service certificate issued.', 'success');
  };

  return (
    <TenantContext.Provider value={{
      tenants,
      currentTenant,
      switchTenant,
      isModuleSubscribed,
      toggleModule,
      activateModuleTrial,
      upgradePlan,
      createTenant,
      updateTenantDetails,
      resetAllData,
      currentUser,
      users: INITIAL_USERS,
      switchUser: switchUserRole,
      switchUserRole,
      setCurrentUser,
      employees,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      attendanceRecords,
      logAttendanceClockIn,
      logAttendanceClockOut,
      leaveRequests,
      submitLeaveRequest,
      updateLeaveStatus,
      payrollRuns,
      payslips,
      executePayrollRun,
      jobRequisitions,
      createJobRequisition,
      candidates,
      updateCandidateStage,
      addCandidate,
      expenses,
      submitExpenseClaim,
      approveExpenseClaim,
      rejectExpenseClaim,
      pushExpenseToPayroll,
      assets,
      assignAsset,
      unassignAsset,
      createAsset,
      exitClearances,
      toggleClearanceItem,
      calculateFandF,
      settleFandF,
      activeRoute,
      navigateTo: setActiveRoute,
      toasts,
      showToast,
      dismissToast
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
