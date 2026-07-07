import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import Header from '../components/Header';
import ToastNotification from '../components/ToastNotification';
import { toBackendAccess } from '../../utils/access';

const ACCESS_OPTIONS = ['Head Movement', 'Hand Movement'];

export default function CreateUser() {
  const { isLoggedIn, createUser } = useAdmin();
  const navigate = useNavigate();

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserAccess, setNewUserAccess] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/admin/login', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return null;
  }

  const toggleAccess = (option) => {
    setNewUserAccess((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!newUserName.trim()) {
      errors.name = 'Name is required';
    }
    if (!newUserEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newUserEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    const result = await createUser({
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      access: toBackendAccess(newUserAccess),
    });

    if (result?.success) {
      navigate('/admin/dashboard');
      return;
    }

    setFormErrors({ submit: result?.message || 'Failed to create user. Please try again.' });
    setIsSubmitting(false);
  };

  return (
    <div id="admin-shell" className="min-h-screen md:h-screen md:overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-800">
      <ToastNotification />
      <Header />

      <main id="main-content" className="flex-1 flex flex-col min-h-0 overflow-y-auto px-6 py-6 sm:px-10 md:px-16 lg:px-24 max-w-[1440px] mx-auto w-full transition-all">
        <header className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 id="view-title" className="text-2xl font-bold text-slate-900 tracking-tight sm:text-3xl">
              Create Manager Account
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Register a new manager. A verification email with OTP will be sent automatically.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              id="header-btn-back"
              onClick={() => navigate('/admin/dashboard')}
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 shadow-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </header>

        <div id="create-user-view" className="flex-1 min-h-0 overflow-y-auto py-4 sm:py-8 animate-fade-in">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-150 shadow-md w-full max-w-lg mx-auto">
            <div className="mb-6 text-center">
              <h3 className="text-xl font-bold text-slate-900">Configure New Account</h3>
              <p className="text-sm text-slate-500 mt-1">
                Enter the manager details below. Role assignment is handled automatically.
              </p>
            </div>

            <form id="create-user-form" onSubmit={handleCreateUser} className="space-y-6">
              {formErrors.submit && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-start gap-3 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formErrors.submit}</span>
                </div>
              )}

              <div>
                <label htmlFor="new-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  User Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="new-name"
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => {
                    setNewUserName(e.target.value);
                    if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="e.g. John Doe"
                  className={`w-full px-4 py-3 border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm text-slate-800 ${formErrors.name ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-200'}`}
                />
                {formErrors.name && (
                  <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="new-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  id="new-email"
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => {
                    setNewUserEmail(e.target.value);
                    if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="e.g. john@example.com"
                  className={`w-full px-4 py-3 border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm text-slate-800 ${formErrors.email ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-200'}`}
                />
                {formErrors.email && (
                  <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Access Method
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Select one or both. Leave unchecked for no access.
                </p>
                <div className="space-y-2">
                  {ACCESS_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={newUserAccess.includes(option)}
                        onChange={() => toggleAccess(option)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  id="btn-submit-create"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Register Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
