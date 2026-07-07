import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, KeyRound, CheckCircle, RefreshCw } from 'lucide-react';
import { regenerateOtpApi, verifyOtpApi } from '../../api/auth.api';
import { setOtpVerifiedEmail } from '../../utils/authSession';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showResendOtp, setShowResendOtp] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShowResendOtp(false);

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyOtpApi(email.trim().toLowerCase(), otp.trim());
      setOtpVerifiedEmail(email.trim().toLowerCase());
      setSuccess(response.message || 'OTP verification successful! Redirecting to set password...');

      setTimeout(() => {
        navigate('/set-password', { replace: true });
      }, 1500);
    } catch (err) {
      if (err.message === 'OTP expired') {
        setShowResendOtp(true);
      }
      setError(err.message || 'Verification failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email.trim()) {
      setError('Email address is required to resend OTP.');
      return;
    }

    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      const response = await regenerateOtpApi(email.trim().toLowerCase());
      setShowResendOtp(false);
      setOtp('');
      setSuccess(response.message || 'A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div id="verify-otp-container" className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative select-none">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center p-3.5 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-500/25 text-white mb-6">
          <KeyRound className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Verify Security Code
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-xs mx-auto">
          Please enter the 6-digit authentication code sent to your email to verify your identity.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900/80 backdrop-blur-md py-8 px-5 shadow-2xl rounded-3xl border border-slate-800 sm:px-10">
          <form onSubmit={handleVerify} className="space-y-5">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-2xl flex items-start gap-3 text-xs animate-fade-in">
                <Shield className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-4 rounded-2xl flex items-start gap-3 text-xs animate-fade-in">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <div>
              <label htmlFor="verify-email" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="verify-email"
                type="email"
                required
                disabled={isLoading || isResending || !!searchParams.get('email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs text-slate-200 placeholder-slate-600 disabled:opacity-60"
                placeholder="e.g. name@example.com"
              />
            </div>

            <div>
              <label htmlFor="verify-otp" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                6-Digit OTP Code
              </label>
              <input
                id="verify-otp"
                type="text"
                required
                maxLength={6}
                disabled={isLoading || isResending}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ''));
                  if (showResendOtp) setShowResendOtp(false);
                }}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 tracking-[0.5em] text-center font-mono font-bold text-lg text-white placeholder-slate-700 transition-all"
                placeholder="000000"
              />
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={isLoading || isResending}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-2xl shadow-lg shadow-indigo-600/10 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  <span>Verify and Proceed</span>
                )}
              </button>

              {showResendOtp && (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending || isLoading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Resending OTP...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Resend OTP</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center border-t border-slate-800/60 pt-4">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-all cursor-pointer font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
