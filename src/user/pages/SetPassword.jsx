import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, Eye, EyeOff, CheckCircle2, LockKeyhole } from 'lucide-react';
import { setPasswordApi } from '../../api/auth.api';
import { clearOtpVerifiedEmail, getOtpVerifiedEmail } from '../../utils/authSession';

export default function SetPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const verifiedEmail = getOtpVerifiedEmail();
    if (!verifiedEmail) {
      navigate('/verify-otp', { replace: true });
      return;
    }
    setEmail(verifiedEmail);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await setPasswordApi(email.trim().toLowerCase(), password);
      clearOtpVerifiedEmail();
      setSuccess(response.message || 'Password set successfully! Redirecting you to login portal...');

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to update password. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div id="set-password-container" className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative select-none">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center p-3.5 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-500/25 text-white mb-6">
          <LockKeyhole className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Set New Password
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-xs mx-auto">
          Secure your account for <span className="text-indigo-400 font-mono font-bold">{email}</span> by setting a secure entry key.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900/80 backdrop-blur-md py-8 px-5 shadow-2xl rounded-3xl border border-slate-800 sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-2xl flex items-start gap-3 text-xs animate-fade-in">
                <Shield className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-4 rounded-2xl flex items-start gap-3 text-xs animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <div>
              <label htmlFor="new-password" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs text-slate-200 placeholder-slate-600 disabled:opacity-50"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs text-slate-200 placeholder-slate-600 disabled:opacity-50"
                placeholder="Repeat new password"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-2xl shadow-lg shadow-indigo-600/10 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Setting Password...</span>
                  </>
                ) : (
                  <span>Set Password & Activate</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center border-t border-slate-800/60 pt-4">
            <button
              onClick={() => {
                clearOtpVerifiedEmail();
                navigate('/login');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-all cursor-pointer font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Cancel & Go back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
