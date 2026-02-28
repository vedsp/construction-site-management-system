import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// App Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import AttendancePage from './pages/attendance/AttendancePage';
import WorkersPage from './pages/workers/WorkersPage';
import MaterialsPage from './pages/materials/MaterialsPage';
import InventoryPage from './pages/materials/InventoryPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import TasksPage from './pages/tasks/TasksPage';
import InvoicesPage from './pages/invoices/InvoicesPage';
import ReportsPage from './pages/reports/ReportsPage';
import WorkerDashboardPage from './pages/worker/WorkerDashboardPage';

// Redirects workers to /worker-dashboard; redirects non-workers away from it
const RoleRedirect = ({ allowedRoles, redirectTo, children }) => {
  const { userRole } = useAuth();
  const role = userRole || 'admin';
  if (!allowedRoles.includes(role)) return <Navigate to={redirectTo} replace />;
  return children;
};

function App() {
  return (
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
            {/* Management routes — workers are redirected away */}
            <Route path="/dashboard" element={
              <RoleRedirect allowedRoles={['admin', 'site_engineer']} redirectTo="/worker-dashboard">
                <DashboardPage />
              </RoleRedirect>
            } />
            <Route path="/attendance" element={
              <RoleRedirect allowedRoles={['admin', 'site_engineer']} redirectTo="/worker-dashboard">
                <AttendancePage />
              </RoleRedirect>
            } />
            <Route path="/workers" element={
              <RoleRedirect allowedRoles={['admin', 'site_engineer']} redirectTo="/worker-dashboard">
                <WorkersPage />
              </RoleRedirect>
            } />
            <Route path="/materials" element={
              <RoleRedirect allowedRoles={['admin', 'site_engineer']} redirectTo="/worker-dashboard">
                <MaterialsPage />
              </RoleRedirect>
            } />
            <Route path="/inventory" element={
              <RoleRedirect allowedRoles={['admin', 'site_engineer']} redirectTo="/worker-dashboard">
                <InventoryPage />
              </RoleRedirect>
            } />
            <Route path="/projects" element={
              <RoleRedirect allowedRoles={['admin', 'site_engineer']} redirectTo="/worker-dashboard">
                <ProjectsPage />
              </RoleRedirect>
            } />
            <Route path="/tasks" element={
              <RoleRedirect allowedRoles={['admin', 'site_engineer']} redirectTo="/worker-dashboard">
                <TasksPage />
              </RoleRedirect>
            } />
            <Route path="/invoices" element={
              <RoleRedirect allowedRoles={['admin']} redirectTo="/worker-dashboard">
                <InvoicesPage />
              </RoleRedirect>
            } />
            <Route path="/reports" element={
              <RoleRedirect allowedRoles={['admin']} redirectTo="/worker-dashboard">
                <ReportsPage />
              </RoleRedirect>
            } />

            {/* Worker-only route */}
            <Route path="/worker-dashboard" element={
              <RoleRedirect allowedRoles={['worker']} redirectTo="/dashboard">
                <WorkerDashboardPage />
              </RoleRedirect>
            } />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
    </AuthProvider>
  );
}

export default App;
