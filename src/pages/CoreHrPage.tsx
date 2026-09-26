import React, { useState, useMemo } from 'react';
import { useTenant } from '../context/TenantContext';
import { ModuleGuard } from '../components/common/ModuleGuard';
import { Employee } from '../types/hrms';
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  DollarSign, 
  X, 
  Trash2,
  GitFork,
  Calendar,
  LayoutGrid,
  List,
  Edit3,
  Award
} from 'lucide-react';

export const CoreHrPage: React.FC = () => {
  return (
    <ModuleGuard module="core_hr">
      <CoreHrContent />
    </ModuleGuard>
  );
};

const CoreHrContent: React.FC = () => {
  const { currentTenant, employees, addEmployee, updateEmployee, deleteEmployee } = useTenant();

  const [activeTab, setActiveTab] = useState<'directory' | 'org_chart'>('directory');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditStatusModalOpen, setIsEditStatusModalOpen] = useState(false);
  const [statusTargetEmployee, setStatusTargetEmployee] = useState<Employee | null>(null);
  const [newStatusValue, setNewStatusValue] = useState<Employee['status']>('active');

  // New Employee Form State
  const [newEmpData, setNewEmpData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    department: 'Engineering',
    location: currentTenant.headquarters,
    salary: 125000,
    phone: '+1 (415) 555-0199',
    employmentType: 'Full-Time' as const,
    manager: 'Sarah Chen',
    status: 'active' as Employee['status'],
    joinDate: new Date().toISOString().split('T')[0]
  });

  const departments = useMemo(() => {
    const set = new Set(employees.map(e => e.department));
    return ['All', ...Array.from(set)];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = 
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = selectedDept === 'All' || emp.department === selectedDept;
      const matchStatus = selectedStatus === 'All' || emp.status === selectedStatus;
      return matchSearch && matchDept && matchStatus;
    });
  }, [employees, searchQuery, selectedDept, selectedStatus]);

  // Status stats summary
  const statusStats = useMemo(() => {
    return {
      active: employees.filter(e => e.status === 'active').length,
      probation: employees.filter(e => e.status === 'probation').length,
      notice: employees.filter(e => e.status === 'notice').length,
      on_leave: employees.filter(e => e.status === 'on_leave').length,
      total: employees.length
    };
  }, [employees]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEmployee({
      firstName: newEmpData.firstName.trim(),
      lastName: newEmpData.lastName.trim(),
      email: newEmpData.email.trim(),
      role: newEmpData.role.trim(),
      department: newEmpData.department,
      location: newEmpData.location,
      salary: Number(newEmpData.salary),
      phone: newEmpData.phone,
      employmentType: newEmpData.employmentType,
      status: newEmpData.status,
      joinDate: newEmpData.joinDate,
      manager: newEmpData.manager,
      leaveBalance: { 
        paid: newEmpData.status === 'probation' ? 6 : 14, 
        sick: newEmpData.status === 'probation' ? 4 : 8, 
        casual: newEmpData.status === 'probation' ? 3 : 6, 
        parental: 0 
      }
    });
    setIsAddModalOpen(false);
    setNewEmpData({
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      department: 'Engineering',
      location: currentTenant.headquarters,
      salary: 125000,
      phone: '+1 (415) 555-0199',
      employmentType: 'Full-Time',
      manager: 'Sarah Chen',
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleStatusChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (statusTargetEmployee) {
      updateEmployee(statusTargetEmployee.id, { status: newStatusValue });
      if (selectedEmployee?.id === statusTargetEmployee.id) {
        setSelectedEmployee({ ...selectedEmployee, status: newStatusValue });
      }
      setIsEditStatusModalOpen(false);
      setStatusTargetEmployee(null);
    }
  };

  const getStatusBadge = (status: Employee['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Active
          </span>
        );
      case 'probation':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Probation
          </span>
        );
      case 'notice':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            Notice Period
          </span>
        );
      case 'on_leave':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            On Leave
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Core HR Employee Master
            </h1>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
              {employees.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Workforce directory, profile cards, reporting hierarchy, and employee lifecycles for {currentTenant.name}.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Main View Tabs */}
          <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'directory'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Directory Master
            </button>
            <button
              onClick={() => setActiveTab('org_chart')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'org_chart'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Org Hierarchy
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Quick Status KPI Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setSelectedStatus(selectedStatus === 'active' ? 'All' : 'active')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedStatus === 'active'
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Active Staff</span>
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1">{statusStats.active}</div>
        </button>

        <button
          onClick={() => setSelectedStatus(selectedStatus === 'probation' ? 'All' : 'probation')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedStatus === 'probation'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Probation Period</span>
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1">{statusStats.probation}</div>
        </button>

        <button
          onClick={() => setSelectedStatus(selectedStatus === 'notice' ? 'All' : 'notice')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedStatus === 'notice'
              ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Serving Notice</span>
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
          </div>
          <div className="text-xl font-bold font-mono text-rose-700 mt-1">{statusStats.notice}</div>
        </button>

        <button
          onClick={() => setSelectedStatus(selectedStatus === 'on_leave' ? 'All' : 'on_leave')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedStatus === 'on_leave'
              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>On Leave</span>
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          </div>
          <div className="text-xl font-bold font-mono text-blue-700 mt-1">{statusStats.on_leave}</div>
        </button>
      </div>

      {activeTab === 'directory' ? (
        <>
          {/* Filters Bar & View Mode Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[220px] max-w-md bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by name, role, email, manager..."
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

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Department Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="hidden sm:inline font-medium">Dept:</span>
                <select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-medium shadow-2xs"
                >
                  {departments.map(d => (
                    <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="hidden sm:inline font-medium">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-medium shadow-2xs"
                >
                  <option value="All">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="probation">Probation</option>
                  <option value="notice">Notice</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>

              {/* View Switcher Button Group */}
              <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'cards' ? 'bg-white text-blue-600 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Profile Cards Grid"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Table List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Badges */}
          {(selectedDept !== 'All' || selectedStatus !== 'All' || searchQuery) && (
            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <span className="font-medium">Filtered by:</span>
              {selectedDept !== 'All' && (
                <span className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 flex items-center gap-1 font-medium shadow-2xs">
                  Dept: {selectedDept}
                  <button onClick={() => setSelectedDept('All')} className="hover:text-rose-600"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedStatus !== 'All' && (
                <span className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 flex items-center gap-1 font-medium shadow-2xs">
                  Status: {selectedStatus}
                  <button onClick={() => setSelectedStatus('All')} className="hover:text-rose-600"><X className="w-3 h-3" /></button>
                </span>
              )}
              {searchQuery && (
                <span className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 flex items-center gap-1 font-medium shadow-2xs">
                  Query: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-rose-600"><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedDept('All');
                  setSelectedStatus('All');
                  setSearchQuery('');
                }}
                className="text-xs text-blue-600 hover:underline ml-1 font-semibold"
              >
                Clear all
              </button>
            </div>
          )}

          {/* View 1: Comprehensive Employee Profile Cards */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-white border border-slate-200 rounded-xl shadow-xs">
                  <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">No employees match your search</p>
                  <p className="text-xs text-slate-500 mt-1">Try resetting the department or status filters.</p>
                </div>
              ) : (
                filteredEmployees.map(emp => {
                  const initials = `${emp.firstName[0]}${emp.lastName[0]}`;
                  return (
                    <div
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp)}
                      className="bg-white hover:border-blue-300 border border-slate-200 rounded-xl p-5 transition-all shadow-xs group cursor-pointer relative flex flex-col justify-between hover:shadow-sm"
                    >
                      {/* Top Bar: Avatar, Names, Status */}
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                {emp.firstName} {emp.lastName}
                              </h3>
                              <p className="text-xs font-medium text-slate-600 truncate">
                                {emp.role}
                              </p>
                              <span className="text-[10px] text-blue-600 font-mono font-medium">
                                ID: {emp.id}
                              </span>
                            </div>
                          </div>
                          <div>
                            {getStatusBadge(emp.status)}
                          </div>
                        </div>

                        {/* Core Details Grid */}
                        <div className="space-y-2 py-2.5 border-y border-slate-100 text-xs">
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-500 flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              Department
                            </span>
                            <span className="font-semibold text-slate-800">{emp.department}</span>
                          </div>

                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-500 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              Date of Joining
                            </span>
                            <span className="font-mono text-slate-700">{formatDate(emp.joinDate)}</span>
                          </div>

                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-500 flex items-center gap-1.5">
                              <GitFork className="w-3.5 h-3.5 text-slate-400" />
                              Reporting Manager
                            </span>
                            <span className="text-blue-700 font-medium truncate max-w-[140px]">{emp.manager}</span>
                          </div>

                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-500 flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              Work Email
                            </span>
                            <span className="font-mono text-slate-700 truncate max-w-[150px] text-[11px]">{emp.email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer: Salary & Actions */}
                      <div className="mt-3 pt-2 flex items-center justify-between">
                        <div className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ${(emp.salary / 1000).toFixed(0)}k/yr
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setStatusTargetEmployee(emp);
                              setNewStatusValue(emp.status);
                              setIsEditStatusModalOpen(true);
                            }}
                            className="px-2 py-1 text-[11px] text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors font-medium"
                            title="Change Status"
                          >
                            Status
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEmployee(emp);
                            }}
                            className="px-2 py-1 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded font-semibold transition-colors"
                          >
                            View Card
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* View 2: Compact Enterprise Directory Table */
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Designation & Dept</th>
                      <th className="py-3 px-4">Manager</th>
                      <th className="py-3 px-4">Date of Joining</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Annual Salary</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-500 text-xs">
                          No employees found matching filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map(emp => {
                        const initials = `${emp.firstName[0]}${emp.lastName[0]}`;
                        return (
                          <tr 
                            key={emp.id}
                            onClick={() => setSelectedEmployee(emp)}
                            className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-200">
                                  {initials}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900">
                                    {emp.firstName} {emp.lastName}
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-mono">
                                    {emp.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="text-slate-900 font-semibold">{emp.role}</div>
                              <div className="text-[11px] text-slate-500">{emp.department}</div>
                            </td>

                            <td className="py-3 px-4 text-slate-700">
                              <span className="text-blue-700 font-medium">{emp.manager}</span>
                            </td>

                            <td className="py-3 px-4 font-mono text-slate-700">
                              {formatDate(emp.joinDate)}
                            </td>

                            <td className="py-3 px-4">
                              {getStatusBadge(emp.status)}
                            </td>

                            <td className="py-3 px-4 font-mono text-slate-800 tabular-nums font-semibold">
                              ${(emp.salary / 1000).toFixed(0)}k / yr
                            </td>

                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEmployee(emp);
                                }}
                                className="text-blue-600 hover:text-blue-700 font-semibold text-xs mr-3"
                              >
                                View
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteEmployee(emp.id);
                                }}
                                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                title="Archive Employee"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Org Hierarchy Tree Tab */
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Organizational Reporting Tree</h2>
              <p className="text-xs text-slate-500">Leadership hierarchy and reporting lines for {currentTenant.name}</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Root: Executive Board / CEO
            </span>
          </div>

          <div className="space-y-4">
            {/* CEO Level */}
            <div className="p-4 bg-slate-50 border border-blue-200 rounded-xl max-w-md mx-auto text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold mx-auto flex items-center justify-center text-sm mb-2 shadow-xs">
                CEO
              </div>
              <div className="text-sm font-bold text-slate-900">Executive Leadership Office</div>
              <div className="text-xs text-blue-700 font-mono font-medium">{currentTenant.name} ({currentTenant.headquarters})</div>
            </div>

            <div className="w-px h-6 bg-slate-300 mx-auto" />

            {/* Department Heads Level */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {employees.slice(0, 3).map(lead => (
                <div key={lead.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-center hover:border-slate-300 transition-all shadow-2xs">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold mx-auto flex items-center justify-center text-xs border border-blue-200">
                    {lead.firstName[0]}{lead.lastName[0]}
                  </div>
                  <div className="text-xs font-bold text-slate-900">{lead.firstName} {lead.lastName}</div>
                  <div className="text-[11px] text-slate-600">{lead.role}</div>
                  <div className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block font-semibold">
                    {lead.department}
                  </div>
                  <div className="text-[10px] text-slate-500 block">Reports to: {lead.manager}</div>
                </div>
              ))}
            </div>

            <div className="w-px h-6 bg-slate-300 mx-auto" />

            {/* Team Members Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {employees.slice(3).map(member => (
                <div key={member.id} className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg text-center space-y-1">
                  <div className="text-xs font-bold text-slate-800">{member.firstName} {member.lastName}</div>
                  <div className="text-[10px] text-slate-600 truncate">{member.role}</div>
                  <div className="text-[9px] font-mono text-blue-700">Reports to {member.manager}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Employee Detail Profile Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative space-y-5 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedEmployee(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-xs shrink-0">
                {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                  {getStatusBadge(selectedEmployee.status)}
                </div>
                <div className="text-xs text-blue-700 font-semibold mt-0.5">
                  {selectedEmployee.role} · {selectedEmployee.department}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Tenant: <span className="text-slate-800 font-medium">{currentTenant.name}</span> ({currentTenant.slug}) · ID: {selectedEmployee.id}
                </div>
              </div>
            </div>

            {/* Key Information Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-500 text-[11px] flex items-center gap-1 font-medium">
                  <Mail className="w-3 h-3 text-slate-400" /> Work Email
                </span>
                <span className="text-slate-900 font-mono font-medium block truncate">{selectedEmployee.email}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-500 text-[11px] flex items-center gap-1 font-medium">
                  <Phone className="w-3 h-3 text-slate-400" /> Phone Number
                </span>
                <span className="text-slate-900 font-mono block">{selectedEmployee.phone}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-500 text-[11px] flex items-center gap-1 font-medium">
                  <Calendar className="w-3 h-3 text-slate-400" /> Date of Joining
                </span>
                <span className="text-slate-900 font-mono block">{formatDate(selectedEmployee.joinDate)}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-500 text-[11px] flex items-center gap-1 font-medium">
                  <GitFork className="w-3 h-3 text-slate-400" /> Reporting Manager
                </span>
                <span className="text-blue-700 font-semibold block">{selectedEmployee.manager}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-500 text-[11px] flex items-center gap-1 font-medium">
                  <DollarSign className="w-3 h-3 text-emerald-600" /> Annual Base Comp
                </span>
                <span className="text-emerald-800 font-mono font-bold block">${selectedEmployee.salary.toLocaleString()} / yr</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-500 text-[11px] flex items-center gap-1 font-medium">
                  <MapPin className="w-3 h-3 text-slate-400" /> Work Location
                </span>
                <span className="text-slate-900 block truncate">{selectedEmployee.location}</span>
              </div>
            </div>

            {/* Leave Balance Overview in Profile */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-600" />
                  Leave Entitlements & Remaining Balances
                </span>
                <span className="text-[10px] text-slate-500 font-mono">FY 2026</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                  <div className="font-mono text-emerald-700 font-bold text-sm">{selectedEmployee.leaveBalance.paid}</div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">Paid Leave</div>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                  <div className="font-mono text-blue-700 font-bold text-sm">{selectedEmployee.leaveBalance.sick}</div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">Sick Leave</div>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                  <div className="font-mono text-amber-700 font-bold text-sm">{selectedEmployee.leaveBalance.casual}</div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">Casual Leave</div>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                  <div className="font-mono text-indigo-700 font-bold text-sm">{selectedEmployee.leaveBalance.parental || 12}w</div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">Parental</div>
                </div>
              </div>
            </div>

            {/* Quick Profile Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setStatusTargetEmployee(selectedEmployee);
                  setNewStatusValue(selectedEmployee.status);
                  setIsEditStatusModalOpen(true);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Change Status
              </button>

              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Add Employee to Directory
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Add new employee master record to <strong className="text-slate-800">{currentTenant.name}</strong>.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane"
                    value={newEmpData.firstName}
                    onChange={e => setNewEmpData({ ...newEmpData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Doe"
                    value={newEmpData.lastName}
                    onChange={e => setNewEmpData({ ...newEmpData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="jane.doe@company.com"
                  value={newEmpData.email}
                  onChange={e => setNewEmpData({ ...newEmpData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation / Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="Senior Full Stack Engineer"
                    value={newEmpData.role}
                    onChange={e => setNewEmpData({ ...newEmpData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    value={newEmpData.department}
                    onChange={e => setNewEmpData({ ...newEmpData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                    <option value="Applied AI">Applied AI</option>
                    <option value="Research & Labs">Research & Labs</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Joining *</label>
                  <input
                    type="date"
                    required
                    value={newEmpData.joinDate}
                    onChange={e => setNewEmpData({ ...newEmpData, joinDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reporting Manager *</label>
                  <select
                    value={newEmpData.manager}
                    onChange={e => setNewEmpData({ ...newEmpData, manager: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                  >
                    <option value="CEO">CEO / Executive Board</option>
                    {employees.map(e => (
                      <option key={e.id} value={`${e.firstName} ${e.lastName}`}>
                        {e.firstName} {e.lastName} ({e.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Status</label>
                  <select
                    value={newEmpData.status}
                    onChange={e => setNewEmpData({ ...newEmpData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                  >
                    <option value="active">Active</option>
                    <option value="probation">Probation (3 Months)</option>
                    <option value="notice">Notice Period</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Base Salary ($)</label>
                  <input
                    type="number"
                    required
                    min={10000}
                    step={5000}
                    value={newEmpData.salary}
                    onChange={e => setNewEmpData({ ...newEmpData, salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newEmpData.phone}
                    onChange={e => setNewEmpData({ ...newEmpData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Work Location</label>
                  <input
                    type="text"
                    value={newEmpData.location}
                    onChange={e => setNewEmpData({ ...newEmpData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  Save & Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Status Quick Modal */}
      {isEditStatusModalOpen && statusTargetEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsEditStatusModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-slate-900">
              Update Employment Status
            </h3>
            <p className="text-xs text-slate-500">
              Select new lifecycle status for <strong className="text-slate-900">{statusTargetEmployee.firstName} {statusTargetEmployee.lastName}</strong>:
            </p>

            <form onSubmit={handleStatusChangeSubmit} className="space-y-3">
              <div className="space-y-2">
                {(['active', 'probation', 'notice', 'on_leave'] as Employee['status'][]).map(st => (
                  <label
                    key={st}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                      newStatusValue === st
                        ? 'bg-blue-50 border-blue-300 text-slate-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="status"
                        value={st}
                        checked={newStatusValue === st}
                        onChange={() => setNewStatusValue(st)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="capitalize text-xs">{st.replace('_', ' ')}</span>
                    </div>
                    {getStatusBadge(st)}
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditStatusModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
