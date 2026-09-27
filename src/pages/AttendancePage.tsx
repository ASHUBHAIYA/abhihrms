import React, { useState, useEffect, useMemo } from 'react';
import { useTenant } from '../context/TenantContext';
import { ModuleGuard } from '../components/common/ModuleGuard';
import { ShiftType, ShiftInfo } from '../types/hrms';
import { exportToCsv } from '../utils/printUtils';
import { 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Play, 
  Pause, 
  Square, 
  Search, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle,
  Sun,
  Sunset,
  Moon,
  Coffee,
  CheckCircle,
  XCircle,
  CalendarDays,
  X,
  FileSpreadsheet
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  return (
    <ModuleGuard module="attendance">
      <AttendanceContent />
    </ModuleGuard>
  );
};

const SHIFTS: Record<ShiftType, ShiftInfo> = {
  morning: {
    id: 'morning',
    name: 'Morning Shift',
    timing: '09:00 - 18:00',
    color: 'blue',
    badgeBg: 'bg-blue-50 border-blue-200 text-blue-700',
    badgeText: '09:00 - 18:00',
    description: 'Standard day shift with core business overlap'
  },
  evening: {
    id: 'evening',
    name: 'Evening Shift',
    timing: '14:00 - 23:00',
    color: 'amber',
    badgeBg: 'bg-amber-50 border-amber-200 text-amber-700',
    badgeText: '14:00 - 23:00',
    description: 'EMEA & late coverage timezone window'
  },
  night: {
    id: 'night',
    name: 'Night Shift',
    timing: '22:00 - 07:00',
    color: 'purple',
    badgeBg: 'bg-purple-50 border-purple-200 text-purple-700',
    badgeText: '22:00 - 07:00',
    description: 'Overnight operations & 24/7 reliability coverage'
  },
  flexible: {
    id: 'flexible',
    name: 'Flexible 8h',
    timing: 'Flexible',
    color: 'cyan',
    badgeBg: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    badgeText: 'Flexible',
    description: 'Async flexible schedule with 8h completion'
  },
  off: {
    id: 'off',
    name: 'Weekly Off',
    timing: 'Off Duty',
    color: 'slate',
    badgeBg: 'bg-slate-100 text-slate-500 border-slate-200',
    badgeText: 'Rest Day',
    description: 'Scheduled rest day / weekend off'
  }
};

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const AttendanceContent: React.FC = () => {
  const { currentTenant, attendanceRecords, logAttendanceClockIn, logAttendanceClockOut, employees, currentUser, showToast } = useTenant();

  const [activeTab, setActiveTab] = useState<'tracker' | 'roster'>('tracker');
  
  // Interactive Punch Clock State
  const [clockState, setClockState] = useState<'idle' | 'working' | 'break'>('working');
  const [workSeconds, setWorkSeconds] = useState(14520); // 4h 02m
  const [breakSeconds, setBreakSeconds] = useState(1200); // 20m
  const [punchLog, setPunchLog] = useState<{ time: string; action: string; badge: string }[]>([
    { time: '08:52 AM', action: 'Shift Punch In (GPS Verified)', badge: 'emerald' },
    { time: '12:30 PM', action: 'Meal Break Started', badge: 'amber' },
    { time: '01:10 PM', action: 'Resumed Shift from Meal Break', badge: 'blue' }
  ]);

  // Status Filter for Attendance Board
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState('');

  const handleExportAttendanceCsv = () => {
    const data = filteredAttendanceLogs.map(rec => ({
      'Employee ID': rec.employeeId,
      'Employee Name': rec.employeeName,
      'Department': rec.department,
      'Punch In': rec.clockInTime || rec.clockIn || '—',
      'Punch Out': rec.clockOutTime || rec.clockOut || '—',
      'Net Hours': `${rec.totalHoursWorked || 8} hrs`,
      'Break Duration': `${rec.breakDurationMinutes || 30} mins`,
      'Geofence Check-in': rec.locationCheckin || 'Verified (Headquarters)',
      'Status': rec.status
    }));
    exportToCsv(data, `Attendance_Timesheet_${currentTenant.slug}.csv`);
    showToast('Export Complete', 'Attendance and timesheet records exported to CSV.', 'success');
  };

  // Weekly Shift Roster State (scoped per employee)
  const [rosterAssignments, setRosterAssignments] = useState<Record<string, Record<string, ShiftType>>>(() => {
    const initial: Record<string, Record<string, ShiftType>> = {};
    employees.forEach((emp, index) => {
      initial[emp.id] = {
        Mon: index % 3 === 0 ? 'morning' : index % 3 === 1 ? 'evening' : 'night',
        Tue: index % 3 === 0 ? 'morning' : index % 3 === 1 ? 'evening' : 'night',
        Wed: index % 3 === 0 ? 'morning' : index % 3 === 1 ? 'evening' : 'night',
        Thu: index % 3 === 0 ? 'morning' : index % 3 === 1 ? 'evening' : 'night',
        Fri: index % 3 === 0 ? 'morning' : index % 3 === 1 ? 'evening' : 'night',
        Sat: 'off',
        Sun: 'off'
      };
    });
    return initial;
  });

  // Reassignment Modal State
  const [reassignTarget, setReassignTarget] = useState<{ employeeId: string; employeeName: string; day: string; currentShift: ShiftType } | null>(null);

  // Active Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (clockState === 'working') {
      interval = setInterval(() => {
        setWorkSeconds(prev => prev + 1);
      }, 1000);
    } else if (clockState === 'break') {
      interval = setInterval(() => {
        setBreakSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [clockState]);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePunchIn = () => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const empName = employees[0] ? `${employees[0].firstName} ${employees[0].lastName}` : currentUser.name;
    const dept = employees[0]?.department || 'Engineering';

    logAttendanceClockIn(empName, dept);
    setClockState('working');
    setPunchLog(prev => [{ time: nowStr, action: `Shift Punch In (${currentTenant.headquarters} GPS Matched)`, badge: 'emerald' }, ...prev]);
  };

  const handleToggleBreak = () => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (clockState === 'working') {
      setClockState('break');
      setPunchLog(prev => [{ time: nowStr, action: 'Break Started (Timer Active)', badge: 'amber' }, ...prev]);
    } else if (clockState === 'break') {
      setClockState('working');
      setPunchLog(prev => [{ time: nowStr, action: 'Resumed Shift Work', badge: 'blue' }, ...prev]);
    }
  };

  const handlePunchOut = () => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = new Date().toISOString().split('T')[0];
    const activeRec = attendanceRecords.find(r => 
      r.date === todayStr &&
      (r.employeeId === currentUser.id || r.employeeName.toLowerCase().includes(currentUser.name.toLowerCase())) &&
      !(r.clockOut || r.clockOutTime)
    ) || attendanceRecords.find(r => !(r.clockOut || r.clockOutTime)) || attendanceRecords[0];

    if (activeRec) {
      logAttendanceClockOut(activeRec.id);
    }
    setClockState('idle');
    setPunchLog(prev => [{ time: nowStr, action: 'Shift Ended & Clocked Out', badge: 'rose' }, ...prev]);
  };

  // Status board metrics calculations
  const statusBoardCounts = useMemo(() => {
    const onTimeCount = attendanceRecords.filter(a => a.status === 'on_time').length;
    const lateCount = attendanceRecords.filter(a => a.status === 'late').length;
    const halfDayCount = attendanceRecords.filter(a => a.status === 'half_day').length;
    const onLeaveCount = employees.filter(e => e.status === 'on_leave').length;
    const totalEmployees = Math.max(1, employees.length);
    const totalActiveLogged = onTimeCount + lateCount + halfDayCount;
    const absentCount = Math.max(0, totalEmployees - totalActiveLogged - onLeaveCount);

    return {
      presentOnTime: onTimeCount,
      late: lateCount,
      halfDay: halfDayCount,
      absent: absentCount,
      onLeave: onLeaveCount,
      total: totalEmployees
    };
  }, [attendanceRecords, employees]);

  // Filtered daily logs
  const filteredAttendanceLogs = useMemo(() => {
    return attendanceRecords.filter(rec => {
      const matchSearch = 
        rec.employeeName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        rec.department.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (rec.locationCheckin || '').toLowerCase().includes(searchFilter.toLowerCase());

      if (selectedStatusFilter === 'All') return matchSearch;
      if (selectedStatusFilter === 'present') return matchSearch && rec.status === 'on_time';
      if (selectedStatusFilter === 'late') return matchSearch && rec.status === 'late';
      if (selectedStatusFilter === 'half_day') return matchSearch && rec.status === 'half_day';
      if (selectedStatusFilter === 'absent') return matchSearch && rec.status === 'absent';
      return matchSearch;
    });
  }, [attendanceRecords, searchFilter, selectedStatusFilter]);

  const handleShiftReassign = (shift: ShiftType) => {
    if (!reassignTarget) return;
    setRosterAssignments(prev => ({
      ...prev,
      [reassignTarget.employeeId]: {
        ...(prev[reassignTarget.employeeId] || {}),
        [reassignTarget.day]: shift
      }
    }));
    setReassignTarget(null);
  };

  return (
    <div className="space-y-6 pb-12 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Daily Attendance & Shift Engine
            </h1>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
              Biometric & GeoSync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time GPS geofence punch clock, shift roster planning, and live workforce status for {currentTenant.name}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Tab Navigation */}
          <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'tracker'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Live Punch & Board
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'roster'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Shift Roster View
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Status Board (5 Core Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Present (On-Time) */}
        <button
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'present' ? 'All' : 'present')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedStatusFilter === 'present'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Present (On-Time)</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-2 tabular-nums">
            {statusBoardCounts.presentOnTime}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            Within 09:00 Grace
          </div>
        </button>

        {/* 2. Late Arrivals */}
        <button
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'late' ? 'All' : 'late')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedStatusFilter === 'late'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Late Arrivals</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-2 tabular-nums">
            {statusBoardCounts.late}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">
            &gt;15 min threshold
          </div>
        </button>

        {/* 3. Half-Day */}
        <button
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'half_day' ? 'All' : 'half_day')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedStatusFilter === 'half_day'
              ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Half-Day</span>
            <Coffee className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-orange-700 mt-2 tabular-nums">
            {statusBoardCounts.halfDay}
          </div>
          <div className="text-[11px] text-orange-700 mt-1 font-medium">
            &lt;4.5h Work Logged
          </div>
        </button>

        {/* 4. Absent */}
        <button
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'absent' ? 'All' : 'absent')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedStatusFilter === 'absent'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Absent</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-700 mt-2 tabular-nums">
            {statusBoardCounts.absent}
          </div>
          <div className="text-[11px] text-rose-700 mt-1 font-medium">
            Unexcused / No-Show
          </div>
        </button>

        {/* 5. On Leave */}
        <div className="p-4 rounded-xl border bg-white border-slate-200 text-left shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">On Leave</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-700 mt-2 tabular-nums">
            {statusBoardCounts.onLeave}
          </div>
          <div className="text-[11px] text-blue-700 mt-1 font-medium">
            Approved Absence
          </div>
        </div>
      </div>

      {activeTab === 'tracker' ? (
        <>
          {/* Interactive Punch Clock Widget + Live GPS Geotag */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Clock Widget Card */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Interactive Shift Punch Clock</h3>
                    <p className="text-[11px] text-slate-500 font-mono">Assigned: Morning Shift (09:00 - 18:00)</p>
                  </div>
                </div>

                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                  clockState === 'working'
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200 animate-pulse'
                    : clockState === 'break'
                    ? 'text-amber-700 bg-amber-50 border-amber-200 animate-pulse'
                    : 'text-slate-600 bg-slate-100 border-slate-200'
                }`}>
                  {clockState === 'working' ? '● CLOCKED IN · ACTIVE' : clockState === 'break' ? '❚❚ ON BREAK' : '○ SHIFT COMPLETED'}
                </span>
              </div>

              {/* Digital Timer Face */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-2 shadow-inner">
                <span className="text-xs text-slate-400 uppercase tracking-widest font-mono block">
                  {clockState === 'break' ? 'Break Time Elapsed' : 'Active Shift Elapsed Time'}
                </span>
                
                <div className="text-4xl sm:text-5xl font-bold font-mono text-white tracking-widest tabular-nums">
                  {clockState === 'break' ? formatTimer(breakSeconds) : formatTimer(workSeconds)}
                </div>

                {/* GPS Geo-Tagging Status Strip */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-center gap-3 text-[11px]">
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    GPS: 37.7749° N, 122.4194° W
                  </span>
                  <span className="text-slate-300 font-mono">
                    Perimeter: <strong className="text-blue-300">250m HQ Geofence (Matched)</strong>
                  </span>
                  <span className="text-slate-400 font-mono">
                    Precision: ±3.8m
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                {clockState === 'idle' ? (
                  <button
                    onClick={handlePunchIn}
                    className="col-span-3 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Punch In Today's Shift
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleToggleBreak}
                      className={`py-2.5 px-3 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 border ${
                        clockState === 'break'
                          ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                      }`}
                    >
                      <Pause className="w-3.5 h-3.5" />
                      {clockState === 'break' ? 'Resume Shift' : 'Take Break'}
                    </button>
                    <button
                      onClick={handlePunchOut}
                      className="col-span-2 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" />
                      End Shift & Punch Out
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* GPS Geofencing & Today's Punch Activity Log */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Simulated GPS & Geo-Tagging Audit</h3>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Perimeter Secure
                </span>
              </div>

              {/* Geofence specs card */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Target Geofence Hub:</span>
                  <span className="font-semibold text-slate-900">{currentTenant.headquarters} Main Campus</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Radius & Tolerance:</span>
                  <span className="font-mono text-slate-800">250m Circle Perimeter</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Biometric / IP Check:</span>
                  <span className="text-emerald-700 font-mono font-semibold">192.168.10.4 · HW ID Verified</span>
                </div>
              </div>

              {/* Timeline of punches today */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Today's Punch Activity Log</span>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {punchLog.map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        <span className="text-slate-800 font-medium">{log.action}</span>
                      </div>
                      <span className="text-slate-500 font-mono text-[11px]">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Daily Attendance Logs Table */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Daily Workforce Attendance Logs</h2>
                <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                  {filteredAttendanceLogs.length} Records Today
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {selectedStatusFilter !== 'All' && (
                    <button
                      onClick={() => setSelectedStatusFilter('All')}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Reset filter ({selectedStatusFilter})
                    </button>
                  )}

                  <button
                    onClick={handleExportAttendanceCsv}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    title="Export timesheets to CSV"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    Export CSV
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Punch In</th>
                      <th className="py-3 px-4">Punch Out</th>
                      <th className="py-3 px-4">Break Time</th>
                      <th className="py-3 px-4">Net Work Hours</th>
                      <th className="py-3 px-4">GPS Geofence Match</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAttendanceLogs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-10 text-slate-500 text-xs">
                          No attendance records matching the current filter.
                        </td>
                      </tr>
                    ) : (
                      filteredAttendanceLogs.map(rec => (
                        <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{rec.employeeName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">ID: {rec.employeeId}</div>
                          </td>

                          <td className="py-3 px-4 text-slate-700">
                            {rec.department}
                          </td>

                          <td className="py-3 px-4 font-mono font-semibold text-slate-900 tabular-nums">
                            {rec.clockIn}
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                            {rec.clockOut || (
                              <span className="text-emerald-700 font-sans text-[11px] font-bold animate-pulse">
                                ● In Progress
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-700 tabular-nums">
                            {rec.breakDurationMinutes} mins
                          </td>

                          <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                            {rec.totalWorkHours} hrs
                          </td>

                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[170px]">{rec.locationCheckin}</span>
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider ${
                              rec.status === 'on_time'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : rec.status === 'late'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : rec.status === 'half_day'
                                ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {rec.status.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Shift Roster View (Predefined shifts + Weekly matrix) */
        <div className="space-y-6">
          {/* Predefined Shift Master Templates Cards */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Predefined Shift Configuration Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Morning Shift */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Morning Shift</h4>
                      <span className="text-[10px] text-blue-700 font-mono font-medium">09:00 - 18:00</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold border border-blue-200">
                    8h + 1h Break
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Standard daytime schedule for product, design, leadership and core business operations.
                </p>
              </div>

              {/* Evening Shift */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                      <Sunset className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Evening Shift</h4>
                      <span className="text-[10px] text-amber-700 font-mono font-medium">14:00 - 23:00</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-mono font-bold border border-amber-200">
                    8h + 1h Break
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Mid-day to late evening shift providing overlap coverage for global EMEA and West Coast teams.
                </p>
              </div>

              {/* Night Shift */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Night Shift</h4>
                      <span className="text-[10px] text-purple-700 font-mono font-medium">22:00 - 07:00</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-mono font-bold border border-purple-200">
                    Night Differential
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Overnight systems monitoring, 24/7 client response, and critical cloud infrastructure maintenance.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Weekly Shift Roster Grid */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Weekly Team Shift Roster Grid</h3>
                <p className="text-xs text-slate-500">Click any shift badge to reassign employee schedule</p>
              </div>

              <div className="flex items-center gap-3 text-xs flex-wrap">
                <span className="flex items-center gap-1.5 text-blue-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded bg-blue-600"></span> Morning (09-18)
                </span>
                <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded bg-amber-600"></span> Evening (14-23)
                </span>
                <span className="flex items-center gap-1.5 text-purple-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded bg-purple-600"></span> Night (22-07)
                </span>
                <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <span className="w-2.5 h-2.5 rounded bg-slate-300"></span> Off
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider font-bold">
                    <th className="py-3 px-4 min-w-[180px]">Employee</th>
                    {DAYS_OF_WEEK.map(day => (
                      <th 
                        key={day} 
                        className={`py-3 px-3 text-center min-w-[105px] ${
                          day === 'Mon' ? 'bg-blue-50/70 text-blue-800 border-x border-blue-100' : ''
                        }`}
                      >
                        {day} {day === 'Mon' && '(Today)'}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map(emp => {
                    const empSchedule = rosterAssignments[emp.id] || {
                      Mon: 'morning', Tue: 'morning', Wed: 'morning', Thu: 'morning', Fri: 'morning', Sat: 'off', Sun: 'off'
                    };

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{emp.firstName} {emp.lastName}</div>
                          <div className="text-[10px] text-slate-500">{emp.department}</div>
                        </td>

                        {DAYS_OF_WEEK.map(day => {
                          const shiftType = empSchedule[day] || 'morning';
                          const shiftInfo = SHIFTS[shiftType];

                          return (
                            <td 
                              key={day} 
                              className={`py-2 px-2 text-center ${day === 'Mon' ? 'bg-blue-50/30 border-x border-blue-100' : ''}`}
                            >
                              <button
                                onClick={() => setReassignTarget({
                                  employeeId: emp.id,
                                  employeeName: `${emp.firstName} ${emp.lastName}`,
                                  day,
                                  currentShift: shiftType
                                })}
                                className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-mono font-semibold border transition-all hover:scale-105 shadow-2xs ${shiftInfo.badgeBg}`}
                                title={`Click to reassign ${emp.firstName}'s shift for ${day}`}
                              >
                                {shiftInfo.name.split(' ')[0]}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Shift Reassign Modal */}
      {reassignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setReassignTarget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-slate-900">
              Assign Shift for {reassignTarget.day}
            </h3>
            <p className="text-xs text-slate-500">
              Select schedule for <strong className="text-slate-900">{reassignTarget.employeeName}</strong> on <strong className="text-blue-600">{reassignTarget.day}</strong>:
            </p>

            <div className="space-y-2">
              {(Object.keys(SHIFTS) as ShiftType[]).map(st => {
                const shift = SHIFTS[st];
                const isCurrent = reassignTarget.currentShift === st;

                return (
                  <button
                    key={st}
                    onClick={() => handleShiftReassign(st)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                      isCurrent
                        ? 'bg-blue-50 border-blue-300 text-slate-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>{shift.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({shift.timing})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{shift.description}</div>
                    </div>
                    {isCurrent && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
