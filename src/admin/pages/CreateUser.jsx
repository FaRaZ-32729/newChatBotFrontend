import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, ChevronDown, CheckCircle } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import Header from '../components/Header';
import ToastNotification from '../components/ToastNotification';

export default function CreateUser() {
  const { isLoggedIn, createUser } = useAdmin();
  const navigate = useNavigate();

  // Form states
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [newUserAccess, setNewUserAccess] = useState(['Head Movement']);
  const [isNewAccessOpen, setIsNewAccessOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/admin/login', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return null;
  }

  const handleCreateUser = (e) => {
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

    // Simulate database write delay
    setTimeout(() => {
      const newUser = {
        id: `usr_${Date.now()}`,
        name: newUserName.trim(),
        email: newUserEmail.trim().toLowerCase(),
        status: 'active',
        role: newUserRole,
        access: newUserAccess,
        conversations: 0,
        lastActive: 'Never',
        platform: 'Web Widget',
        createdAt: new Date().toISOString().split('T')[0],
        activationKeys: ['salam', 'hello', 'hay'],
        knowledgeBase: [
          { name: 'general_faq.pdf', size: '1.2 MB', uploadedAt: new Date().toISOString().split('T')[0] }
        ],
        specificInstructions: 'Greet the user warmly. Assist them with navigation and shortcuts.'
      };

      createUser(newUser);
      setIsSubmitting(false);
      navigate('/admin/dashboard');
    }, 800);
  };

  return (
    <div id="admin-shell" className="min-h-screen md:h-screen md:overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-800">
      <ToastNotification />
      <Header />

      {/* --- MAIN CONTENT WINDOW --- */}
      <main id="main-content" className="flex-1 flex flex-col min-h-0 overflow-y-auto px-6 py-6 sm:px-10 md:px-16 lg:px-24 max-w-[1440px] mx-auto w-full transition-all">

        {/* --- HEADER BAR --- */}
        <header className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 id="view-title" className="text-2xl font-bold text-slate-900 tracking-tight sm:text-3xl">
              Create Chatbot User
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Provision a new user configuration with real-time preview.
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

        {/* Form Section */}
        <div id="create-user-view" className="flex-1 min-h-0 overflow-y-auto py-4 sm:py-8 animate-fade-in">

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-150 shadow-md w-full max-w-lg mx-auto">
            <div className="mb-6 text-center">
              <h3 className="text-xl font-bold text-slate-900">Configure New Account</h3>
              <p className="text-sm text-slate-500 mt-1">
                Fill in the details to register a new user client. This generates a unique access ID automatically.
              </p>
            </div>

            <form id="create-user-form" onSubmit={handleCreateUser} className="space-y-6">

              {/* Form Field: Name */}
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
                    if (formErrors.name) setFormErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  placeholder="e.g. John Doe"
                  className={`w-full px-4 py-3 border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm text-slate-800 ${formErrors.name ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-200'
                    }`}
                />
                {formErrors.name && (
                  <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Form Field: Email */}
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
                    if (formErrors.email) setFormErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  placeholder="e.g. john@example.com"
                  className={`w-full px-4 py-3 border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm text-slate-800 ${formErrors.email ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-200'
                    }`}
                />
                {formErrors.email && (
                  <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Form Field: Role */}
              <div>
                <label htmlFor="new-role" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Account Role <span className="text-rose-500">*</span>
                </label>
                <select
                  id="new-role"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm text-slate-800 bg-white"
                >
                  <option value="user">User (Client)</option>
                  <option value="manager">Manager</option>
                </select>
              </div>



              {/* Form Field: Access Control */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Access Method <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsNewAccessOpen(!isNewAccessOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-slate-200 rounded-2xl shadow-sm bg-white hover:bg-slate-50 transition-all text-sm text-slate-800 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <span>
                    {newUserAccess.length > 0
                      ? newUserAccess.join(', ')
                      : 'Select Access Method'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isNewAccessOpen ? 'rotate-180' : ''}`} />
                </button>

                {isNewAccessOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsNewAccessOpen(false)}
                    />
                    <div className="absolute left-0 right-0 mt-2 p-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 space-y-1 animate-fade-in">
                      <label className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors text-slate-700 text-sm">
                        <input
                          type="checkbox"
                          checked={newUserAccess.includes('Head Movement')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewUserAccess(prev => [...prev, 'Head Movement']);
                            } else {
                              if (newUserAccess.length > 1) {
                                setNewUserAccess(prev => prev.filter(x => x !== 'Head Movement'));
                              }
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Head Movement</span>
                      </label>
                      <label className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors text-slate-700 text-sm">
                        <input
                          type="checkbox"
                          checked={newUserAccess.includes('Hand Movement')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewUserAccess(prev => [...prev, 'Hand Movement']);
                            } else {
                              if (newUserAccess.length > 1) {
                                setNewUserAccess(prev => prev.filter(x => x !== 'Hand Movement'));
                              }
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Hand Movement</span>
                      </label>
                    </div>
                  </>
                )}
              </div>

              {/* Action Form Button */}
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
