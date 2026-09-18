import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './routes/ProtectedRoute';
import { Navbar } from './components/Navbar/Navbar';
import { Sidebar } from './components/Sidebar/Sidebar';
import { CommandPalette } from './components/CommandPalette/CommandPalette';
import { NotificationCenter } from './components/NotificationCenter/NotificationCenter';
import { analyticsService } from './services/analyticsService';
import { AlertItem } from './types';

// Pages
import { Landing } from './pages/Landing/Landing';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Projects } from './pages/Projects/Projects';
import { ProjectDetails } from './pages/ProjectDetails/ProjectDetails';
import { SiteDetails } from './pages/SiteDetails/SiteDetails';
import { MapExplorer } from './pages/MapExplorer/MapExplorer';
import { Analytics } from './pages/Analytics/Analytics';
import { AIInsights } from './pages/AIInsights/AIInsights';
import { Reports } from './pages/Reports/Reports';
import { Pricing } from './pages/Pricing/Pricing';
import { Orders } from './pages/Orders/Orders';
import { Profile } from './pages/Profile/Profile';
import { Admin } from './pages/Admin/Admin';
import { AdminDataSources } from './pages/Admin/AdminDataSources';

const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const al = await analyticsService.getAllAlerts();
        setAlerts(al);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAlerts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        onOpenCommand={() => setCommandOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        unreadAlertsCount={alerts.length}
      />

      <div className="flex flex-1">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
      />

      <NotificationCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        alerts={alerts}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Auth */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Platform Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetails />} />
              <Route path="/sites/:id" element={<SiteDetails />} />
              <Route path="/map" element={<MapExplorer />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/ai-insights" element={<AIInsights />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />

              {/* Admin Console */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/data-sources" element={<AdminDataSources />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
