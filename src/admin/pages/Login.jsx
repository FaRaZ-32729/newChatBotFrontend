import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useUser } from '../../user/context/UserContext';
import ToastNotification from '../components/ToastNotification';

export default function Login() {
  const { login, loginError, setLoginError } = useAdmin();
  const { syncSession } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if session already exists on mount and auto-redirect
  useEffect(() => {
    const savedUser = localStorage.getItem('logged_in_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (parsed.role === 'manager' || parsed.role === 'user') {
          navigate('/', { replace: true });
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    // Simulate a brief premium transition delay (e.g. 350ms) to make the loader visible & smooth
    setTimeout(() => {
      const result = login(email, password);
      if (result && result.success) {
        // Immediately synchronize the user session state
        syncSession();
        navigate(result.redirect, { replace: true });
      } else {
        setIsLoading(false);
      }
    }, 350);
  };

  const prefill = (role) => {
    setLoginError('');
    if (role === 'admin') {
      setEmail('admin@chatbot.com');
      setPassword('password123');
    } else if (role === 'manager_null') {
      setEmail('manager_null@chatbot.com');
      setPassword('password123');
    } else if (role === 'manager_head') {
      setEmail('manager_head@chatbot.com');
      setPassword('password123');
    } else if (role === 'manager_hand') {
      setEmail('manager_hand@chatbot.com');
      setPassword('password123');
    } else if (role === 'manager_both') {
      setEmail('manager_both@chatbot.com');
      setPassword('password123');
    } else if (role === 'manager') {
      setEmail('manager@chatbot.com');
      setPassword('password123');
    } else {
      // Find first user if any exists, else default
      try {
        const saved = localStorage.getItem('chatbot_users');
        if (saved) {
          const parsed = JSON.parse(saved);
          const firstClient = parsed.find(u => u.role === 'user');
          if (firstClient) {
            setEmail(firstClient.email);
            setPassword('password123');
            return;
          }
        }
      } catch (err) { }
      setEmail('faraz@backend.dev');
      setPassword('password123');
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative select-none">
      <ToastNotification />

      {/* Glow Effects */}
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

          {/* Quick-fill helpers */}
          <div className="mt-8 border-t border-slate-800/80 pt-6">
            <p className="text-[10px] text-center text-slate-500 mb-3 font-bold tracking-wider uppercase flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Quick-Fill Sandbox Access
            </p>

            <div className="space-y-3">
              {/* Main Roles */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => prefill('admin')}
                  className="py-2.5 px-2 bg-slate-950 hover:bg-indigo-950/20 border border-slate-800/80 hover:border-indigo-500/30 rounded-xl text-[10px] text-slate-400 hover:text-white font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Fill Admin
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => prefill('manager')}
                  className="py-2.5 px-2 bg-slate-950 hover:bg-indigo-950/20 border border-slate-800/80 hover:border-indigo-500/30 rounded-xl text-[10px] text-slate-400 hover:text-white font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Fill Manager
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => prefill('user')}
                  className="py-2.5 px-2 bg-slate-950 hover:bg-indigo-950/20 border border-slate-800/80 hover:border-indigo-500/30 rounded-xl text-[10px] text-slate-400 hover:text-white font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Fill Client
                </button>
              </div>

              {/* Specific Manager Movement Permission Variants */}
              <div>
                <p className="text-[9px] text-slate-600 mb-1.5 font-semibold uppercase tracking-widest text-center">
                  Manager Movement Permutations:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => prefill('manager_null')}
                    className="py-2 px-1.5 bg-slate-950/60 hover:bg-indigo-950/10 border border-slate-850 hover:border-indigo-500/20 rounded-lg text-[9px] text-slate-500 hover:text-white transition-all cursor-pointer"
                    title="No movement permissions"
                  >
                    Mgr (Null Access)
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => prefill('manager_head')}
                    className="py-2 px-1.5 bg-slate-950/60 hover:bg-indigo-950/10 border border-slate-850 hover:border-indigo-500/20 rounded-lg text-[9px] text-slate-500 hover:text-white transition-all cursor-pointer"
                    title="Head Movement only"
                  >
                    Mgr (Head Only)
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => prefill('manager_hand')}
                    className="py-2 px-1.5 bg-slate-950/60 hover:bg-indigo-950/10 border border-slate-850 hover:border-indigo-500/20 rounded-lg text-[9px] text-slate-500 hover:text-white transition-all cursor-pointer"
                    title="Hand Movement only"
                  >
                    Mgr (Hand Only)
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => prefill('manager_both')}
                    className="py-2 px-1.5 bg-slate-950/60 hover:bg-indigo-950/10 border border-slate-850 hover:border-indigo-500/20 rounded-lg text-[9px] text-slate-500 hover:text-white transition-all cursor-pointer"
                    title="Both Head & Hand Movements"
                  >
                    Mgr (Both Mov.)
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
