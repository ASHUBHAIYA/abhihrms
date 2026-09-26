import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { ModuleGuard } from '../components/common/ModuleGuard';
import { Asset, ExitClearance } from '../types/hrms';
import { printElement, downloadDocumentAsHtml, exportToCsv } from '../utils/printUtils';
import { 
  Laptop, 
  Users, 
  CheckSquare, 
  Square, 
  Plus, 
  ShieldCheck, 
  Key, 
  CreditCard, 
  UserCheck, 
  AlertTriangle, 
  Calendar, 
  Receipt, 
  FileCheck, 
  RefreshCw, 
  Check, 
  X, 
  Printer, 
  Download, 
  HardDrive, 
  Monitor, 
  Smartphone, 
  Sparkles,
  ArrowRight,
  Clock,
  FileSpreadsheet,
  Lock
} from 'lucide-react';

export const LifecyclePage: React.FC = () => {
  return (
    <ModuleGuard module="lifecycle">
      <LifecycleContent />
    </ModuleGuard>
  );
};

const LifecycleContent: React.FC = () => {
  const { 
    currentTenant, 
    employees, 
    assets, 
    assignAsset, 
    unassignAsset, 
    createAsset, 
    exitClearances, 
    toggleClearanceItem, 
    calculateFandF, 
    settleFandF, 
    currentUser,
    hasPermission,
    showToast 
  } = useTenant();

  const canManageAssets = hasPermission('manage_assets');
  const canManageExitClearance = hasPermission('manage_exit_clearance');

  // Sub-tabs: Asset Tracking vs Exit Clearance & F&F
  const [activeTab, setActiveTab] = useState<'assets' | 'exit_clearance'>('assets');

  // Asset Filter
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<string>('All');
  const [assetStatusFilter, setAssetStatusFilter] = useState<string>('All');

  // Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRegisterAssetModalOpen, setIsRegisterAssetModalOpen] = useState(false);
  const [selectedAssetForAssign, setSelectedAssetForAssign] = useState<Asset | null>(null);
  const [targetEmployeeId, setTargetEmployeeId] = useState<string>(employees[0]?.id || 'EMP-1001');

  // New Asset Form State
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState<Asset['category']>('Laptop');
  const [newAssetSerial, setNewAssetSerial] = useState('');
  const [newAssetPrice, setNewAssetPrice] = useState('1899');
  const [newAssetCondition, setNewAssetCondition] = useState<Asset['condition']>('Brand New');

  // F&F Detail Modal State
  const [selectedExitForFandF, setSelectedExitForFandF] = useState<ExitClearance | null>(null);

  // CSV Exporters
  const handleExportAssetsCsv = () => {
    const data = filteredAssets.map(a => ({
      'Asset ID': a.id,
      'Device Name': a.name,
      'Category': a.category,
      'Serial Number': a.serialNumber,
      'Assigned Employee': a.assignedToName || 'Unassigned',
      'Department': a.department || 'IT Warehouse',
      'Condition': a.condition,
      'Purchase Price ($)': a.purchasePrice,
      'Status': a.status === 'allocated' ? 'Allocated' : 'In Inventory',
      'Allocation Date': a.allocatedDate || 'N/A'
    }));
    exportToCsv(data, `Hardware_Asset_Inventory_${currentTenant.slug}.csv`);
    showToast('Export Complete', 'Hardware asset inventory exported to CSV.', 'success');
  };

  const handleExportExitsCsv = () => {
    const data = exitClearances.map(e => ({
      'Exit ID': e.id,
      'Employee': e.employeeName,
      'Role': e.role,
      'Department': e.department,
      'Last Working Day': e.lastWorkingDay,
      'Notice Days': e.noticePeriodDays,
      'IT Clearance': e.itClearance ? 'Cleared' : 'Pending',
      'Admin Clearance': e.adminClearance ? 'Cleared' : 'Pending',
      'Finance Clearance': e.financeClearance ? 'Cleared' : 'Pending',
      'HR Interview': e.hrExitInterview ? 'Completed' : 'Pending',
      'F&F Settlement Status': e.ffStatus,
      'Net Settlement ($)': e.netSettlementAmount || 'Pending'
    }));
    exportToCsv(data, `Exit_Clearance_Pipeline_${currentTenant.slug}.csv`);
    showToast('Export Complete', 'Exit clearance records exported to CSV.', 'success');
  };

  // Asset Metrics
  const totalAssetsCount = assets.length;
  const allocatedAssetsCount = assets.filter(a => a.status === 'allocated').length;
  const inventoryAssetsCount = assets.filter(a => a.status === 'in_inventory').length;

  const filteredAssets = assets.filter(a => {
    const matchesCat = assetCategoryFilter === 'All' || a.category === assetCategoryFilter;
    const matchesStat = assetStatusFilter === 'All' || a.status === assetStatusFilter;
    return matchesCat && matchesStat;
  });

  const handleOpenAssignModal = (asset: Asset) => {
    setSelectedAssetForAssign(asset);
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAssetForAssign && targetEmployeeId) {
      assignAsset(selectedAssetForAssign.id, targetEmployeeId);
      setIsAssignModalOpen(false);
      setSelectedAssetForAssign(null);
    }
  };

  const handleCreateNewAsset = (e: React.FormEvent) => {
    e.preventDefault();
    createAsset({
      name: newAssetName,
      category: newAssetCategory,
      serialNumber: newAssetSerial || `SER-${Math.floor(100000 + Math.random() * 900000)}`,
      condition: newAssetCondition,
      status: 'in_inventory',
      purchasePrice: parseFloat(newAssetPrice) || 0
    });
    setIsRegisterAssetModalOpen(false);
    setNewAssetName('');
    setNewAssetSerial('');
  };

  const getAssetCategoryIcon = (category: Asset['category']) => {
    switch (category) {
      case 'Laptop':
        return <Laptop className="w-4 h-4 text-blue-600" />;
      case 'Monitor':
        return <Monitor className="w-4 h-4 text-indigo-600" />;
      case 'Mobile / Tablet':
        return <Smartphone className="w-4 h-4 text-emerald-600" />;
      case 'Security Key':
        return <Key className="w-4 h-4 text-amber-600" />;
      default:
        return <HardDrive className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Laptop className="w-5 h-5 text-indigo-600" />
              Asset Tracking & Employee Lifecycle
            </h1>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Module: lifecycle
            </span>
            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              {currentTenant.name}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Enterprise hardware inventory allocations, separation workflows, departmental exit clearance, and Full & Final (F&F) settlements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === 'assets' ? (
            canManageAssets ? (
              <button
                onClick={() => setIsRegisterAssetModalOpen(true)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Register New Hardware Asset
              </button>
            ) : (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Read-Only Inventory
              </span>
            )
          ) : (
            <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
              Active Exit Pipeline: {exitClearances.length}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
        <button
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'assets'
              ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Laptop className="w-4 h-4 text-indigo-600" />
          Hardware & IT Asset Allocation
          <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.2 rounded-full font-mono">
            {totalAssetsCount} Total
          </span>
        </button>

        <button
          onClick={() => setActiveTab('exit_clearance')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'exit_clearance'
              ? 'bg-white text-rose-700 shadow-xs border border-slate-200 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-rose-600" />
          Resignation & Exit Clearance Checklist
          <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.2 rounded-full font-mono">
            {exitClearances.length} Active Notice
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: HARDWARE & IT ASSET ALLOCATION                                 */}
      {/* ========================================================================= */}
      {activeTab === 'assets' && (
        <div className="space-y-6">
          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>Total Registered Hardware</span>
                <HardDrive className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{totalAssetsCount} Items</div>
              <p className="text-[11px] text-slate-500">Managed IT and physical equipment pool.</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-700">
                <span>Currently In-Use / Allocated</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-800">{allocatedAssetsCount} Items</div>
              <p className="text-[11px] text-slate-500">Assigned to verified staff members.</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blue-700">
                <span>In Storage / Unallocated</span>
                <Laptop className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-800">{inventoryAssetsCount} Items</div>
              <p className="text-[11px] text-slate-500">Ready for instant assignment to new hires.</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="font-semibold">Filter Category:</span>
              <select
                value={assetCategoryFilter}
                onChange={e => setAssetCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900"
              >
                <option value="All">All Categories</option>
                <option value="Laptop">Laptops</option>
                <option value="Monitor">Monitors</option>
                <option value="Security Key">Security Keys</option>
                <option value="Mobile / Tablet">Mobile Devices</option>
              </select>

              <span className="font-semibold ml-2">Status:</span>
              <select
                value={assetStatusFilter}
                onChange={e => setAssetStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900"
              >
                <option value="All">All Statuses</option>
                <option value="allocated">Allocated</option>
                <option value="in_inventory">In Inventory</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportAssetsCsv}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Download CSV export of hardware assets"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                Export Assets CSV
              </button>

              <span className="text-xs font-mono font-semibold text-slate-500">
                Showing {filteredAssets.length} Assets
              </span>
            </div>
          </div>

          {/* Asset Inventory Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hardware & IT Inventory Register</h3>
                <p className="text-[11px] text-slate-500">Track device assignments, serial numbers, and maintenance conditions.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Asset Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Serial Number</th>
                    <th className="py-3 px-4">Assigned Employee</th>
                    <th className="py-3 px-4">Condition</th>
                    <th className="py-3 px-4">Allocation Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                        No hardware assets found.
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map(asset => (
                      <tr key={asset.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Name */}
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {asset.name}
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-medium text-slate-700">
                            {getAssetCategoryIcon(asset.category)}
                            <span>{asset.category}</span>
                          </div>
                        </td>

                        {/* Serial */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          {asset.serialNumber}
                        </td>

                        {/* Assigned Employee */}
                        <td className="py-3.5 px-4">
                          {asset.status === 'allocated' ? (
                            <div>
                              <span className="font-bold text-slate-900 block">{asset.assignedToName}</span>
                              <span className="text-[10px] text-slate-500">{asset.department}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              Available in Storage
                            </span>
                          )}
                        </td>

                        {/* Condition */}
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                            asset.condition === 'Brand New'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {asset.condition}
                          </span>
                        </td>

                        {/* Allocation Date */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {asset.allocatedDate || '—'}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          {canManageAssets ? (
                            asset.status === 'allocated' ? (
                              <button
                                onClick={() => unassignAsset(asset.id)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-[11px] font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                              >
                                Reclaim Asset
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenAssignModal(asset)}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                              >
                                Assign Device
                              </button>
                            )
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {asset.status === 'allocated' ? 'Allocated' : 'In Storage'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: RESIGNATION & EXIT CLEARANCE CHECKLIST                         */}
      {/* ========================================================================= */}
      {activeTab === 'exit_clearance' && (
        <div className="space-y-6">
          <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                  Separation Governance
                </span>
                <span className="text-xs font-mono text-slate-500">Multi-Tier Departmental Sign-off</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Notice Period & Exit Clearance Pipeline
              </h3>
              <p className="text-xs text-slate-600">
                Manage 60/90-day separation timelines, laptop/VPN access revocation, and statutory Full & Final settlements.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportExitsCsv}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-rose-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Download CSV export of exit clearances"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                Export Exits CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {exitClearances.map((exit) => {
              const allClear = exit.itClearance && exit.adminClearance && exit.financeClearance && exit.hrExitInterview;

              return (
                <div key={exit.id} className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                  {/* Exit Card Header */}
                  <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0">
                        {exit.employeeName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900">{exit.employeeName}</h4>
                          <span className="text-xs font-mono font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {exit.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {exit.role} · <strong>{exit.department}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Notice Period:</span>
                        <span className="font-bold text-slate-900">{exit.noticePeriodDays} Days</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Last Working Day (LWD):</span>
                        <span className="font-bold text-rose-700">{exit.lastWorkingDay}</span>
                      </div>
                    </div>
                  </div>

                  {/* Separation Reason & Department Sign-offs */}
                  <div className="p-5 space-y-5">
                    <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-500 font-semibold block mb-0.5">Reason for Departure:</span>
                      <span className="text-slate-800 font-medium">{exit.reason}</span>
                    </div>

                    {/* Department Sign-off Checklist */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                          Departmental Sign-off Checklist (Interactive):
                        </h5>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Click checkbox to toggle clearance status
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* 1. IT Clearance */}
                        <div 
                          onClick={() => toggleClearanceItem(exit.id, 'itClearance')}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                            exit.itClearance 
                              ? 'bg-emerald-50/70 border-emerald-200' 
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <div className="mt-0.5">
                            {exit.itClearance ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <Laptop className="w-3.5 h-3.5 text-slate-500" />
                              IT & Hardware Clearance
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Laptop returned, GitHub & VPN access revoked, security keys handed back.
                            </p>
                          </div>
                        </div>

                        {/* 2. Admin Clearance */}
                        <div 
                          onClick={() => toggleClearanceItem(exit.id, 'adminClearance')}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                            exit.adminClearance 
                              ? 'bg-emerald-50/70 border-emerald-200' 
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <div className="mt-0.5">
                            {exit.adminClearance ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                              Admin & Operations Clearance
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Building ID badge returned, parking pass surrendered, desk cleared.
                            </p>
                          </div>
                        </div>

                        {/* 3. Finance Clearance */}
                        <div 
                          onClick={() => toggleClearanceItem(exit.id, 'financeClearance')}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                            exit.financeClearance 
                              ? 'bg-emerald-50/70 border-emerald-200' 
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <div className="mt-0.5">
                            {exit.financeClearance ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                              Finance & Expense Sign-off
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              All travel advances settled, corporate credit card reconciled & cancelled.
                            </p>
                          </div>
                        </div>

                        {/* 4. HR Exit Interview */}
                        <div 
                          onClick={() => toggleClearanceItem(exit.id, 'hrExitInterview')}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                            exit.hrExitInterview 
                              ? 'bg-emerald-50/70 border-emerald-200' 
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <div className="mt-0.5">
                            {exit.hrExitInterview ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                              HR Exit Interview & Feedback
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Confidential departure feedback recorded; NDA obligations reiterated.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* F&F Settlement Section */}
                    <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            Full & Final (F&F) Settlement Status:
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            exit.ffStatus === 'settled'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : exit.ffStatus === 'calculated'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}>
                            {exit.ffStatus}
                          </span>
                        </div>
                        {exit.netSettlementAmount ? (
                          <div className="text-xs text-slate-600">
                            Calculated Net Payout: <strong className="text-slate-900 font-mono text-sm">${exit.netSettlementAmount.toLocaleString()}</strong> (Gratuity + Leave Encashment + Notice Pay)
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500">
                            Complete clearance checks to finalize statutory gratuity and leave encashment payouts.
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            calculateFandF(exit.id);
                            setSelectedExitForFandF({
                              ...exit,
                              ffStatus: 'calculated',
                              gratuityAmount: 8500,
                              leaveEncashmentDays: 7,
                              leaveEncashmentAmount: 3850,
                              noticePeriodPay: 16500,
                              deductionsAmount: 420,
                              netSettlementAmount: 28430
                            });
                          }}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          Generate F&F Statement
                        </button>

                        {exit.ffStatus === 'calculated' && (
                          <button
                            onClick={() => settleFandF(exit.id)}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Finalize Settlement
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ASSIGN ASSET MODAL                                                       */}
      {/* ========================================================================= */}
      {isAssignModalOpen && selectedAssetForAssign && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Assign Hardware to Employee</h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssign} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[10px] block">Selected Hardware:</span>
                <span className="font-bold text-slate-900 block">{selectedAssetForAssign.name}</span>
                <span className="text-slate-500 font-mono text-[10px]">{selectedAssetForAssign.serialNumber}</span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Employee</label>
                <select
                  value={targetEmployeeId}
                  onChange={e => setTargetEmployeeId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REGISTER NEW ASSET MODAL                                                 */}
      {/* ========================================================================= */}
      {isRegisterAssetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Register New Hardware Asset</h3>
              <button onClick={() => setIsRegisterAssetModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewAsset} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Asset Name & Model</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook Pro 16 M3 Max"
                  value={newAssetName}
                  onChange={e => setNewAssetName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={newAssetCategory}
                    onChange={e => setNewAssetCategory(e.target.value as Asset['category'])}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Security Key">Security Key</option>
                    <option value="Mobile / Tablet">Mobile / Tablet</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Condition</label>
                  <select
                    value={newAssetCondition}
                    onChange={e => setNewAssetCondition(e.target.value as Asset['condition'])}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Serial Number</label>
                  <input
                    type="text"
                    placeholder="e.g. C02G90XYZ"
                    value={newAssetSerial}
                    onChange={e => setNewAssetSerial(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Purchase Cost ($)</label>
                  <input
                    type="number"
                    value={newAssetPrice}
                    onChange={e => setNewAssetPrice(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterAssetModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* F&F DETAILED BREAKDOWN MODAL                                              */}
      {/* ========================================================================= */}
      {selectedExitForFandF && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold">Full & Final (F&F) Settlement Statement</h3>
                  <p className="text-[10px] text-slate-400">Formal legal settlement for {selectedExitForFandF.employeeName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedExitForFandF(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div id="printable-ff-statement" className="p-6 space-y-4 text-xs bg-white">
              {/* Company & Statement Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    {currentTenant.logoInitials}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{currentTenant.name}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">HR Separation & Legal Compliance Division</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block">
                    FINAL SETTLEMENT
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Ref: {selectedExitForFandF.id}</span>
                </div>
              </div>

              {/* Employee Summary */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Employee Name:</span>
                  <span className="font-bold text-slate-900">{selectedExitForFandF.employeeName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Last Working Day:</span>
                  <span className="font-bold text-slate-900">{selectedExitForFandF.lastWorkingDay}</span>
                </div>
              </div>

              {/* Settlement Components */}
              <div className="space-y-2 border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Earnings & Statutory Entitlements
                </h4>
                
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Notice Period Compensation (60 Days):</span>
                  <span className="font-mono font-bold text-slate-900">$16,500.00</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Statutory Gratuity (5+ Years Service):</span>
                  <span className="font-mono font-bold text-emerald-700">+$8,500.00</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Unused Leave Encashment (7 Days):</span>
                  <span className="font-mono font-bold text-emerald-700">+$3,850.00</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Hardware & IT Recovery Deductions:</span>
                  <span className="font-mono font-bold text-rose-600">-$420.00</span>
                </div>

                <div className="flex justify-between pt-3 text-sm font-bold text-slate-900">
                  <span>Total Net Payable Settlement:</span>
                  <span className="text-emerald-700 font-mono text-base">$28,430.00</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Audited in compliance with corporate compensation guidelines & state labor regulations.</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    printElement('printable-ff-statement', `FF_Settlement_${selectedExitForFandF.employeeName.replace(/\s+/g, '_')}`);
                  }}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Statement
                </button>

                <button
                  onClick={() => {
                    downloadDocumentAsHtml('printable-ff-statement', `FF_Settlement_${selectedExitForFandF.employeeName.replace(/\s+/g, '_')}`);
                    showToast('Statement Downloaded', `Full & Final settlement statement saved for ${selectedExitForFandF.employeeName}.`, 'success');
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF / Doc
                </button>
              </div>

              <button
                onClick={() => setSelectedExitForFandF(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
