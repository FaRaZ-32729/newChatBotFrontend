import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, LogOut, LayoutDashboard, Sparkles, BookOpen, Key, FileText, 
  Trash2, Plus, ArrowRight, UserCheck, AlertCircle, RefreshCw, Send, CheckCircle, ShieldAlert 
} from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function UserHome() {
  const { 
    currentUser, users, logoutUser, addKnowledgeFile, removeKnowledgeFile, 
    addActivationKey, removeActivationKey, updateInstructions, registerUser 
  } = useUser();
  const navigate = useNavigate();

  // Filter clients to show only those created by this manager
  const managedUsers = (users || []).filter(
    u => u.createdBy === currentUser?.email
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  // Form states: New knowledge base document
  const [newDocName, setNewDocName] = useState('');
  
  // Form states: New activation keyword
  const [newKey, setNewKey] = useState('');

  // Form states: Specific instructions (initialized when currentUser changes)
  const [instructions, setInstructions] = useState('');

  // Form states: Create User (exactly 2 fields: Name & Email)
  const [createUserName, setCreateUserName] = useState('');
  const [createUserEmail, setCreateUserEmail] = useState('');
  const [createUserError, setCreateUserError] = useState('');
  const [createUserSuccess, setCreateUserSuccess] = useState('');

  // Toast message
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (currentUser) {
      setInstructions(currentUser.specificInstructions || '');
    }
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  // Trigger toast notification
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  // 1. Handle knowledge base document submission
  const handleAddDocument = (e) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    
    // Ensure filename ends in .pdf or append it for aesthetics
    let formattedName = newDocName.trim();
    if (!formattedName.toLowerCase().endsWith('.pdf')) {
      formattedName += '.pdf';
    }

    // Generate random mock size
    const sizes = ['1.2 MB', '840 KB', '2.1 MB', '450 KB', '1.8 MB'];
    const randomSize = sizes[Math.floor(Math.random() * sizes.length)];

    addKnowledgeFile(formattedName, randomSize);
    showToast(`Uploaded "${formattedName}" to knowledge base.`);
    setNewDocName('');
  };

  // 2. Handle activation keyword submission
  const handleAddKey = (e) => {
    e.preventDefault();
    if (!newKey.trim()) return;
    
    addActivationKey(newKey.trim().toLowerCase());
    showToast(`Added activation keyword: "${newKey.trim().toLowerCase()}"`);
    setNewKey('');
  };

  // 3. Handle saving custom instructions
  const handleSaveInstructions = () => {
    updateInstructions(instructions.trim());
    showToast('Custom instructions updated successfully!');
  };

  // 4. Handle registering a new user with 2 fields: name & email only
  const handleCreateUser = (e) => {
    e.preventDefault();
    setCreateUserError('');
    setCreateUserSuccess('');

    if (!createUserName.trim()) {
      setCreateUserError('Name is required');
      return;
    }
    if (!createUserEmail.trim()) {
      setCreateUserError('Email is required');
      return;
    } else if (!/\S+@\S+\.\S+/.test(createUserEmail)) {
      setCreateUserError('Please enter a valid email address');
      return;
    }

    // Create user in shared localStorage database
    const newUser = registerUser(createUserName.trim(), createUserEmail.trim());
    setCreateUserSuccess(`Successfully created user "${newUser.name}"!`);
    showToast(`Created user account: ${newUser.name}`);
    
    // Reset fields
    setCreateUserName('');
    setCreateUserEmail('');
  };

  const handleSignOut = () => {
    logoutUser();
    navigate('/login');
  };

  const hasHandMovement = currentUser.access?.includes('Hand Movement');

  return (
    <div id="user-portal-shell" className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none relative">
      
      {/* Floating Glowing Backgrounds */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header bar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 shadow-md">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-16 lg:px-24 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight leading-none text-white">BotApp</h1>
              <p className="text-[9px] text-indigo-400 font-bold tracking-wider uppercase mt-1 leading-none">User Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Admin Toggle */}
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-pointer"
              title="Go to administrator backend"
            >
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Admin Panel</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-500/30 animate-fade-in">
          <Sparkles className="w-4 h-4 text-indigo-200 shrink-0" />
          <p className="text-xs font-bold">{toast}</p>
        </div>
      )}

      {/* Main Content Area */}
      <main id="user-dashboard-main" className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-10 md:px-16 lg:px-24 py-8 relative z-10 flex flex-col gap-6">
        
        {/* User Hero Banner */}
        <section className="bg-gradient-to-r from-indigo-950/80 to-slate-900/80 border border-indigo-900/30 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 font-black text-white text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              {currentUser.name?.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-400 tracking-wider uppercase font-mono">Chatbot Integration Config</p>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">{currentUser.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{currentUser.email}</p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2.5 shrink-0 w-full sm:w-auto">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Access Protocol</span>
            <div className="flex flex-wrap gap-1.5">
              {currentUser.access?.map((method, idx) => (
                <span 
                  key={idx} 
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/20"
                >
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  {method}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Bento Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Knowledge Base Configuration */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            
            <div className="bg-slate-900/50 border border-slate-800 p-5 sm:p-6 rounded-3xl flex-1 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-400 shrink-0 border border-indigo-500/15">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">My Knowledge Base</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Upload training PDF files or manual FAQs to customize the AI's answers.</p>
                </div>
              </div>

              {/* Upload simulated input bar */}
              <form onSubmit={handleAddDocument} className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="e.g. system_overrides.pdf"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white placeholder-slate-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload PDF</span>
                </button>
              </form>

              {/* Document List */}
              <div className="flex-1 mt-2 min-h-[160px] flex flex-col justify-between">
                {!currentUser.knowledgeBase || currentUser.knowledgeBase.length === 0 ? (
                  <div className="py-8 px-4 text-center bg-slate-950/40 border border-dashed border-slate-800/80 rounded-2xl my-auto">
                    <FileText className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-400">No custom knowledge base files uploaded</p>
                    <p className="text-[11px] text-slate-500 mt-1">Add a document above to feed instructions to your chatbot.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    {currentUser.knowledgeBase.map((doc, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 border border-slate-800/60 hover:border-slate-800 rounded-2xl flex items-center justify-between gap-4 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/10 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="overflow-hidden">
                            <span className="text-xs font-bold text-slate-200 block truncate" title={doc.name}>{doc.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{doc.size} • Uploaded {doc.uploadedAt}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            removeKnowledgeFile(idx);
                            showToast(`Deleted document "${doc.name}" from knowledge base.`);
                          }}
                          className="p-1.5 hover:bg-rose-500/10 rounded-lg text-rose-400 hover:text-rose-300 transition-colors cursor-pointer shrink-0"
                          title="Delete PDF Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Column 1b: Specific Instructions (Shown conditionally if user has Hand Movement access) */}
            {hasHandMovement ? (
              <div className="bg-slate-900/50 border border-indigo-900/20 p-5 sm:p-6 rounded-3xl space-y-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-400 shrink-0 border border-indigo-500/15">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white leading-snug">Specific Instructions</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Customize override directives for Hand Movement interactions.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <textarea
                    rows={4}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Enter custom override rules, guidelines, greetings or tone directives for the bot..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all leading-relaxed"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveInstructions}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Save Instructions</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/30 border border-dashed border-slate-900 p-5 sm:p-6 rounded-3xl flex items-center gap-4 text-slate-500">
                <ShieldAlert className="w-6 h-6 text-slate-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-400">Specific Instructions Locked</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Your profile does not have Hand Movement access. Contact your administrator to enable custom override guidelines.</p>
                </div>
              </div>
            )}

          </div>

          {/* Column 2: Activation Keywords & Create User Section */}
          <div className="space-y-6">
            
            {/* Activation Keywords Panel */}
            <div className="bg-slate-900/50 border border-slate-800 p-5 sm:p-6 rounded-3xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-400 shrink-0 border border-indigo-500/15">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">Activation Keywords</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Custom triggers to activate special bot gestures.</p>
                </div>
              </div>

              {/* Add trigger */}
              <form onSubmit={handleAddKey} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. bypass"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white placeholder-slate-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer shrink-0"
                >
                  Add Key
                </button>
              </form>

              {/* Trigger Tags */}
              <div className="pt-2">
                <div className="flex flex-wrap gap-1.5 p-3.5 bg-slate-950 border border-slate-800/80 rounded-2xl min-h-[50px]">
                  {!currentUser.activationKeys || currentUser.activationKeys.length === 0 ? (
                    <span className="text-xs text-slate-500 italic my-auto">No keywords configured yet.</span>
                  ) : (
                    currentUser.activationKeys.map((k, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 text-indigo-300 text-xs font-semibold rounded-xl border border-indigo-500/20"
                      >
                        <Key className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span>{k}</span>
                        <button
                          type="button"
                          onClick={() => {
                            removeActivationKey(idx);
                            showToast(`Deleted activation key: "${k}"`);
                          }}
                          className="text-indigo-400 hover:text-rose-400 hover:scale-110 transition-all font-black text-sm ml-0.5 cursor-pointer shrink-0"
                          title="Delete keyword"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Create User Panel (With EXACTLY two fields: Name and Email) - Visible ONLY to Managers */}
            {currentUser.role === 'manager' && (
              <div className="bg-slate-900/50 border border-slate-800 p-5 sm:p-6 rounded-3xl space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-400 shrink-0 border border-indigo-500/15">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-snug">Register New User</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Instantly create a new chatbot client configuration.</p>
                  </div>
                </div>

                {createUserError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-xl flex items-start gap-2.5 text-xs animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{createUserError}</span>
                  </div>
                )}

                {createUserSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3 rounded-xl flex items-start gap-2.5 text-xs animate-fade-in">
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{createUserSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleCreateUser} className="space-y-4">
                  {/* Field 1: Name */}
                  <div>
                    <label htmlFor="user-reg-name" className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      id="user-reg-name"
                      type="text"
                      required
                      placeholder="e.g. Alice Cooper"
                      value={createUserName}
                      onChange={(e) => {
                        setCreateUserName(e.target.value);
                        if (createUserError) setCreateUserError('');
                        if (createUserSuccess) setCreateUserSuccess('');
                      }}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white placeholder-slate-500"
                    />
                  </div>

                  {/* Field 2: Email */}
                  <div>
                    <label htmlFor="user-reg-email" className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      id="user-reg-email"
                      type="email"
                      required
                      placeholder="e.g. alice@example.com"
                      value={createUserEmail}
                      onChange={(e) => {
                        setCreateUserEmail(e.target.value);
                        if (createUserError) setCreateUserError('');
                        if (createUserSuccess) setCreateUserSuccess('');
                      }}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white placeholder-slate-500"
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all cursor-pointer"
                  >
                    <span>Create Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>

        {/* My Managed Users list - Shown only to managers */}
        {currentUser.role === 'manager' && (
          <div className="bg-slate-900/50 border border-slate-800 p-5 sm:p-6 rounded-3xl space-y-4 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-400 shrink-0 border border-indigo-500/15">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">My Registered Clients</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Below are the custom chatbot client accounts created by you.</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-full text-xs font-bold text-indigo-300">
                Total: {managedUsers.length}
              </span>
            </div>

            {managedUsers.length === 0 ? (
              <div className="py-10 px-4 text-center bg-slate-950/40 border border-dashed border-slate-800/80 rounded-2xl">
                <UserCheck className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-400">No client accounts created yet</p>
                <p className="text-[11px] text-slate-500 mt-1">Use the "Register New User" panel to create your first client configuration.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/60 font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Access Protocol</th>
                      <th className="p-4">Created Date</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {managedUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="p-4 font-bold text-white flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 text-xs font-extrabold flex items-center justify-center">
                            {u.name?.charAt(0)}
                          </div>
                          {u.name}
                        </td>
                        <td className="p-4 text-slate-300 font-mono">{u.email}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {u.access?.map((acc, index) => (
                              <span key={index} className="px-2 py-0.5 bg-indigo-950/40 text-indigo-400 border border-indigo-500/10 rounded-md text-[10px] font-bold">
                                {acc}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-slate-400">{u.createdAt}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            u.status === 'active' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600 relative z-10">
        <p>© 2026 BotApp Technologies. Registered clients space.</p>
      </footer>

    </div>
  );
}
