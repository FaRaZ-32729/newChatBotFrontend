import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);

    // Simulated network transition
    setTimeout(() => {
      try {
        const savedUsers = localStorage.getItem('chatbot_users');
        const users = savedUsers ? JSON.parse(savedUsers) : [];
        const cleanEmail = email.trim().toLowerCase();
        
        const userIndex = users.findIndex(u => u.email.trim().toLowerCase() === cleanEmail);
        
        if (userIndex === -1) {
          setError('We could not find an account associated with this email.');
          setIsLoading(false);
          return;
        }

        // Generate and assign a new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        users[userIndex].otp = otp;
        users[userIndex].otpVerified = false; // Reset verification state
        
        // Save users
        localStorage.setItem('chatbot_users', JSON.stringify(users));

        // Save last simulated OTP to localStorage for easy sandbox retrieval
        localStorage.setItem('sandbox_last_email_otp', JSON.stringify({
          email: cleanEmail,
          otp: otp,
          name: users[userIndex].name,
          type: 'forgot_password'
        }));

        setSuccess(`OTP Code generated successfully! Simulated recovery email sent to ${cleanEmail}.`);
        
        // Wait 1.5s then navigate to verify screen
        setTimeout(() => {
          navigate(`/verify-otp?email=${encodeURIComponent(cleanEmail)}`);
        }, 1500);

      } catch (err) {
        setError('Failed to initiate password reset. Please try again.');
        setIsLoading(false);
      }
    }, 700);
  };

  return (
    <div id="forgot-password-container" className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative select-none">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center p-3.5 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-500/25 text-white mb-6">
          <Mail className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Recover Password
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-xs mx-auto">
          Enter your registered email address and we'll send you an OTP to set a new password.
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
              <label htmlFor="recovery-email" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="recovery-email"
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs text-slate-200 placeholder-slate-600 disabled:opacity-50"
                placeholder="e.g. yourname@example.com"
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
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <span>Send Recovery OTP</span>
                )}
              </button>
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
