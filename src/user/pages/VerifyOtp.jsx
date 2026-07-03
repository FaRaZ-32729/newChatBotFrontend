import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, KeyRound, CheckCircle, Sparkles } from 'lucide-react';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sandboxOtp, setSandboxOtp] = useState(null);

  // Prefill email from query parameter if available
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Read sandbox simulated OTP for this email if it exists
  useEffect(() => {
    if (email) {
      const lastOtpData = localStorage.getItem('sandbox_last_email_otp');
      if (lastOtpData) {
        try {
          const parsed = JSON.parse(lastOtpData);
          if (parsed && parsed.email.trim().toLowerCase() === email.trim().toLowerCase()) {
            setSandboxOtp(parsed.otp);
          } else {
            setSandboxOtp(null);
          }
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      setSandboxOtp(null);
    }
  }, [email]);

  const handleVerify = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setIsLoading(true);

    // Simulated short premium delay
    setTimeout(() => {
      try {
        const savedUsers = localStorage.getItem('chatbot_users');
        const users = savedUsers ? JSON.parse(savedUsers) : [];
        const cleanEmail = email.trim().toLowerCase();
        const user = users.find(u => u.email.trim().toLowerCase() === cleanEmail);

        if (!user) {
          setError('No user associated with this email address found.');
          setIsLoading(false);
          return;
        }

        // Check if OTP matches
        if (user.otp && user.otp.trim() === otp.trim()) {
          // Update user state to OTP Verified
          user.otpVerified = true;
          localStorage.setItem('chatbot_users', JSON.stringify(users));
          
          // Store the verified email for the password setting screen
          localStorage.setItem('otp_verified_email', cleanEmail);
          
          setSuccess('OTP verification successful! Redirecting to set password...');
          
          setTimeout(() => {
            navigate('/set-password', { replace: true });
          }, 1500);
        } else {
          setError('The OTP you entered is invalid. Please try again.');
          setIsLoading(false);
        }
      } catch (err) {
        setError('An error occurred during verification.');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div id="verify-otp-container" className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative select-none">
      {/* Glow Effects */}
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
                disabled={isLoading || !!searchParams.get('email')}
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
                disabled={isLoading}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 tracking-[0.5em] text-center font-mono font-bold text-lg text-white placeholder-slate-700 transition-all"
                placeholder="000000"
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
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  <span>Verify and Proceed</span>
                )}
              </button>
            </div>
          </form>

          {/* Sandbox Helper Panel */}
          {sandboxOtp && (
            <div className="mt-6 p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl animate-fade-in text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Sandbox Simulated Email Inbox
              </p>
              <p className="text-xs text-indigo-300 font-semibold">
                An email was simulated. Use OTP: <span className="font-mono bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded text-white font-bold tracking-wider">{sandboxOtp}</span>
              </p>
              <button
                onClick={() => setOtp(sandboxOtp)}
                className="mt-2 text-[10px] text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
              >
                Auto-fill Code
              </button>
            </div>
          )}

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
