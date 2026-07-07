import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, AlertCircle, Loader2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useUser } from '../../user/context/UserContext';
import { getStoredSession, getRedirectPath } from '../../utils/authSession';
import ToastNotification from '../components/ToastNotification';

export default function Login() {
  const { login, loginError, setLoginError } = useAdmin();
  const { syncSession } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const session = getStoredSession();
    if (session?.role) {
      navigate(getRedirectPath(session.role), { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setLoginError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    const result = await login(email, password);

    if (result?.success) {
      syncSession();
      navigate(result.redirect, { replace: true });
      return;
    }

    setIsLoading(false);
  };

  return (
    <div id="login-container" className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative select-none">
      <ToastNotification />

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center p-3.5 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-500/25 text-white mb-6">
          <Bot className="w-9 h-9" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          BotApp Portal
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Sign in to access control consoles, custom knowledge, and override states.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900/80 backdrop-blur-md py-8 px-5 shadow-2xl rounded-3xl border border-slate-800 sm:px-10">

          <form id="login-form" onSubmit={handleSubmit} className="space-y-5">
            {loginError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-2xl flex items-start gap-3 text-xs animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setLoginError('');
                }}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs text-slate-200 placeholder-slate-600 disabled:opacity-50"
                placeholder="e.g. name@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError('');
                }}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs text-slate-200 placeholder-slate-600 disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>

            <div>
              <button
                id="btn-login"
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-2xl shadow-lg shadow-indigo-600/10 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In to Portal</span>
                )}
              </button>
            </div>

            <div className="text-center mt-1">
              <button
                type="button"
                onClick={() => navigate('/verify-otp')}
                className="text-[11px] text-slate-400 hover:text-white font-semibold transition-all cursor-pointer hover:underline"
              >
                Received an OTP or invite? Verify Code & Set Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
