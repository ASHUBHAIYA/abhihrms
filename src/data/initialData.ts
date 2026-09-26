import { Tenant, ModuleMetadata, Employee, AttendanceRecord, LeaveRequest, PayrollRun, Payslip, JobRequisition, Candidate, UserProfile, ExpenseClaim, Asset, ExitClearance, UserRole, RolePermissionConfig } from '../types/hrms';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-admin',
    name: 'Abhishek Patel',
    email: 'abhishek@saas-hrms.io',
    role: 'Tenant Admin',
    avatarInitials: 'AP',
    department: 'Executive Management'
  },
  {
    id: 'usr-hrmgr',
    name: 'Sarah Jenkins',
    email: 'sarah.j@company.org',
    role: 'HR Manager',
    avatarInitials: 'SJ',
    department: 'People Operations'
  },
  {
    id: 'usr-fin',
    name: 'Marcus Vance',
    email: 'marcus.v@company.org',
    role: 'Finance Officer',
    avatarInitials: 'MV',
    department: 'Finance & Treasury'
  },
  {
    id: 'usr-lead',
    name: 'Elena Rostova',
    email: 'elena.r@company.org',
    role: 'Department Lead',
    avatarInitials: 'ER',
    department: 'Engineering'
  },
  {
    id: 'usr-emp',
    name: 'David Kim',
    email: 'david.k@company.org',
    role: 'Employee',
    avatarInitials: 'DK',
    department: 'Engineering'
  }
];

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, RolePermissionConfig> = {
  'Tenant Admin': {
    role: 'Tenant Admin',
    displayName: 'Corporate Super Admin',
    description: 'Full executive organization authority, master billing, module activation, and RBAC governance.',
    badgeColor: 'blue',
    permissions: {
      manage_employees: true,
      view_compensation: true,
      execute_payroll: true,
      approve_leaves: true,
      approve_expenses: true,
      manage_ats: true,
      manage_assets: true,
      manage_exit_clearance: true,
      configure_modules: true,
      manage_rbac_matrix: true,
      export_reports: true,
      use_ai_tools: true
    }
  },
  'HR Manager': {
    role: 'HR Manager',
    displayName: 'HR Operations & People Lead',
    description: 'Oversees employee database, talent recruitment/ATS, leave policy, and separation clearance.',
    badgeColor: 'indigo',
    permissions: {
      manage_employees: true,
      view_compensation: true,
      execute_payroll: false,
      approve_leaves: true,
      approve_expenses: false,
      manage_ats: true,
      manage_assets: true,
      manage_exit_clearance: true,
      configure_modules: false,
      manage_rbac_matrix: false,
      export_reports: true,
      use_ai_tools: true
    }
  },
  'Finance Officer': {
    role: 'Finance Officer',
    displayName: 'Payroll & Expense Controller',
    description: 'Authorized to execute compensation disbursement, manage tax brackets, and sign off on expense reimbursements.',
    badgeColor: 'emerald',
    permissions: {
      manage_employees: false,
      view_compensation: true,
      execute_payroll: true,
      approve_leaves: false,
      approve_expenses: true,
      manage_ats: false,
      manage_assets: false,
      manage_exit_clearance: false,
      configure_modules: false,
      manage_rbac_matrix: false,
      export_reports: true,
      use_ai_tools: true
    }
  },
  'Department Lead': {
    role: 'Department Lead',
    displayName: 'Team Manager & Approver',
    description: 'Manages team roster, reviews first-level leave requests and project expense submissions.',
    badgeColor: 'amber',
    permissions: {
      manage_employees: false,
      view_compensation: false,
      execute_payroll: false,
      approve_leaves: true,
      approve_expenses: true,
      manage_ats: false,
      manage_assets: false,
      manage_exit_clearance: false,
      configure_modules: false,
      manage_rbac_matrix: false,
      export_reports: true,
      use_ai_tools: true
    }
  },
  'Employee': {
    role: 'Employee',
    displayName: 'Standard Staff (Self-Service)',
    description: 'Employee Self-Service (ESS) portal access to view personal payslips, submit leaves/expenses, and consult AI Policy Hub.',
    badgeColor: 'slate',
    permissions: {
      manage_employees: false,
      view_compensation: false,
      execute_payroll: false,
      approve_leaves: false,
      approve_expenses: false,
      manage_ats: false,
      manage_assets: false,
      manage_exit_clearance: false,
      configure_modules: false,
      manage_rbac_matrix: false,
      export_reports: false,
      use_ai_tools: true
    }
  }
};

export const MODULE_CATALOG: Record<string, ModuleMetadata> = {
  core_hr: {
    id: 'core_hr',
    name: 'Core HR & People',
    shortDesc: 'Employee directory, org charts, records & department management.',
    fullDesc: 'Centralize your entire workforce database with automated record keeping, organizational hierarchy mapping, role-based access control, and compliant document management.',
    category: 'Core HR',
    icon: 'Users',
    badgeColor: 'emerald',
    pricePerUserMonthly: 3.5,
    features: [
      'Comprehensive Employee Directory & Profiles',
      'Interactive Visual Organization Chart',
      'Department, Designation & Role Hierarchy',
      'Custom Employee Custom Fields & Metadata',
      'Role-Based Granular Permissions (RBAC)',
      'Digital Document Repository & Expiry Alerts'
    ],
    roiMetric: 'Reduces manual HR admin overhead by 68%'
  },
  attendance: {
    id: 'attendance',
    name: 'Time & Attendance',
    shortDesc: 'Live clock-in/out, GPS geofencing, shift roster & timesheets.',
    fullDesc: 'Real-time time tracking with biometric/GPS geofence check-ins, automated overtime calculations, shift scheduling rosters, and instant timesheet approval workflows.',
    category: 'Operations',
    icon: 'Clock',
    badgeColor: 'blue',
    pricePerUserMonthly: 2.5,
    features: [
      'One-Click Web & Mobile Geo-fenced Clock In/Out',
      'Live Team Attendance & Tardy Monitoring',
      'Shift Planning & Rotational Roster Grid',
      'Automated Overtime & Break Tracking',
      'Exportable Audit-Ready Timesheets for Payroll',
      'Break & Remote Work Compliance Enforcer'
    ],
    roiMetric: 'Prevents 100% of buddy-punching & timesheet inflation'
  },
  leave: {
    id: 'leave',
    name: 'Leave & Absence',
    shortDesc: 'Time-off requests, multi-tier approvals, policy builder & balances.',
    fullDesc: 'Automate paid time off, sick leave, maternity/paternity policies with multi-level approval hierarchies, team absence calendars, and custom accrual rules.',
    category: 'Operations',
    icon: 'CalendarOff',
    badgeColor: 'amber',
    pricePerUserMonthly: 2.0,
    features: [
      'Real-Time Employee Leave Balance Wallets',
      '1-Click Manager Approval & Rejection Flow',
      'Dynamic Policy Engine (Accrual, Carry-over, LOP)',
      'Public & Regional Holiday Calendar Sync',
      'Team Absence Heatmap & Blackout Date Rules',
      'Automated Leave Encashment & Proration'
    ],
    roiMetric: 'Cuts time-off approval delays from 4 days to 4 minutes'
  },
  payroll: {
    id: 'payroll',
    name: 'Payroll & Compensation',
    shortDesc: 'Automated salary batches, tax deductions, ACH disburse & payslips.',
    fullDesc: 'Compliant automated multi-state and multi-currency payroll runs, statutory tax withholdings, custom salary structures, instant PDF payslip distribution, and bank direct disbursement.',
    category: 'Operations',
    icon: 'Receipt',
    badgeColor: 'violet',
    pricePerUserMonthly: 4.5,
    features: [
      '3-Step Batch Payroll Run Simulation Engine',
      'Automated Statutory Tax & Benefit Deductions',
      'Dynamic Allowances, Bonuses & Reimbursements',
      'Instant Downloadable & Printable PDF Payslips',
      'Direct ACH / Wire Disbursal Manifest Generation',
      'Year-End Tax Forms & Compensation Analytics'
    ],
    roiMetric: 'Guarantees 100% payroll calculation accuracy & zero compliance fines'
  },
  ats: {
    id: 'ats',
    name: 'Recruitment & ATS',
    shortDesc: 'Job postings, visual candidate pipeline Kanban, scoring & offers.',
    fullDesc: 'End-to-end applicant tracking system with custom candidate pipelines, resume scoring, structured interview scorecards, automated email alerts, and offer letter generation.',
    category: 'Talent & AI',
    icon: 'Briefcase',
    badgeColor: 'rose',
    pricePerUserMonthly: 4.0,
    features: [
      'Visual Drag-and-Drop Candidate Pipeline Kanban',
      'Custom Requisition & Job Post Publisher',
      'AI Resume Keyword Match & Skill Scoring',
      'Collaborative Interview Scorecards & Notes',
      'Offer Letter Generation with Digital Signing Status',
      'Candidate Sourcing & Talent Pool Management'
    ],
    roiMetric: 'Reduces average time-to-hire by 18 days'
  },
  ai_hub: {
    id: 'ai_hub',
    name: 'AI HR Intelligence Hub',
    shortDesc: 'Generative job specs, performance review drafters & policy copilot.',
    fullDesc: 'Enterprise AI capabilities crafted specifically for HR teams: generate compliant job requisitions in seconds, draft 360-degree performance appraisals, and provide an instant employee policy query assistant.',
    category: 'Talent & AI',
    icon: 'Sparkles',
    badgeColor: 'cyan',
    pricePerUserMonthly: 5.0,
    features: [
      'Generative Job Description Spec Engine',
      'AI 360° Employee Performance Review Drafter',
      'Instant HR Policy & Employee Handbook Q&A Copilot',
      'Bias Detection in Requisitions & Reviews',
      'Attrition Risk & Sentiment Predictive Insights',
      'Automated Onboarding Plan & Goal Generator'
    ],
    roiMetric: 'Saves 12+ hours per recruiter and HR business partner weekly'
  },
  expenses: {
    id: 'expenses',
    name: 'Expenses & Claims',
    shortDesc: 'Receipt scanning, approvals, spend policies & payroll reimbursement.',
    fullDesc: 'Automate employee expense submissions with AI OCR receipt scanning, multi-tier manager approvals, spend policy compliance, and direct disbursement in monthly payroll runs.',
    category: 'Finance & Comp',
    icon: 'CreditCard',
    badgeColor: 'emerald',
    pricePerUserMonthly: 3.0,
    features: [
      'AI Receipt Scanner & OCR Autofill (Gemini 2.5 Flash)',
      'Multi-Level Manager & Finance Approval Workflow',
      'Category Spend Limits & Compliance Caps',
      '1-Click Push to Monthly Payroll Run',
      'Audit Trail with Image Verification',
      'Department Spend Analytics & Export'
    ],
    roiMetric: 'Accelerates expense reimbursement cycle by 75%'
  },
  lifecycle: {
    id: 'lifecycle',
    name: 'Asset Tracking & Lifecycle',
    shortDesc: 'Hardware inventory, serial tracking, resignations & F&F settlements.',
    fullDesc: 'Manage company hardware allocations (laptops, monitors, security keys), departmental sign-offs, and streamline employee resignation notice periods with full & final (F&F) settlement calculations.',
    category: 'Core HR',
    icon: 'Laptop',
    badgeColor: 'indigo',
    pricePerUserMonthly: 2.5,
    features: [
      'IT Hardware & Laptop Asset Inventory Registry',
      'Employee Device Allocation & Reclaim Workflows',
      'Resignation & Notice Period Tracking (60/90 Days)',
      'Departmental Exit Clearance (IT, Admin, Finance, HR)',
      'Full & Final (F&F) Settlement Generator & Encashment',
      'Audit-Ready Separation Records'
    ],
    roiMetric: 'Eliminates 100% of unrecovered hardware during exits'
  }
};

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant-acme',
    slug: 'acme-corp',
    name: 'Acme Corp',
    plan: 'Growth',
    billingCycle: 'monthly',
    activeModules: ['core_hr', 'attendance', 'leave'],
    employeeCount: 6,
    maxSeats: 25,
    currency: '$',
    headquarters: 'San Francisco, CA',
    domain: 'acme.nexus.io',
    subscriptionStatus: 'active',
    monthlySpend: 480,
    themeColor: 'indigo',
    logoInitials: 'AC',
    createdAt: '2024-03-15'
  },
  {
    id: 'tenant-techcorp',
    slug: 'techcorp-global',
    name: 'TechCorp Global',
    plan: 'Enterprise',
    billingCycle: 'annually',
    activeModules: ['core_hr', 'attendance', 'leave', 'payroll', 'ats', 'ai_hub', 'expenses', 'lifecycle'],
    employeeCount: 8,
    maxSeats: 100,
    currency: '$',
    headquarters: 'Austin, TX',
    domain: 'techcorp.global.nexus.io',
    subscriptionStatus: 'active',
    monthlySpend: 2450,
    themeColor: 'emerald',
    logoInitials: 'TG',
    createdAt: '2023-11-01'
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  // Acme Corp Employees
  {
    id: 'EMP-1001',
    tenantId: 'tenant-acme',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@acme.com',
    role: 'VP of Engineering',
    department: 'Engineering',
    location: 'San Francisco, CA',
    status: 'active',
    joinDate: '2022-03-15',
    manager: 'CEO',
    phone: '+1 (415) 555-0192',
    employmentType: 'Full-Time',
    salary: 195000,
    leaveBalance: { paid: 14, sick: 6, casual: 8, parental: 12 }
  },
  {
    id: 'EMP-1002',
    tenantId: 'tenant-acme',
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'marcus.vance@acme.com',
    role: 'Principal Cloud Architect',
    department: 'Engineering',
    location: 'San Francisco, CA',
    status: 'active',
    joinDate: '2022-08-01',
    manager: 'Sarah Chen',
    phone: '+1 (415) 555-0143',
    employmentType: 'Full-Time',
    salary: 175000,
    leaveBalance: { paid: 14, sick: 8, casual: 6, parental: 0 }
  },
  {
    id: 'EMP-1003',
    tenantId: 'tenant-acme',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena.rostova@acme.com',
    role: 'Head of Product Design',
    department: 'Product & Design',
    location: 'New York, NY',
    status: 'active',
    joinDate: '2023-01-10',
    manager: 'CEO',
    phone: '+1 (212) 555-0812',
    employmentType: 'Full-Time',
    salary: 160000,
    leaveBalance: { paid: 16, sick: 9, casual: 7, parental: 0 }
  },
  {
    id: 'EMP-1004',
    tenantId: 'tenant-acme',
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.kim@acme.com',
    role: 'Senior People Operations Manager',
    department: 'Human Resources',
    location: 'San Francisco, CA',
    status: 'probation',
    joinDate: '2026-07-01',
    manager: 'Sarah Chen',
    phone: '+1 (415) 555-0377',
    employmentType: 'Full-Time',
    salary: 130000,
    leaveBalance: { paid: 6, sick: 4, casual: 3, parental: 0 }
  },
  {
    id: 'EMP-1005',
    tenantId: 'tenant-acme',
    firstName: 'Aaliyah',
    lastName: 'Patel',
    email: 'aaliyah.patel@acme.com',
    role: 'Financial Controller',
    department: 'Finance',
    location: 'Chicago, IL',
    status: 'active',
    joinDate: '2023-07-01',
    manager: 'CEO',
    phone: '+1 (312) 555-0988',
    employmentType: 'Full-Time',
    salary: 145000,
    leaveBalance: { paid: 15, sick: 10, casual: 8, parental: 0 }
  },
  {
    id: 'EMP-1006',
    tenantId: 'tenant-acme',
    firstName: 'Liam',
    lastName: 'Gallagher',
    email: 'liam.g@acme.com',
    role: 'Enterprise Account Executive',
    department: 'Sales',
    location: 'Austin, TX',
    status: 'notice',
    joinDate: '2024-02-12',
    manager: 'Sarah Chen',
    phone: '+1 (512) 555-0619',
    employmentType: 'Full-Time',
    salary: 120000,
    leaveBalance: { paid: 4, sick: 3, casual: 1, parental: 0 }
  },
  {
    id: 'EMP-1007',
    tenantId: 'tenant-acme',
    firstName: 'Zoe',
    lastName: 'Kaufman',
    email: 'zoe.k@acme.com',
    role: 'Frontend UI/UX Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    status: 'probation',
    joinDate: '2026-08-15',
    manager: 'Sarah Chen',
    phone: '+1 (415) 555-9988',
    employmentType: 'Full-Time',
    salary: 125000,
    leaveBalance: { paid: 5, sick: 4, casual: 2, parental: 0 }
  },

  // TechCorp Global Employees
  {
    id: 'EMP-5001',
    tenantId: 'tenant-techcorp',
    firstName: 'Alexander',
    lastName: 'Wright',
    email: 'alex.wright@techcorp.io',
    role: 'Chief Technology Officer',
    department: 'Engineering',
    location: 'Austin, TX',
    status: 'active',
    joinDate: '2021-06-01',
    manager: 'CEO',
    phone: '+1 (512) 555-8101',
    employmentType: 'Full-Time',
    salary: 220000,
    leaveBalance: { paid: 24, sick: 12, casual: 6, parental: 0 }
  },
  {
    id: 'EMP-5002',
    tenantId: 'tenant-techcorp',
    firstName: 'Maya',
    lastName: 'Nakamura',
    email: 'maya.n@techcorp.io',
    role: 'VP of AI Research',
    department: 'Applied AI',
    location: 'San Francisco, CA',
    status: 'active',
    joinDate: '2022-01-15',
    manager: 'Alexander Wright',
    phone: '+1 (415) 555-9033',
    employmentType: 'Full-Time',
    salary: 210000,
    leaveBalance: { paid: 20, sick: 10, casual: 4, parental: 0 }
  },
  {
    id: 'EMP-5003',
    tenantId: 'tenant-techcorp',
    firstName: 'Julian',
    lastName: 'Sterling',
    email: 'julian.s@techcorp.io',
    role: 'Director of Global Payroll & Comp',
    department: 'Finance',
    location: 'New York, NY',
    status: 'active',
    joinDate: '2022-09-10',
    manager: 'CFO',
    phone: '+1 (212) 555-7422',
    employmentType: 'Full-Time',
    salary: 175000,
    leaveBalance: { paid: 18, sick: 10, casual: 5, parental: 0 }
  },
  {
    id: 'EMP-5004',
    tenantId: 'tenant-techcorp',
    firstName: 'Chloe',
    lastName: 'Dupont',
    email: 'chloe.d@techcorp.io',
    role: 'Lead Talent Acquisition Partner',
    department: 'Human Resources',
    location: 'Austin, TX',
    status: 'active',
    joinDate: '2023-03-01',
    manager: 'VP People',
    phone: '+1 (512) 555-4309',
    employmentType: 'Full-Time',
    salary: 140000,
    leaveBalance: { paid: 15, sick: 9, casual: 3, parental: 0 }
  },
  {
    id: 'EMP-5005',
    tenantId: 'tenant-techcorp',
    firstName: 'Zackary',
    lastName: 'Kovacs',
    email: 'zackary.k@techcorp.io',
    role: 'Staff Neural Systems Engineer',
    department: 'Applied AI',
    location: 'Austin, TX',
    status: 'active',
    joinDate: '2023-11-20',
    manager: 'Maya Nakamura',
    phone: '+1 (512) 555-6671',
    employmentType: 'Full-Time',
    salary: 185000,
    leaveBalance: { paid: 16, sick: 8, casual: 3, parental: 0 }
  },
  {
    id: 'EMP-5006',
    tenantId: 'tenant-techcorp',
    firstName: 'Nadia',
    lastName: 'Sorenson',
    email: 'nadia.s@techcorp.io',
    role: 'Senior Full-Stack Architect',
    department: 'Engineering',
    location: 'Remote, US',
    status: 'active',
    joinDate: '2024-04-15',
    manager: 'Alexander Wright',
    phone: '+1 (206) 555-3310',
    employmentType: 'Full-Time',
    salary: 165000,
    leaveBalance: { paid: 14, sick: 8, casual: 3, parental: 0 }
  },
  {
    id: 'EMP-5007',
    tenantId: 'tenant-techcorp',
    firstName: 'Dr. Evelyn',
    lastName: 'Harte',
    email: 'evelyn.h@techcorp.io',
    role: 'Principal LLM Systems Scientist',
    department: 'Applied AI',
    location: 'Boston, MA',
    status: 'active',
    joinDate: '2024-07-01',
    manager: 'Maya Nakamura',
    phone: '+1 (617) 555-0914',
    employmentType: 'Full-Time',
    salary: 205000,
    leaveBalance: { paid: 19, sick: 11, casual: 4, parental: 0 }
  },
  {
    id: 'EMP-5008',
    tenantId: 'tenant-techcorp',
    firstName: 'Tariq',
    lastName: 'Al-Mansoor',
    email: 'tariq.m@techcorp.io',
    role: 'Senior Product Manager',
    department: 'Product & Design',
    location: 'Austin, TX',
    status: 'active',
    joinDate: '2025-01-10',
    manager: 'VP Product',
    phone: '+1 (512) 555-2289',
    employmentType: 'Full-Time',
    salary: 155000,
    leaveBalance: { paid: 12, sick: 7, casual: 2, parental: 0 }
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'ATT-901',
    tenantId: 'tenant-acme',
    employeeId: 'EMP-1001',
    employeeName: 'Sarah Chen',
    department: 'Engineering',
    date: '2026-09-26',
    clockIn: '08:52 AM',
    breakDurationMinutes: 45,
    totalWorkHours: 7.8,
    status: 'on_time',
    locationCheckin: 'SF HQ - Geofence Verified',
    verifiedGps: true
  },
  {
    id: 'ATT-902',
    tenantId: 'tenant-acme',
    employeeId: 'EMP-1002',
    employeeName: 'Marcus Vance',
    department: 'Engineering',
    date: '2026-09-26',
    clockIn: '09:05 AM',
    breakDurationMinutes: 30,
    totalWorkHours: 7.5,
    status: 'on_time',
    locationCheckin: 'SF HQ - Geofence Verified',
    verifiedGps: true
  },
  {
    id: 'ATT-903',
    tenantId: 'tenant-acme',
    employeeId: 'EMP-1003',
    employeeName: 'Elena Rostova',
    department: 'Product & Design',
    date: '2026-09-26',
    clockIn: '08:45 AM',
    breakDurationMinutes: 60,
    totalWorkHours: 8.0,
    status: 'on_time',
    locationCheckin: 'NYC Office - Geofence Verified',
    verifiedGps: true
  },
  {
    id: 'ATT-904',
    tenantId: 'tenant-acme',
    employeeId: 'EMP-1004',
    employeeName: 'David Kim',
    department: 'Human Resources',
    date: '2026-09-26',
    clockIn: '09:34 AM',
    breakDurationMinutes: 40,
    totalWorkHours: 6.9,
    status: 'late',
    locationCheckin: 'SF HQ - Geofence Verified',
    verifiedGps: true
  },
  {
    id: 'ATT-905',
    tenantId: 'tenant-acme',
    employeeId: 'EMP-1005',
    employeeName: 'Aaliyah Patel',
    department: 'Finance',
    date: '2026-09-26',
    clockIn: '08:30 AM',
    clockOut: '05:30 PM',
    breakDurationMinutes: 60,
    totalWorkHours: 8.0,
    status: 'on_time',
    locationCheckin: 'Chicago Regional - Geofence Verified',
    verifiedGps: true
  },
  // TechCorp Global
  {
    id: 'ATT-910',
    tenantId: 'tenant-techcorp',
    employeeId: 'EMP-5001',
    employeeName: 'Alexander Wright',
    department: 'Engineering',
    date: '2026-09-26',
    clockIn: '08:15 AM',
    breakDurationMinutes: 30,
    totalWorkHours: 8.5,
    status: 'on_time',
    locationCheckin: 'Austin HQ - Biometric Geofence',
    verifiedGps: true
  },
  {
    id: 'ATT-911',
    tenantId: 'tenant-techcorp',
    employeeId: 'EMP-5002',
    employeeName: 'Maya Nakamura',
    department: 'Applied AI',
    date: '2026-09-26',
    clockIn: '08:45 AM',
    breakDurationMinutes: 45,
    totalWorkHours: 7.9,
    status: 'on_time',
    locationCheckin: 'SF AI Lab - Geofence Verified',
    verifiedGps: true
  }
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'LR-501',
    tenantId: 'tenant-acme',
    employeeId: 'EMP-1006',
    employeeName: 'Liam Gallagher',
    employeeRole: 'Enterprise Account Executive',
    department: 'Sales',
    leaveType: 'Annual / Paid',
    startDate: '2026-09-25',
    endDate: '2026-09-29',
    days: 3,
    reason: 'Family wedding and travel in Austin.',
    status: 'approved',
    appliedAt: '2026-09-18',
    approvedBy: 'VP Sales'
  },
  {
    id: 'LR-502',
    tenantId: 'tenant-acme',
    employeeId: 'EMP-1002',
    employeeName: 'Marcus Vance',
    employeeRole: 'Principal Cloud Architect',
    department: 'Engineering',
    leaveType: 'Annual / Paid',
    startDate: '2026-10-05',
    endDate: '2026-10-09',
    days: 5,
    reason: 'Annual hiking expedition in Yosemite with family.',
    status: 'pending',
    appliedAt: '2026-09-24'
  },
  {
    id: 'LR-503',
    tenantId: 'tenant-acme',
    employeeId: 'EMP-1004',
    employeeName: 'David Kim',
    employeeRole: 'Senior People Operations Manager',
    department: 'Human Resources',
    leaveType: 'Sick',
    startDate: '2026-09-28',
    endDate: '2026-09-28',
    days: 1,
    reason: 'Scheduled dental oral surgery follow-up.',
    status: 'pending',
    appliedAt: '2026-09-25'
  },
  // TechCorp Global
  {
    id: 'LR-504',
    tenantId: 'tenant-techcorp',
    employeeId: 'EMP-5003',
    employeeName: 'Julian Sterling',
    employeeRole: 'Director of Global Payroll & Comp',
    department: 'Finance',
    leaveType: 'Casual',
    startDate: '2026-10-02',
    endDate: '2026-10-02',
    days: 1,
    reason: 'Personal financial summit keynote.',
    status: 'pending',
    appliedAt: '2026-09-25'
  }
];

export const INITIAL_PAYROLL_RUNS: PayrollRun[] = [
  {
    id: 'PAY-TECH-09',
    tenantId: 'tenant-techcorp',
    period: 'September 2026',
    payDate: '2026-09-30',
    status: 'completed',
    totalGrossPay: 122916,
    totalDeductions: 28270,
    totalNetPay: 94646,
    employeeCount: 8,
    processedBy: 'Julian Sterling (Comp Director)',
    disbursementMethod: 'Direct ACH'
  },
  {
    id: 'PAY-TECH-08',
    tenantId: 'tenant-techcorp',
    period: 'August 2026',
    payDate: '2026-08-31',
    status: 'completed',
    totalGrossPay: 120500,
    totalDeductions: 27715,
    totalNetPay: 92785,
    employeeCount: 8,
    processedBy: 'Julian Sterling (Comp Director)',
    disbursementMethod: 'Direct ACH'
  }
];

export const INITIAL_PAYSLIPS: Payslip[] = [
  {
    id: 'SLIP-5001',
    payrollRunId: 'PAY-TECH-09',
    tenantId: 'tenant-techcorp',
    employeeId: 'EMP-5001',
    employeeName: 'Alexander Wright',
    role: 'Chief Technology Officer',
    department: 'Engineering',
    period: 'September 2026',
    payDate: '2026-09-30',
    basicSalary: 14666.67,
    housingAllowance: 2200,
    transportAllowance: 1466.66,
    performanceBonus: 0,
    grossPay: 18333.33,
    taxDeduction: 3300,
    socialSecurity: 1136.66,
    healthInsurance: 450,
    totalDeductions: 4886.66,
    netPay: 13446.67,
    paymentStatus: 'Paid',
    bankAccountMasked: '•••• 8912 (Chase Private)'
  },
  {
    id: 'SLIP-5002',
    payrollRunId: 'PAY-TECH-09',
    tenantId: 'tenant-techcorp',
    employeeId: 'EMP-5002',
    employeeName: 'Maya Nakamura',
    role: 'VP of AI Research',
    department: 'Applied AI',
    period: 'September 2026',
    payDate: '2026-09-30',
    basicSalary: 14000,
    housingAllowance: 2100,
    transportAllowance: 1400,
    performanceBonus: 0,
    grossPay: 17500,
    taxDeduction: 3150,
    socialSecurity: 1085,
    healthInsurance: 450,
    totalDeductions: 4685,
    netPay: 12815,
    paymentStatus: 'Paid',
    bankAccountMasked: '•••• 4410 (Wells Fargo)'
  },
  {
    id: 'SLIP-5003',
    payrollRunId: 'PAY-TECH-09',
    tenantId: 'tenant-techcorp',
    employeeId: 'EMP-5003',
    employeeName: 'Julian Sterling',
    role: 'Director of Global Payroll & Comp',
    department: 'Finance',
    period: 'September 2026',
    payDate: '2026-09-30',
    basicSalary: 11666.67,
    housingAllowance: 1750,
    transportAllowance: 1166.66,
    performanceBonus: 0,
    grossPay: 14583.33,
    taxDeduction: 2625,
    socialSecurity: 904.16,
    healthInsurance: 450,
    totalDeductions: 3979.16,
    netPay: 10604.17,
    paymentStatus: 'Paid',
    bankAccountMasked: '•••• 6721 (Citibank)'
  }
];

export const INITIAL_JOBS: JobRequisition[] = [
  {
    id: 'JOB-301',
    tenantId: 'tenant-techcorp',
    title: 'Staff Distributed Systems Engineer',
    department: 'Engineering',
    location: 'Austin, TX / Hybrid',
    type: 'Full-Time',
    status: 'open',
    applicantCount: 38,
    postedDate: '2026-09-10',
    hiringManager: 'Alexander Wright (CTO)',
    salaryRange: '$180k - $215k + Equity',
    description: 'Lead the architecture of our multi-tenant distributed data layer handling 50k+ transactions per minute.'
  },
  {
    id: 'JOB-302',
    tenantId: 'tenant-techcorp',
    title: 'Principal AI Alignment Scientist',
    department: 'Applied AI',
    location: 'San Francisco, CA',
    type: 'Full-Time',
    status: 'interviewing',
    applicantCount: 29,
    postedDate: '2026-09-04',
    hiringManager: 'Maya Nakamura (VP AI)',
    salaryRange: '$210k - $245k',
    description: 'Direct reinforcement learning fine-tuning and evaluation harnesses for autonomous agent task planning.'
  }
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'CAND-701',
    tenantId: 'tenant-techcorp',
    jobId: 'JOB-301',
    jobTitle: 'Staff Distributed Systems Engineer',
    name: 'Alexander Novak',
    email: 'alex.novak@devmail.io',
    phone: '+1 (415) 555-7721',
    stage: 'interview',
    experienceYears: 9,
    currentCompany: 'Datadog / Ex-Stripe',
    matchScore: 94,
    appliedDate: '2026-09-14',
    interviewerRating: 4.8,
    notes: 'Exceptional deep dive on Raft consensus and multi-region database sharding. Strong cultural addition.',
    skills: ['Go', 'Rust', 'Kubernetes', 'Distributed Systems', 'Kafka']
  },
  {
    id: 'CAND-702',
    tenantId: 'tenant-techcorp',
    jobId: 'JOB-301',
    jobTitle: 'Staff Distributed Systems Engineer',
    name: 'Samantha Wright',
    email: 'samantha.w@cloudtech.com',
    phone: '+1 (408) 555-3211',
    stage: 'screening',
    experienceYears: 7,
    currentCompany: 'Snowflake',
    matchScore: 88,
    appliedDate: '2026-09-20',
    interviewerRating: 4.2,
    notes: 'Solid system design fundamentals. Recruiter screening completed; moving to hiring manager sync.',
    skills: ['Java', 'C++', 'AWS Architecture', 'gRPC', 'PostgreSQL']
  },
  {
    id: 'CAND-703',
    tenantId: 'tenant-techcorp',
    jobId: 'JOB-301',
    jobTitle: 'Staff Distributed Systems Engineer',
    name: 'Kenji Takahashi',
    email: 'kenji.t@tokyo-ops.net',
    phone: '+1 (206) 555-8832',
    stage: 'offer',
    experienceYears: 11,
    currentCompany: 'AWS DynamoDB Team',
    matchScore: 98,
    appliedDate: '2026-09-08',
    interviewerRating: 5.0,
    notes: 'Unanimous strong hire across all 4 interview rounds. Offer letter dispatched with $210k base.',
    skills: ['Distributed Storage', 'Rust', 'Erlang', 'Zero-Downtime Migrations']
  },
  {
    id: 'CAND-704',
    tenantId: 'tenant-techcorp',
    jobId: 'JOB-302',
    jobTitle: 'Principal AI Alignment Scientist',
    name: 'Dr. Lucas Tremblay',
    email: 'lucas.t@mila.quebec.ca',
    phone: '+1 (514) 555-4422',
    stage: 'interview',
    experienceYears: 8,
    currentCompany: 'DeepMind Research',
    matchScore: 96,
    appliedDate: '2026-09-18',
    interviewerRating: 4.9,
    notes: 'Published 4 NeurIPS papers on policy gradient stabilization. Ideal fit for core engine.',
    skills: ['PyTorch', 'JAX', 'RLHF', 'Transformer Architectures', 'CUDA']
  }
];

export const AI_PRESETS = {
  jobDescriptions: [
    {
      title: 'Lead Full-Stack Platform Engineer',
      department: 'Engineering',
      seniority: 'Lead / Staff',
      keySkills: 'React 19, TypeScript, Node.js, GraphQL, PostgreSQL, Multi-tenancy, AWS',
      overview: 'Seeking an experienced platform engineer to build enterprise-grade cloud applications with high performance, rigorous security, and zero-downtime scalability.'
    },
    {
      title: 'Senior People Partner (HRBP)',
      department: 'Human Resources',
      seniority: 'Senior',
      keySkills: 'Employee Relations, Performance Management, Org Design, Compensation Benchmarking, HRMS',
      overview: 'Partner with executive engineering leaders to architect scalable team growth, talent development strategies, and high-performance retention programs.'
    }
  ],
  performanceReviewPrompts: [
    {
      employeeName: 'Sarah Chen',
      role: 'VP of Engineering',
      achievements: 'Shipped zero-downtime multi-region database migration; mentored 4 engineers to Senior; maintained 99.99% system SLA.',
      growthAreas: 'Delegation of day-to-day triage to staff leads; cross-functional communication with sales on release dates.',
      rating: 'Exceeds Expectations (4.8/5.0)'
    },
    {
      employeeName: 'David Kim',
      role: 'Senior People Operations Manager',
      achievements: 'Revamped onboarding workflow reducing cycle time by 40%; rolled out new compensation bands across 6 departments.',
      growthAreas: 'Automating compliance audit tracking; expanding international contractor support.',
      rating: 'Consistently Meets & Exceeds (4.4/5.0)'
    }
  ],
  samplePolicies: [
    {
      title: 'Remote Work & Expense Reimbursement Policy',
      category: 'Workplace Operations',
      summary: 'Guidelines on remote equipment stipend ($1,200 annual), high-speed internet subsidies ($75/month), core hours (10 AM - 4 PM EST), and travel reimbursement thresholds.'
    },
    {
      title: 'Parental Leave & Family Support Program',
      category: 'Benefits & Wellness',
      summary: '16 weeks of 100% paid parental leave for primary caregivers, 8 weeks for secondary caregivers, flexible return-to-work phase, and $5,000 adoption/surrogacy assistance.'
    },
    {
      title: 'Performance-Based Stock Option & Bonus Schedule',
      category: 'Compensation',
      summary: 'Annual merit review cadence in October with standard 4-year vesting (1-year cliff), quarterly bonus multipliers pegged to company EBITDA targets and individual OKRs.'
    }
  ]
};

export const INITIAL_EXPENSES: ExpenseClaim[] = [
  {
    id: 'EXP-101',
    tenantId: 'tenant-techcorp',
    employeeId: 'EMP-2001',
    employeeName: 'Dr. Aris Thorne',
    department: 'Artificial Intelligence',
    category: 'Travel',
    amount: 1420.00,
    currency: '$',
    merchant: 'Delta Airlines & Marriott Hotels',
    transactionDate: '2026-09-14',
    submittedAt: '2026-09-16',
    status: 'approved',
    receiptName: 'Delta_Flight_Marriott_Invoice.pdf',
    notes: 'Keynote presentation and technical panel at NeurIPS Global AI Summit.',
    approvedBy: 'Sarah Jenkins (HR Manager)',
    approvedAt: '2026-09-18',
    pushedToPayroll: true
  },
  {
    id: 'EXP-102',
    tenantId: 'tenant-techcorp',
    employeeId: 'EMP-2002',
    employeeName: 'Elena Rostova',
    department: 'Platform Architecture',
    category: 'Home Office',
    amount: 480.00,
    currency: '$',
    merchant: 'Herman Miller & Dell Direct',
    transactionDate: '2026-09-18',
    submittedAt: '2026-09-20',
    status: 'pending',
    receiptName: 'Ergonomic_Setup_Invoice_2026.pdf',
    notes: 'Annual ergonomic home office stipend for standing desk arm and lumbar support chair.'
  },
  {
    id: 'EXP-103',
    tenantId: 'tenant-techcorp',
    employeeId: 'EMP-2003',
    employeeName: 'Marcus Vance',
    department: 'DevOps & SRE',
    category: 'Software/Tools',
    amount: 1250.00,
    currency: '$',
    merchant: 'Datadog & JetBrains Enterprise',
    transactionDate: '2026-09-10',
    submittedAt: '2026-09-12',
    status: 'approved',
    receiptName: 'Datadog_Annual_Pro_Licensing.pdf',
    notes: 'Annual telemetry team seat licenses and IDE plugins for SRE cluster monitoring.',
    approvedBy: 'Sarah Jenkins (HR Manager)',
    approvedAt: '2026-09-15',
    pushedToPayroll: true
  },
  {
    id: 'EXP-104',
    tenantId: 'tenant-techcorp',
    employeeId: 'EMP-2004',
    employeeName: 'Priya Sharma',
    department: 'Cybersecurity',
    category: 'Client Meal',
    amount: 195.50,
    currency: '$',
    merchant: 'The Capital Grille - Austin',
    transactionDate: '2026-09-22',
    submittedAt: '2026-09-23',
    status: 'pending',
    receiptName: 'Client_Dinner_Receipt_Sep22.jpg',
    notes: 'Security audit debrief and compliance sign-off dinner with Tier-1 enterprise partner.'
  },
  {
    id: 'EXP-105',
    tenantId: 'tenant-techcorp',
    employeeId: 'EMP-2005',
    employeeName: 'Liam O\'Connor',
    department: 'Product Management',
    category: 'Wellness',
    amount: 150.00,
    currency: '$',
    merchant: 'Equinox Austin Gym & Spa',
    transactionDate: '2026-09-01',
    submittedAt: '2026-09-02',
    status: 'disbursed',
    receiptName: 'Equinox_Membership_Sep.pdf',
    notes: 'Q3 Wellness and fitness subsidy reimbursement.',
    approvedBy: 'Sarah Jenkins (HR Manager)',
    approvedAt: '2026-09-05',
    pushedToPayroll: true
  },
  // Acme Corp Initial Expenses
  {
    id: 'EXP-201',
    tenantId: 'tenant-acme',
    employeeId: 'EMP-1001',
    employeeName: 'Sarah Chen',
    department: 'Engineering',
    category: 'Travel',
    amount: 890.00,
    currency: '$',
    merchant: 'United Airlines & Hyatt Regency',
    transactionDate: '2026-09-12',
    submittedAt: '2026-09-14',
    status: 'pending',
    receiptName: 'United_Hyatt_Conference.pdf',
    notes: 'Quarterly board meeting and executive offsite travel in SF.'
  }
];

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'AST-501',
    tenantId: 'tenant-techcorp',
    name: 'Apple MacBook Pro 16" M3 Max (64GB, 1TB SSD)',
    category: 'Laptop',
    serialNumber: 'C02G90XYZM3-99',
    assignedToEmployeeId: 'EMP-2001',
    assignedToName: 'Dr. Aris Thorne',
    department: 'Artificial Intelligence',
    condition: 'Brand New',
    allocatedDate: '2023-11-15',
    status: 'allocated',
    purchasePrice: 3899
  },
  {
    id: 'AST-502',
    tenantId: 'tenant-techcorp',
    name: 'Dell Latitude 5440 Core i7 (32GB RAM)',
    category: 'Laptop',
    serialNumber: 'DL-5440-X8812',
    assignedToEmployeeId: 'EMP-2003',
    assignedToName: 'Marcus Vance',
    department: 'DevOps & SRE',
    condition: 'Good',
    allocatedDate: '2024-02-01',
    status: 'allocated',
    purchasePrice: 1650
  },
  {
    id: 'AST-503',
    tenantId: 'tenant-techcorp',
    name: 'Dell UltraSharp 27" 4K USB-C Hub Monitor',
    category: 'Monitor',
    serialNumber: 'DELL-U2723QE-4091',
    assignedToEmployeeId: 'EMP-2002',
    assignedToName: 'Elena Rostova',
    department: 'Platform Architecture',
    condition: 'Brand New',
    allocatedDate: '2024-01-20',
    status: 'allocated',
    purchasePrice: 620
  },
  {
    id: 'AST-504',
    tenantId: 'tenant-techcorp',
    name: 'YubiKey 5C NFC Enterprise Hardware Security Key',
    category: 'Security Key',
    serialNumber: 'YK-5C-990141',
    assignedToEmployeeId: 'EMP-2004',
    assignedToName: 'Priya Sharma',
    department: 'Cybersecurity',
    condition: 'Brand New',
    allocatedDate: '2024-04-10',
    status: 'allocated',
    purchasePrice: 75
  },
  {
    id: 'AST-505',
    tenantId: 'tenant-techcorp',
    name: 'Apple MacBook Air 15" M3 (24GB, 512GB)',
    category: 'Laptop',
    serialNumber: 'C02MA-15M3-104',
    assignedToEmployeeId: 'EMP-2005',
    assignedToName: 'Liam O\'Connor',
    department: 'Product Management',
    condition: 'Good',
    allocatedDate: '2024-03-01',
    status: 'allocated',
    purchasePrice: 1699
  },
  {
    id: 'AST-506',
    tenantId: 'tenant-techcorp',
    name: 'Apple Studio Display 27" 5K Retina',
    category: 'Monitor',
    serialNumber: 'APL-SD-5K-8812',
    condition: 'Brand New',
    status: 'in_inventory',
    purchasePrice: 1599
  },
  {
    id: 'AST-507',
    tenantId: 'tenant-techcorp',
    name: 'ThinkPad X1 Carbon Gen 12 (32GB)',
    category: 'Laptop',
    serialNumber: 'TP-X1C-G12-004',
    condition: 'Brand New',
    status: 'in_inventory',
    purchasePrice: 2199
  },
  // Acme Corp Assets
  {
    id: 'AST-601',
    tenantId: 'tenant-acme',
    name: 'MacBook Pro 14" M3 Pro (36GB RAM)',
    category: 'Laptop',
    serialNumber: 'ACME-MBP-14-01',
    assignedToEmployeeId: 'EMP-1001',
    assignedToName: 'Sarah Chen',
    department: 'Engineering',
    condition: 'Good',
    allocatedDate: '2022-03-15',
    status: 'allocated',
    purchasePrice: 2399
  }
];

export const INITIAL_EXIT_CLEARANCES: ExitClearance[] = [
  {
    id: 'EXIT-301',
    tenantId: 'tenant-techcorp',
    employeeId: 'EMP-2006',
    employeeName: 'Chen Wei',
    role: 'Distributed Systems Architect',
    department: 'Platform Architecture',
    resignationDate: '2026-08-16',
    lastWorkingDay: '2026-10-15',
    noticePeriodDays: 60,
    reason: 'Relocating to Singapore for entrepreneurial venture in AI robotics.',
    itClearance: true,
    adminClearance: false,
    financeClearance: false,
    hrExitInterview: true,
    ffStatus: 'calculated',
    gratuityAmount: 8500,
    leaveEncashmentDays: 7,
    leaveEncashmentAmount: 3850,
    noticePeriodPay: 16500,
    deductionsAmount: 420,
    netSettlementAmount: 28430
  },
  {
    id: 'EXIT-302',
    tenantId: 'tenant-acme',
    employeeId: 'EMP-1002',
    employeeName: 'Michael Scott',
    role: 'Lead Full-Stack Engineer',
    department: 'Engineering',
    resignationDate: '2026-08-20',
    lastWorkingDay: '2026-10-20',
    noticePeriodDays: 60,
    reason: 'Pursuing senior technical director role at startup.',
    itClearance: false,
    adminClearance: false,
    financeClearance: false,
    hrExitInterview: false,
    ffStatus: 'draft',
    gratuityAmount: 5200,
    leaveEncashmentDays: 5,
    leaveEncashmentAmount: 2400,
    noticePeriodPay: 12000,
    deductionsAmount: 0,
    netSettlementAmount: 19600
  }
];

