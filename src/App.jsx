import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/workers" element={<WorkersPage />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
