import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from './admin/context/AdminContext';
import { UserProvider } from './user/context/UserContext';
import AdminRoutes from './admin/routes';
import UserRoutes from './user/routes';

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <UserProvider>
          <Routes>
            {/* Admin Router Namespace */}
            <Route path="/admin/*" element={<AdminRoutes />} />

            {/* User Router Namespace */}
            <Route path="/*" element={<UserRoutes />} />
          </Routes>
        </UserProvider>
      </AdminProvider>
    </BrowserRouter>
  );
}
