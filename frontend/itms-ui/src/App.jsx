import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TicketManagementPage from './pages/TicketManagementPage';
import AssetManagementPage from './pages/AssetManagementPage';
import UsersPage from './pages/UsersPage';
import ChangeRequestsPage from './pages/ChangeRequestsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import CustomerHistoryPage from './pages/CustomerHistoryPage';
import RoleManagementPage from './pages/RoleManagementPage';
import BackupPage from './pages/BackupPage';
import SlaPage from './pages/SlaPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/tickets" element={<PrivateRoute><TicketManagementPage /></PrivateRoute>} />
          <Route path="/assets" element={<PrivateRoute><AssetManagementPage /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
          <Route path="/change-requests" element={<PrivateRoute><ChangeRequestsPage /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
          <Route path="/audit-logs" element={<PrivateRoute><AuditLogsPage /></PrivateRoute>} />
          <Route path="/customer-history" element={<PrivateRoute><CustomerHistoryPage /></PrivateRoute>} />
          <Route path="/roles" element={<PrivateRoute><RoleManagementPage /></PrivateRoute>} />
          <Route path="/backup" element={<PrivateRoute><BackupPage /></PrivateRoute>} />
          <Route path="/sla" element={<PrivateRoute><SlaPage /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
