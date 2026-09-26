import React, { useState } from 'react';
import { TenantProvider, useTenant } from './context/TenantContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';

import { DashboardPage } from './pages/DashboardPage';
import { CoreHrPage } from './pages/CoreHrPage';
import { AttendancePage } from './pages/AttendancePage';
import { LeavePage } from './pages/LeavePage';
import { PayrollPage } from './pages/PayrollPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { LifecyclePage } from './pages/LifecyclePage';
import { AtsPage } from './pages/AtsPage';
import { AiHubPage } from './pages/AiHubPage';
import { TenantSettingsPage } from './pages/TenantSettingsPage';
import { MySpacePage } from './pages/MySpacePage';

const AppLayout: React.FC = () => {
  const { activeRoute, canAccessRoute } = useTenant();
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderActiveRoute = () => {
    // If user has no access to this module/route, default to Dashboard
    if (!canAccessRoute(activeRoute)) {
      return <DashboardPage />;
    }

    switch (activeRoute) {
      case 'myspace':
        return <MySpacePage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'core_hr':
        return <CoreHrPage />;
      case 'attendance':
        return <AttendancePage />;
      case 'leave':
        return <LeavePage />;
      case 'payroll':
        return <PayrollPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'lifecycle':
        return <LifecyclePage />;
      case 'ats':
        return <AtsPage />;
      case 'ai_hub':
        return <AiHubPage />;
      case 'settings':
        return <TenantSettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-900 flex overflow-hidden antialiased">
      {/* Navigation Sidebar (Desktop static & Mobile drawer) */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <Header setMobileOpen={setMobileOpen} />

        {/* Scrollable Viewport Container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-full">
          <div className="max-w-7xl mx-auto w-full">
            {renderActiveRoute()}
          </div>
        </main>
      </div>

      {/* Global Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <TenantProvider>
      <AppLayout />
    </TenantProvider>
  );
}
