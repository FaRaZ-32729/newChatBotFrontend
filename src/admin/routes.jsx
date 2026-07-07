import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateUser from './pages/CreateUser';
import UserDetails from './pages/UserDetails';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Navigate to="/login" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="users/new" element={<CreateUser />} />
      <Route path="users/:userId" element={<UserDetails />} />
      {/* Fallbacks */}
      <Route path="" element={<Navigate to="dashboard" replace />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
