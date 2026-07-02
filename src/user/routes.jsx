import { Routes, Route, Navigate } from 'react-router-dom';
import UserHome from './pages/UserHome';
import Login from '../admin/pages/Login';

export default function UserRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="" element={<UserHome />} />
      {/* Fallback back to user index or redirect */}
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}
