import { Routes, Route, Navigate } from 'react-router-dom';
import UserHome from './pages/UserHome';
import ChatbotView from './pages/ChatbotView';
import Login from '../admin/pages/Login';
import VerifyOtp from './pages/VerifyOtp';
import SetPassword from './pages/SetPassword';
import ForgotPassword from './pages/ForgotPassword';

export default function UserRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="verify-otp" element={<VerifyOtp />} />
      <Route path="set-password" element={<SetPassword />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="" element={<UserHome />} />
      <Route path="chatbot/:chatbotId" element={<ChatbotView />} />
      {/* Fallback back to user index or redirect */}
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}
