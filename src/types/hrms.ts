export type TenantModule = 'core_hr' | 'attendance' | 'leave' | 'payroll' | 'ats' | 'ai_hub' | 'expenses' | 'lifecycle';

export type TenantPlan = 'Starter' | 'Growth' | 'Enterprise' | 'Custom';

export type UserRole = 'Tenant Admin' | 'HR Manager' | 'Finance Officer' | 'Department Lead' | 'Employee';

export type PermissionKey = 
  | 'manage_employees'
  | 'view_compensation'
  | 'execute_payroll'
  | 'approve_leaves'
  | 'approve_expenses'
  | 'manage_ats'
  | 'manage_assets'
  | 'manage_exit_clearance'
  | 'configure_modules'
  | 'manage_rbac_matrix'
  | 'export_reports'
  | 'use_ai_tools';

export interface RolePermissionConfig {
  role: UserRole;
  displayName: string;
  description: string;
  badgeColor: string;
  permissions: Record<PermissionKey, boolean>;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
  department: string;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  plan: TenantPlan;
  billingCycle: 'monthly' | 'annually';
  activeModules: TenantModule[];
  employeeCount: number;
  maxSeats: number;
  currency: string;
  headquarters: string;
  domain: string;
  subscriptionStatus: 'active' | 'trialing' | 'past_due';
  monthlySpend: number;
  themeColor: string;
  logoInitials: string;
  createdAt: string;
}

export interface ModuleMetadata {
  id: TenantModule;
  name: string;
  shortDesc: string;
  fullDesc: string;
  category: 'Core HR' | 'Operations' | 'Finance & Comp' | 'Talent & AI';
  icon: string;
  badgeColor: string;
  pricePerUserMonthly: number;
  features: string[];
  roiMetric: string;
}

export interface Employee {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  location: string;
  status: 'active' | 'on_leave' | 'probation' | 'notice' | 'terminated';
  joinDate: string;
  manager: string;
  avatarUrl?: string;
  phone?: string;
  salary: number;
  panNumber?: string;
  bankAccount?: string;
  employmentType?: 'Full-Time' | 'Contract' | 'Part-Time' | 'Intern' | string;
  leaveBalance: {
    paid: number;
    sick: number;
    casual: number;
    parental: number;
    annual?: number;
    unpaid?: number;
    [key: string]: number | undefined;
  };
}

export type ShiftType = 'morning' | 'evening' | 'night' | 'flexible' | 'off' | string;

export interface ShiftInfo {
  id?: string;
  name: string;
  type?: ShiftType;
  startTime?: string;
  endTime?: string;
  timing?: string;
  description?: string;
  gracePeriodMinutes?: number;
  assignedDepartments?: string[];
  activeStaffCount?: number;
  color?: string;
  badgeBg?: string;
  [key: string]: any;
}

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  clockInTime?: string;
  clockOutTime?: string;
  clockIn?: string;
  clockOut?: string;
  breakDurationMinutes?: number;
  totalWorkHours?: number;
  totalHoursWorked?: number;
  status: 'present' | 'late' | 'half_day' | 'absent' | 'overtime' | 'on_leave' | 'on_time' | string;
  locationType?: 'Office (HQ)' | 'Remote' | 'Client Site' | string;
  locationCheckin?: string;
  verifiedGps?: boolean;
  isRegularized?: boolean;
}

export interface LeaveRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  employeeRole?: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysCount?: number;
  days?: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  appliedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  managerComments?: string;
}

export interface PayrollRun {
  id: string;
  tenantId: string;
  period: string; // e.g., "September 2026"
  payDate: string;
  status: 'draft' | 'processing' | 'completed';
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  employeeCount: number;
  processedBy: string;
  disbursementMethod: 'Direct ACH' | 'Wire Transfer' | 'Manual';
}

export interface Payslip {
  id: string;
  payrollRunId: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  role: string;
  department: string;
  period: string;
  payDate: string;
  payPeriodRange?: string;
  annualCtc?: number;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  specialAllowance?: number;
  performanceBonus: number;
  grossPay: number;
  taxDeduction: number; // TDS
  socialSecurity: number;
  providentFund?: number; // PF 12% of Basic
  professionalTax?: number; // PT
  healthInsurance: number;
  lossOfPayDeduction?: number; // LOP
  totalDeductions: number;
  netPay: number;
  paymentStatus: 'Paid' | 'Pending' | 'On Hold';
  bankAccountMasked: string;
  taxIdMasked?: string;
  routingMasked?: string;
  workedDays?: number;
  lopDays?: number;
}

export interface JobRequisition {
  id: string;
  tenantId: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-Time' | 'Remote' | 'Hybrid' | 'Contract';
  status: 'open' | 'interviewing' | 'filled' | 'paused';
  applicantCount: number;
  postedDate: string;
  hiringManager: string;
  salaryRange: string;
  description: string;
}

export interface Candidate {
  id: string;
  tenantId: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  stage: 'sourced' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  experienceYears: number;
  currentCompany: string;
  matchScore: number;
  appliedDate: string;
  interviewerRating?: number;
  notes: string;
  skills: string[];
}

export interface ExpenseClaim {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  category: 'Travel' | 'Client Meal' | 'Home Office' | 'Software/Tools' | 'Wellness' | 'General';
  amount: number;
  currency: string;
  merchant: string;
  transactionDate: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  receiptUrl?: string;
  receiptName?: string;
  notes: string;
  approvedBy?: string;
  approvedAt?: string;
  pushedToPayroll?: boolean;
}

export interface Asset {
  id: string;
  tenantId: string;
  name: string;
  category: 'Laptop' | 'Monitor' | 'Mobile / Tablet' | 'Security Key' | 'Access Card' | 'Other';
  serialNumber: string;
  assignedToEmployeeId?: string;
  assignedToName?: string;
  department?: string;
  condition: 'Brand New' | 'Good' | 'Fair' | 'Maintenance Required';
  allocatedDate?: string;
  status: 'allocated' | 'in_inventory' | 'retired';
  purchasePrice?: number;
}

export interface ExitClearance {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  role: string;
  department: string;
  resignationDate: string;
  lastWorkingDay: string;
  noticePeriodDays: number;
  reason: string;
  itClearance: boolean;
  adminClearance: boolean;
  financeClearance: boolean;
  hrExitInterview: boolean;
  ffStatus: 'draft' | 'calculated' | 'settled';
  gratuityAmount?: number;
  leaveEncashmentDays?: number;
  leaveEncashmentAmount?: number;
  noticePeriodPay?: number;
  deductionsAmount?: number;
  netSettlementAmount?: number;
}

export interface CompanyHoliday {
  id: string;
  tenantId?: string;
  name: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  type: 'Public / Statutory' | 'Company Observance' | 'Floating Holiday';
  isMandatory: boolean;
  description?: string;
}

export interface TeamCelebration {
  id: string;
  tenantId?: string;
  employeeId: string;
  employeeName: string;
  role: string;
  department: string;
  date: string; // YYYY-MM-DD
  type: 'birthday' | 'anniversary';
  yearsCount?: number;
  avatarInitials: string;
}

