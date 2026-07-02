import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, LogOut, LayoutDashboard, Sparkles, BookOpen, Key, FileText, 
  Trash2, Plus, ArrowRight, UserCheck, AlertCircle, RefreshCw, CheckCircle, 
  ShieldAlert, Lock, Settings, Upload, Image, FileUp, Layers, ChevronRight, ChevronLeft, ExternalLink
} from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function UserHome() {
  const { 
    currentUser, users, logoutUser, registerUser, chatbots, createChatbot, deleteChatbot
  } = useUser();
  const navigate = useNavigate();

  // Filter chatbots created by the logged in user/manager
  const myChatbots = (chatbots || []).filter(
    c => c.createdBy === currentUser?.email
  );

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

  // Tab State: 'chatbots' | 'create'
  const [activeTab, setActiveTab] = useState('chatbots');

  // Wizard state for chatbot creation
  const [wizardStep, setWizardStep] = useState(1); // 1, 2, 3
  const [botName, setBotName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80');
  const [isDragOver, setIsDragOver] = useState(false);
  const [kbPdfName, setKbPdfName] = useState('');
  const [activationKeyword, setActivationKeyword] = useState('');
  const [botInstructions, setBotInstructions] = useState('');

  // Physical movement configuration states
  const [headMovementMode, setHeadMovementMode] = useState('both'); // 'detecting' | 'talking' | 'both'
  const [handMovementHiDetect, setHandMovementHiDetect] = useState(true);
  const [handMovementHiSaysHi, setHandMovementHiSaysHi] = useState(true);
  const [handMovementByeChatEnds, setHandMovementByeChatEnds] = useState(true);
  const [handMovementThumbsDetect, setHandMovementThumbsDetect] = useState(true);
  const [handMovementThumbsCorrect, setHandMovementThumbsCorrect] = useState(true);

  // Manager state: Register user (exactly 2 fields: Name & Email)
  const [createUserName, setCreateUserName] = useState('');
  const [createUserEmail, setCreateUserEmail] = useState('');
  const [createUserError, setCreateUserError] = useState('');
  const [createUserSuccess, setCreateUserSuccess] = useState('');

  // Toast message
  const [toast, setToast] = useState('');

  if (!currentUser) {
    return null;
  }

  // Trigger toast notification
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  // Drag and drop / File upload handlers
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file (png, jpeg, webp)!');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedAvatar(reader.result);
        showToast('Image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file (png, jpeg, webp)!');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedAvatar(reader.result);
        showToast('Image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Chatbot Creation form submit
  const handleCreateChatbot = (e) => {
    e.preventDefault();
    if (!botName.trim()) {
      showToast('Chatbot Name is required!');
      setWizardStep(1);
      return;
    }
    if (!kbPdfName.trim()) {
      showToast('Knowledge Base PDF is required!');
      setWizardStep(2);
      return;
    }
    if (!activationKeyword.trim()) {
      showToast('Activation Gesture Keyword is required!');
      setWizardStep(2);
      return;
    }
    if (!botInstructions.trim()) {
      showToast('Specific Instructions is required!');
      setWizardStep(3);
      return;
    }

    const finalAvatar = selectedAvatar;
    const finalPdf = kbPdfName.trim() || 'default_knowledge.pdf';
    const finalKey = activationKeyword.trim().toLowerCase() || 'hello';

    const newBot = {
      id: `bot_${Date.now()}`,
      name: botName.trim(),
      onboardingImage: finalAvatar,
      knowledgeBasePdf: finalPdf,
      activationKey: finalKey,
      specificInstructions: botInstructions.trim(),
      createdBy: currentUser.email,
      createdAt: new Date().toISOString().split('T')[0],
      headMovementMode: hasHeadMovement ? headMovementMode : null,
      handMovements: hasHandMovement ? {
        hi: {
          detects: handMovementHiDetect,
          saysHi: handMovementHiSaysHi
        },
        bye: {
          chatEnds: handMovementByeChatEnds
        },
        thumbsUp: {
          detects: handMovementThumbsDetect,
          correctInfo: handMovementThumbsCorrect
        }
      } : null
    };

    createChatbot(newBot);
    showToast(`Successfully created "${newBot.name}" chatbot!`);
    
    // Reset forms
    setBotName('');
    setSelectedAvatar('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80');
    setKbPdfName('');
    setActivationKeyword('');
    setBotInstructions('');
    setHeadMovementMode('both');
    setHandMovementHiDetect(true);
    setHandMovementHiSaysHi(true);
    setHandMovementByeChatEnds(true);
    setHandMovementThumbsDetect(true);
    setHandMovementThumbsCorrect(true);
    setWizardStep(1);
    
    // Switch to list tab
    setActiveTab('chatbots');
  };

  // Handle registering a new user with 2 fields: name & email only (Manager action)
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
    showToast(`Created client account: ${newUser.name}`);
    
    // Reset fields
    setCreateUserName('');
    setCreateUserEmail('');
  };

  const handleSignOut = () => {
    logoutUser();
    navigate('/login');
  };

  const hasHeadMovement = currentUser.access?.includes('Head Movement');
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
              <p className="text-[9px] text-indigo-400 font-bold tracking-wider uppercase mt-1 leading-none">Control Hub</p>
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
              <p className="text-xs font-bold text-indigo-400 tracking-wider uppercase font-mono">
                {currentUser.role === 'manager' ? 'Manager Portal Workspace' : 'Chatbot Integration Client Space'}
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">{currentUser.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{currentUser.email} • {currentUser.role.toUpperCase()}</p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2.5 shrink-0 w-full sm:w-auto">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Access Privileges</span>
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

        {/* Workspace Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 gap-6 mt-2">
          <button
            onClick={() => setActiveTab('chatbots')}
            className={`pb-3 text-sm font-bold tracking-tight transition-all cursor-pointer relative ${
              activeTab === 'chatbots' 
                ? 'text-indigo-400 font-black' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Active Chatbots ({myChatbots.length})</span>
            </div>
            {activeTab === 'chatbots' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('create');
              setWizardStep(1);
            }}
            className={`pb-3 text-sm font-bold tracking-tight transition-all cursor-pointer relative ${
              activeTab === 'create' 
                ? 'text-indigo-400 font-black' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Create New Chatbot</span>
            </div>
            {activeTab === 'create' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>

          {currentUser.role === 'manager' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3 text-sm font-bold tracking-tight transition-all cursor-pointer relative ${
                activeTab === 'users' 
                  ? 'text-indigo-400 font-black' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                <span>Manage Users ({managedUsers.length})</span>
              </div>
              {activeTab === 'users' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
              )}
            </button>
          )}
        </div>

        {/* Tab 1: Chatbots Gallery */}
        {activeTab === 'chatbots' && (
          <div className="space-y-6">
            {myChatbots.length === 0 ? (
              <div className="py-20 px-4 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
                <Bot className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <h3 className="text-base font-extrabold text-slate-300">No Chatbots Configured</h3>
                <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  You haven't built any virtual chatbots yet. Launch our process-driven creator wizard to customize your first chatbot.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('create');
                    setWizardStep(1);
                  }}
                  className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Build First Chatbot</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myChatbots.map((chatbot) => (
                  <div 
                    key={chatbot.id}
                    className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 hover:border-indigo-500/30 transition-all flex flex-col justify-between group relative overflow-hidden shadow-xl"
                  >
                    {/* Corner shine effect */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-bl-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />

                    <div>
                      {/* Avatar & Header */}
                      <div className="flex items-center gap-4.5 mb-4">
                        <img
                          src={chatbot.onboardingImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'}
                          alt={chatbot.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-800 shadow-md group-hover:scale-105 transition-transform"
                        />
                        <div className="overflow-hidden">
                          <h4 className="font-extrabold text-base text-white truncate leading-snug">
                            {chatbot.name}
                          </h4>
                          <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider block mt-0.5">
                            ID: {chatbot.id.substring(4, 10).toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Specs */}
                      <div className="space-y-2 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-850 font-mono text-[11px] text-slate-400">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-900 pb-1.5">
                          <span className="text-slate-500 flex items-center gap-1.5 shrink-0">
                            <FileText className="w-3.5 h-3.5 text-indigo-500" />
                            PDF Core
                          </span>
                          <span className="text-slate-200 text-right truncate" title={chatbot.knowledgeBasePdf}>
                            {chatbot.knowledgeBasePdf}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-500 flex items-center gap-1.5 shrink-0">
                            <Key className="w-3.5 h-3.5 text-indigo-500" />
                            Key Word
                          </span>
                          <span className="text-indigo-300 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/10">
                            "{chatbot.activationKey}"
                          </span>
                        </div>
                      </div>

                      {chatbot.specificInstructions && (
                        <div className="mt-3.5 px-3.5 py-2.5 bg-slate-950/15 border border-dashed border-slate-800 rounded-2xl">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Override Directives</span>
                          <p className="text-[11px] text-slate-400 italic line-clamp-2 leading-relaxed">
                            "{chatbot.specificInstructions}"
                          </p>
                        </div>
                      )}

                      {/* Configured Movements Spec */}
                      {(chatbot.headMovementMode || chatbot.handMovements) && (
                        <div className="mt-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-850 space-y-1.5 font-mono text-[10px] text-slate-400">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Movement Protocol</span>
                          {chatbot.headMovementMode && (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Head Movement:</span>
                              <span className="text-slate-200 capitalize">by {chatbot.headMovementMode}</span>
                            </div>
                          )}
                          {chatbot.handMovements && (
                            <div className="pt-1.5 border-t border-slate-900">
                              <span className="text-[9px] text-slate-500 block mb-1">Hand Gestures Enabled:</span>
                              <div className="flex flex-wrap gap-1">
                                {(chatbot.handMovements.hi?.detects || chatbot.handMovements.hi?.saysHi) && (
                                  <span className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold rounded text-[8px]">"hi"</span>
                                )}
                                {chatbot.handMovements.bye?.chatEnds && (
                                  <span className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold rounded text-[8px]">"bye"</span>
                                )}
                                {(chatbot.handMovements.thumbsUp?.detects || chatbot.handMovements.thumbsUp?.correctInfo) && (
                                  <span className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold rounded text-[8px]">"thumbs up"</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions footer */}
                    <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center gap-2.5">
                      <a
                        href={`/chatbot/${chatbot.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-indigo-600/15 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Launch Assistant</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${chatbot.name}"?`)) {
                            deleteChatbot(chatbot.id);
                            showToast(`Deleted chatbot: "${chatbot.name}"`);
                          }
                        }}
                        className="p-3 bg-slate-950 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 rounded-2xl transition-all cursor-pointer"
                        title="Delete Chatbot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Step-by-Step Creation Wizard */}
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto w-full">
            <div className="bg-slate-900/50 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
              
              {/* Wizard Title Header */}
              <div className="mb-8">
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                  Chatbot Factory Wizard
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Follow the process below to initialize, train, and configure a custom robotic chatbot profile.
                </p>
              </div>

              {/* Progress Indicator Bar */}
              <div className="grid grid-cols-3 gap-2 mb-8 text-center text-xs font-mono">
                <div 
                  onClick={() => setWizardStep(1)}
                  className={`py-2 rounded-xl border transition-all cursor-pointer ${
                    wizardStep === 1 
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300 font-extrabold' 
                      : 'bg-slate-950/40 border-slate-850 text-slate-500'
                  }`}
                >
                  <span className="block text-[10px] font-bold text-slate-400 mb-0.5">STEP 01</span>
                  <span>Core Identity</span>
                </div>
                <div 
                  onClick={() => botName.trim() ? setWizardStep(2) : showToast('Please enter a name first!')}
                  className={`py-2 rounded-xl border transition-all cursor-pointer ${
                    wizardStep === 2 
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300 font-extrabold' 
                      : 'bg-slate-950/40 border-slate-850 text-slate-500'
                  }`}
                >
                  <span className="block text-[10px] font-bold text-slate-400 mb-0.5">STEP 02</span>
                  <span>Training Core</span>
                </div>
                <div 
                  onClick={() => (botName.trim() && kbPdfName.trim()) ? setWizardStep(3) : showToast('Please fill out preceding steps!')}
                  className={`py-2 rounded-xl border transition-all cursor-pointer ${
                    wizardStep === 3 
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300 font-extrabold' 
                      : 'bg-slate-950/40 border-slate-850 text-slate-500'
                  }`}
                >
                  <span className="block text-[10px] font-bold text-slate-400 mb-0.5">STEP 03</span>
                  <span>Behaviors</span>
                </div>
              </div>

              {/* Step Forms */}
              <form onSubmit={handleCreateChatbot} className="space-y-6">
                
                {/* Step 1: Core Identity */}
                {wizardStep === 1 && (
                  <div className="space-y-5 animate-fade-in">
                    {/* Chatbot Name input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                        Chatbot Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Nexus-X7 Assistant"
                        value={botName}
                        onChange={(e) => setBotName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white placeholder-slate-600"
                      />
                    </div>

                    {/* Onboarding Image Selection from Local PC */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-indigo-400" />
                        Onboarding Avatar Image
                      </label>
                      <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                        Upload a premium visual image from your computer to represent this chatbot on its welcome onboarding screen.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Selected Image Preview Area */}
                        <div className="flex flex-col items-center justify-center p-4 bg-slate-950 border border-slate-800 rounded-2xl relative group overflow-hidden">
                          <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest mb-2 block">Avatar Preview</span>
                          <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-800 shadow-md relative">
                            <img
                              src={selectedAvatar}
                              alt="Avatar Preview"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 mt-2 font-mono truncate max-w-full">
                            {selectedAvatar.startsWith('data:image') ? 'Uploaded Image' : 'Default Asset'}
                          </span>
                        </div>

                        {/* Interactive Drag and Drop Upload Area */}
                        <div 
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`md:col-span-2 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 transition-all relative text-center group cursor-pointer ${
                            isDragOver 
                              ? 'border-indigo-500 bg-indigo-500/5' 
                              : 'border-slate-800 hover:border-indigo-500/30 bg-slate-950/40 hover:bg-slate-950/80'
                          }`}
                        >
                          <input
                            type="file"
                            id="avatar-file-upload"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                          <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-2xl mb-2 group-hover:scale-110 transition-transform">
                            <Image className="w-6 h-6" />
                          </div>
                          <p className="text-xs font-bold text-slate-300">Drag & drop your avatar image here</p>
                          <p className="text-[10px] text-slate-500 mt-1">Supports PNG, JPEG, WEBP or GIF</p>
                          
                          <div className="mt-3.5 relative z-20">
                            <label 
                              htmlFor="avatar-file-upload" 
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/15"
                            >
                              <FileUp className="w-3.5 h-3.5" />
                              <span>Choose from Computer</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={() => botName.trim() ? setWizardStep(2) : showToast('Please enter a name first!')}
                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Continue</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Training Core & Trigger */}
                {wizardStep === 2 && (
                  <div className="space-y-5 animate-fade-in">
                    
                    {/* Simulated PDF Upload input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                        <FileUp className="w-3.5 h-3.5 text-indigo-400" />
                        Knowledge Base PDF Name
                      </label>
                      <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                        Input the filename of the documentation PDF file that will act as the chatbot's custom knowledge base.
                      </p>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="e.g. Nexus_FAQ_V4.pdf"
                          value={kbPdfName}
                          onChange={(e) => {
                            let val = e.target.value;
                            setKbPdfName(val);
                          }}
                          className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white placeholder-slate-600 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const samplePDFs = ['nexus_instructions.pdf', 'system_calibration.pdf', 'product_guide_v2.pdf', 'company_faq_v5.pdf'];
                            const selectedSample = samplePDFs[Math.floor(Math.random() * samplePDFs.length)];
                            setKbPdfName(selectedSample);
                            showToast(`Simulated attachment uploaded!`);
                          }}
                          className="px-4 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-2xl text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Attach PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* Activation Key keyword input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-indigo-400" />
                        Activation Gesture Keyword
                      </label>
                      <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                        Type the secret trigger keyword. When users type this word in the chatbot conversation, they will activate on-screen physical animations!
                      </p>
                      <input
                        type="text"
                        required
                        placeholder="e.g. wave, nod, activate, calibrate"
                        value={activationKeyword}
                        onChange={(e) => setActivationKeyword(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white placeholder-slate-600 font-mono"
                      />
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-4 border-t border-slate-850">
                      <button
                        type="button"
                        onClick={() => setWizardStep(1)}
                        className="px-4 py-3 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => (botName.trim() && kbPdfName.trim() && activationKeyword.trim()) ? setWizardStep(3) : showToast('Please complete all fields first!')}
                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Continue</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Specific Directives (Common and Mandatory) */}
                {wizardStep === 3 && (
                  <div className="space-y-5 animate-fade-in">
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Settings className="w-3.5 h-3.5 text-indigo-400" />
                          Specific Instructions <span className="text-rose-500">*</span>
                        </label>
                        
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-[9px] font-mono font-bold uppercase">
                          Mandatory Field
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                        Specify explicit directives, override prompts, or greeting rules for the chatbot to run. This field is mandatory for all access levels.
                      </p>
                      <textarea
                        rows={4}
                        required
                        value={botInstructions}
                        onChange={(e) => setBotInstructions(e.target.value)}
                        placeholder="e.g. Always respond with an intellectual tone. When the activation keyword is detected, proceed with wave and acknowledge user's instructions warmly..."
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                      />
                    </div>

                    {/* Physical Movement Protocol Configuration */}
                    {(hasHeadMovement || hasHandMovement) && (
                      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4 text-left">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
                          <Bot className="w-4 h-4 text-indigo-400" />
                          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                            Mechanical Movement Settings
                          </h4>
                        </div>

                        {/* Head Movement Configuration */}
                        {hasHeadMovement && (
                          <div className="space-y-2">
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              Head Movement Trigger
                            </label>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                              Configure when the virtual neck joint alignment motors should initiate pitch and yaw articulation.
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: 'detecting', label: 'By detecting' },
                                { id: 'talking', label: 'By talking' },
                                { id: 'both', label: 'By both' }
                              ].map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => setHeadMovementMode(item.id)}
                                  className={`py-2 px-3 rounded-xl border text-[10px] font-bold tracking-wide transition-all cursor-pointer text-center ${
                                    headMovementMode === item.id
                                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Hand Movement Configuration Checklist */}
                        {hasHandMovement && (
                          <div className={`space-y-3 pt-3 ${hasHeadMovement ? 'border-t border-slate-850' : ''}`}>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              Hand Gesture Triggers Checklist
                            </label>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                              Configure the conditions and messages under which virtual hand wave/thumbs-up gestures are triggered.
                            </p>

                            <div className="space-y-3">
                              {/* Command hi */}
                              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                    Command: "hi" (Hand Wave)
                                  </span>
                                </div>
                                <div className="space-y-2 pt-1">
                                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={handMovementHiDetect}
                                      onChange={(e) => setHandMovementHiDetect(e.target.checked)}
                                      className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                    />
                                    <span>when person detects</span>
                                  </label>
                                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={handMovementHiSaysHi}
                                      onChange={(e) => setHandMovementHiSaysHi(e.target.checked)}
                                      className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                    />
                                    <span>when person says hi</span>
                                  </label>
                                </div>
                              </div>

                              {/* Command bye */}
                              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                    Command: "bye" (Farewell Wave)
                                  </span>
                                </div>
                                <div className="space-y-2 pt-1">
                                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={handMovementByeChatEnds}
                                      onChange={(e) => setHandMovementByeChatEnds(e.target.checked)}
                                      className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                    />
                                    <span>when chat ends</span>
                                  </label>
                                </div>
                              </div>

                              {/* Command thumbs up */}
                              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                    Command: "thumbs up"
                                  </span>
                                </div>
                                <div className="space-y-2 pt-1">
                                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={handMovementThumbsDetect}
                                      onChange={(e) => setHandMovementThumbsDetect(e.target.checked)}
                                      className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                    />
                                    <span>when person detects</span>
                                  </label>
                                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={handMovementThumbsCorrect}
                                      onChange={(e) => setHandMovementThumbsCorrect(e.target.checked)}
                                      className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                    />
                                    <span>on correct information</span>
                                  </label>
                                </div>
                              </div>

                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Summary confirmation */}
                    <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-1.5 font-mono text-[11px]">
                      <h4 className="font-bold text-slate-300">Ready for compilation:</h4>
                      <p className="text-slate-500">Name: <span className="text-slate-300 font-bold">{botName}</span></p>
                      <p className="text-slate-500">Trigger key: <span className="text-indigo-300 font-bold">"{activationKeyword}"</span></p>
                      <p className="text-slate-500">Doc database: <span className="text-slate-300">{kbPdfName || 'default_knowledge.pdf'}</span></p>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-4 border-t border-slate-850">
                      <button
                        type="button"
                        onClick={() => setWizardStep(2)}
                        className="px-4 py-3 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>

                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Create & Deploy Chatbot</span>
                      </button>
                    </div>
                  </div>
                )}

              </form>
            </div>
          </div>
        )}

        {/* Tab 3: Manage Users - Visible ONLY to Managers */}
        {activeTab === 'users' && currentUser.role === 'manager' && (
          <div className="bg-slate-900/50 border border-slate-800 p-5 sm:p-6 rounded-3xl space-y-6 mt-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-400 shrink-0 border border-indigo-500/15">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">Manager Administration Console</h3>
                  <p className="text-xs text-slate-400 mt-0.5">As a Manager, you hold exclusive permission to register and monitor client user accounts.</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-full text-xs font-bold text-indigo-300">
                Managed Clients: {managedUsers.length}
              </span>
            </div>

            {/* Grid Layout: Create User (Left) & User List (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Register User Panel (With EXACTLY two fields: Name and Email) */}
              <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl space-y-4 h-fit">
                <div>
                  <h4 className="text-sm font-extrabold text-white">Register New Client Account</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Instantly configure basic access keys for a new client user.</p>
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
                    <label htmlFor="user-reg-name" className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Client Full Name
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
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white placeholder-slate-600"
                    />
                  </div>

                  {/* Field 2: Email */}
                  <div>
                    <label htmlFor="user-reg-email" className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Client Email Address
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
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white placeholder-slate-600 font-mono"
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    <span>Deploy Client Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* My Managed Users list */}
              <div className="lg:col-span-2 space-y-3">
                <div>
                  <h4 className="text-sm font-extrabold text-white">Registered Client User Registry</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Below are the client user profiles deployed and managed under your license.</p>
                </div>

                {managedUsers.length === 0 ? (
                  <div className="py-12 px-4 text-center bg-slate-950/40 border border-dashed border-slate-800/80 rounded-2xl">
                    <UserCheck className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-400">No client accounts created yet</p>
                    <p className="text-[11px] text-slate-500 mt-1">Use the register form to create your first client configuration.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-850 bg-slate-950">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-850 bg-slate-900/40 font-bold text-slate-400 uppercase tracking-wider text-[10px] font-mono">
                          <th className="p-4">Name</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Access Protocol</th>
                          <th className="p-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {managedUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-900/20 transition-colors">
                            <td className="p-4 font-bold text-white flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-300 text-xs font-extrabold flex items-center justify-center">
                                {u.name?.charAt(0)}
                              </div>
                              {u.name}
                            </td>
                            <td className="p-4 text-slate-300 font-mono text-[11px]">{u.email}</td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {u.access?.map((acc, index) => (
                                  <span key={index} className="px-2 py-0.5 bg-indigo-950/40 text-indigo-400 border border-indigo-500/10 rounded-md text-[10px] font-bold">
                                    {acc}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                u.status === 'active' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}>
                                <span className={`w-1 h-1 rounded-full ${u.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
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

            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600 relative z-10">
        <p>© 2026 BotApp Technologies. Multi-joint virtual chatbot simulation panel.</p>
      </footer>

    </div>
  );
}
