import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingScreen from './components/common/LoadingScreen';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// App Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import AttendancePage from './pages/attendance/WorkAssignmentPage';
import WorkersPage from './pages/workers/WorkersPage';
import MaterialsPage from './pages/materials/MaterialsPage';
import InventoryPage from './pages/materials/InventoryPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import TasksPage from './pages/tasks/TasksPage';
import InvoicesPage from './pages/invoices/InvoicesPage';
import ReportsPage from './pages/reports/ReportsPage';
import WorkerDashboardPage from './pages/worker/WorkerDashboardPage';
import ContractorDashboardPage from './pages/contractor/ContractorDashboardPage';
import UserApprovalsPage from './pages/admin/UserApprovalsPage';
import WorkforceAttendancePage from './pages/attendance/WorkforceAttendancePage';
import DailySiteProgressPage from './pages/reports/DailySiteProgressPage';
import SiteMapPage from './pages/sitemap/SiteMapPage';
import NotFoundPage from './pages/common/NotFoundPage';

// Redirects users to their corresponding dashboard if they don't have access
const RoleRedirect = ({ allowedRoles, children }) => {
  const { userRole, user, loading } = useAuth();
  
  if (loading || (user && !userRole)) {
    return <LoadingScreen fullScreen={true} />;
  }
  
  const role = userRole || user?.user_metadata?.role || 'admin';
  
  if (!allowedRoles.includes(role)) {
    if (role === 'contractor') return <Navigate to="/contractor-dashboard" replace />;
    if (role === 'worker') return <Navigate to="/worker-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Management routes */}
            <Route path="/dashboard" element={
              <RoleRedirect allowedRoles={['admin', 'site_engineer']}>
                <DashboardPage />
              </RoleRedirect>
            } />

            {/* Contractor Dashboard */}
            <Route path="/contractor-dashboard" element={
              <RoleRedirect allowedRoles={['contractor']}>
                <ContractorDashboardPage />
              </RoleRedirect>
            } />

            <Route path="/attendance" element={
              <RoleRedirect allowedRoles={['admin', 'site_engineer']}>
                <AttendancePage />
              </RoleRedirect>
            } />
            <Route path="/workers" element={
              <RoleRedirect allowedRoles={['admin']}>
                <WorkersPage />
              </RoleRedirect>
            } />
            <Route path="/materials" element={
              <RoleRedirect allowedRoles={['admin', 'site_engineer', 'contractor']}>
                <MaterialsPage />
              </RoleRedirect>
            } />
            <Route path="/inventory" element={
              <RoleRedirect allowedRoles={['admin', 'site_engineer']}>
                <InventoryPage />
              </RoleRedirect>
            } />
            <Route path="/projects" element={
              <RoleRedirect allowedRoles={['admin', 'site_engineer']}>
                <ProjectsPage />
              </RoleRedirect>
            } />
            <Route path="/projects/:id" element={
              <RoleRedirect allowedRoles={['admin', 'site_engineer']}>
                <ProjectDetailPage />
              </RoleRedirect>
            } />
            <Route path="/tasks" element={
              <RoleRedirect allowedRoles={['admin', 'site_engineer', 'contractor']}>
                <TasksPage />
              </RoleRedirect>
            } />
            <Route path="/invoices" element={
              <RoleRedirect allowedRoles={['admin']}>
                <InvoicesPage />
              </RoleRedirect>
            } />
            <Route path="/reports" element={
              <RoleRedirect allowedRoles={['admin']}>
                <ReportsPage />
              </RoleRedirect>
            } />
            <Route path="/user-approvals" element={
              <RoleRedirect allowedRoles={['admin']}>
                <UserApprovalsPage />
              </RoleRedirect>
            } />
            <Route path="/workforce-attendance" element={
              <RoleRedirect allowedRoles={['admin', 'site_engineer']}>
                <WorkforceAttendancePage />
              </RoleRedirect>
            } />
            <Route path="/daily-progress" element={
              <RoleRedirect allowedRoles={['admin', 'site_engineer']}>
                <DailySiteProgressPage />
              </RoleRedirect>
            } />
            <Route path="/site-map" element={
              <RoleRedirect allowedRoles={['admin', 'site_engineer']}>
                <SiteMapPage />
              </RoleRedirect>
            } />

            {/* Worker-only route */}
            <Route path="/worker-dashboard" element={
              <RoleRedirect allowedRoles={['worker']}>
                <WorkerDashboardPage />
              </RoleRedirect>
            } />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;