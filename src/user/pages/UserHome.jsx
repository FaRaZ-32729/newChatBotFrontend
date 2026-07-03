import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, LogOut, Sparkles, Settings, Upload, FileUp, X, Check, Copy, Edit2
} from 'lucide-react';
import { useUser } from '../context/UserContext';

// Import newly broken out modular sub-components
import UserBanner from '../components/UserBanner';
import ChatbotsList from '../components/ChatbotsList';
import CreateChatbotWizard from '../components/CreateChatbotWizard';
import ClientsRegistry from '../components/ClientsRegistry';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function UserHome() {
  const { 
    currentUser, users, logoutUser, registerUser, chatbots, createChatbot, updateChatbot, deleteChatbot, deleteUser
  } = useUser();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  // Tab State: 'chatbots' | 'create' | 'users'
  const [activeTab, setActiveTab] = useState('chatbots');

  // Edit chatbot modal states
  const [editingChatbot, setEditingChatbot] = useState(null);
  const [editBotName, setEditBotName] = useState('');
  const [editSelectedAvatar, setEditSelectedAvatar] = useState('');
  const [editIsDragOver, setEditIsDragOver] = useState(false);
  const [editKbPdfName, setEditKbPdfName] = useState('');
  const [editActivationKeyword, setEditActivationKeyword] = useState('');
  const [editBotInstructions, setEditBotInstructions] = useState('');
  const [editHeadMovementMode, setEditHeadMovementMode] = useState('both');
  const [editHandMovementHiDetect, setEditHandMovementHiDetect] = useState(true);
  const [editHandMovementHiSaysHi, setEditHandMovementHiSaysHi] = useState(true);
  const [editHandMovementByeChatEnds, setEditHandMovementByeChatEnds] = useState(true);
  const [editHandMovementThumbsDetect, setEditHandMovementThumbsDetect] = useState(true);
  const [editHandMovementThumbsCorrect, setEditHandMovementThumbsCorrect] = useState(true);

  // Custom Confirmation Modal targets
  const [botToDelete, setBotToDelete] = useState(null); // chatbot object or null
  const [userToDelete, setUserToDelete] = useState(null); // user object or null

  // Toast message
  const [toast, setToast] = useState('');

  if (!currentUser) {
    return null;
  }

  // Filter chatbots created by the logged in user/manager
  const myChatbots = (chatbots || []).filter(
    c => c.createdBy === currentUser?.email
  );

  // Filter clients to show only those created by this manager
  const managedUsers = (users || []).filter(
    u => u.createdBy === currentUser?.email
  );

  const hasHeadMovement = currentUser.access?.includes('Head Movement');
  const hasHandMovement = currentUser.access?.includes('Hand Movement');

  // Trigger toast notification
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleSignOut = () => {
    logoutUser();
    navigate('/login');
  };

  // Edit avatar handlers
  const handleEditImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file (png, jpeg, webp)!');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setEditSelectedAvatar(reader.result);
        showToast('Edit avatar updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditDragOver = (e) => {
    e.preventDefault();
    setEditIsDragOver(true);
  };

  const handleEditDragLeave = () => {
    setEditIsDragOver(false);
  };

  const handleEditDrop = (e) => {
    e.preventDefault();
    setEditIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file (png, jpeg, webp)!');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setEditSelectedAvatar(reader.result);
        showToast('Edit avatar updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Chatbot Update form submit
  const handleUpdateChatbot = (e) => {
    e.preventDefault();
    if (!editBotName.trim()) {
      showToast('Chatbot Name is required!');
      return;
    }
    if (!editKbPdfName.trim()) {
      showToast('Knowledge Base PDF is required!');
      return;
    }
    if (!editActivationKeyword.trim()) {
      showToast('Activation Gesture Keyword is required!');
      return;
    }
    if (!editBotInstructions.trim()) {
      showToast('Specific Instructions is required!');
      return;
    }

    const updatedBot = {
      name: editBotName.trim(),
      onboardingImage: editSelectedAvatar,
      knowledgeBasePdf: editKbPdfName.trim(),
      activationKey: editActivationKeyword.trim().toLowerCase(),
      specificInstructions: editBotInstructions.trim(),
      headMovementMode: hasHeadMovement ? editHeadMovementMode : null,
      handMovements: hasHandMovement ? {
        hi: {
          detects: editHandMovementHiDetect,
          saysHi: editHandMovementHiSaysHi
        },
        bye: {
          chatEnds: editHandMovementByeChatEnds
        },
        thumbsUp: {
          detects: editHandMovementThumbsDetect,
          correctInfo: editHandMovementThumbsCorrect
        }
      } : null
    };

    updateChatbot(editingChatbot.id, updatedBot);
    showToast(`Successfully updated "${editBotName.trim()}" chatbot!`);
    setEditingChatbot(null);
  };

  // Handle callback for starting editing of chatbot
  const handleStartEditBot = (chatbot) => {
    setEditingChatbot(chatbot);
    setEditBotName(chatbot.name);
    setEditSelectedAvatar(chatbot.onboardingImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80');
    setEditKbPdfName(chatbot.knowledgeBasePdf || '');
    setEditActivationKeyword(chatbot.activationKey || '');
    setEditBotInstructions(chatbot.specificInstructions || '');
    setEditHeadMovementMode(chatbot.headMovementMode || 'both');
    setEditHandMovementHiDetect(chatbot.handMovements?.hi?.detects ?? true);
    setEditHandMovementHiSaysHi(chatbot.handMovements?.hi?.saysHi ?? true);
    setEditHandMovementByeChatEnds(chatbot.handMovements?.bye?.chatEnds ?? true);
    setEditHandMovementThumbsDetect(chatbot.handMovements?.thumbsUp?.detects ?? true);
    setEditHandMovementThumbsCorrect(chatbot.handMovements?.thumbsUp?.correctInfo ?? true);
  };

  // Chatbot creation callback
  const handleCreateBotSuccess = (newBot) => {
    createChatbot(newBot);
    showToast(`Successfully created "${newBot.name}" chatbot!`);
    setActiveTab('chatbots');
  };

  // Delete handlers
  const triggerDeleteChatbot = (chatbot) => {
    setBotToDelete(chatbot);
  };

  const confirmDeleteChatbot = () => {
    if (botToDelete) {
      deleteChatbot(botToDelete.id);
      showToast(`Deleted chatbot: "${botToDelete.name}"`);
      setBotToDelete(null);
    }
  };

  const triggerDeleteUser = (clientUser) => {
    setUserToDelete(clientUser);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
      showToast(`Deleted client account: "${userToDelete.name}"`);
      setUserToDelete(null);
    }
  };

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
            <div className="text-left">
              <h1 className="font-extrabold text-base tracking-tight leading-none text-white">BotApp</h1>
              <p className="text-[9px] text-indigo-400 font-bold tracking-wider uppercase mt-1 leading-none">Control Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
        
        {/* User Hero Banner Component */}
        <UserBanner currentUser={currentUser} />

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
              <Bot className="w-4 h-4" />
              <span>Active Chatbots ({myChatbots.length})</span>
            </div>
            {activeTab === 'chatbots' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`pb-3 text-sm font-bold tracking-tight transition-all cursor-pointer relative ${
              activeTab === 'create' 
                ? 'text-indigo-400 font-black' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
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
                <Settings className="w-4 h-4" />
                <span>Manage Users ({managedUsers.length})</span>
              </div>
              {activeTab === 'users' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
              )}
            </button>
          )}
        </div>

        {/* Tab content conditional rendering */}
        {activeTab === 'chatbots' && (
          <ChatbotsList 
            myChatbots={myChatbots} 
            onStartEditBot={handleStartEditBot}
            onDeleteBot={triggerDeleteChatbot}
            onSwitchToCreate={() => setActiveTab('create')}
            showToast={showToast}
          />
        )}

        {activeTab === 'create' && (
          <CreateChatbotWizard 
            currentUser={currentUser}
            hasHeadMovement={hasHeadMovement}
            hasHandMovement={hasHandMovement}
            onCreateBot={handleCreateBotSuccess}
            showToast={showToast}
          />
        )}

        {activeTab === 'users' && currentUser.role === 'manager' && (
          <ClientsRegistry 
            managedUsers={managedUsers}
            onRegisterUser={registerUser}
            onDeleteUser={triggerDeleteUser}
          />
        )}

      </main>

      {/* Edit Chatbot Modal */}
      {editingChatbot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setEditingChatbot(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-800 text-left">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Edit Chatbot Settings</h3>
                <p className="text-[11px] text-slate-500">Modify mechanical and behavioral parameters of "{editingChatbot.name}"</p>
              </div>
            </div>

            <form onSubmit={handleUpdateChatbot} className="space-y-5 text-left">
              {/* Chatbot Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Chatbot Name
                </label>
                <input
                  type="text"
                  required
                  value={editBotName}
                  onChange={(e) => setEditBotName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white"
                />
              </div>

              {/* Onboarding Image upload */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  Onboarding Avatar Image
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center justify-center p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                    <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest mb-1.5 block">Avatar Preview</span>
                    <img
                      src={editSelectedAvatar}
                      alt="Avatar Preview"
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-800 shadow-md"
                    />
                  </div>
                  <div 
                    onDragOver={handleEditDragOver}
                    onDragLeave={handleEditDragLeave}
                    onDrop={handleEditDrop}
                    className={`md:col-span-2 flex flex-col items-center justify-center border border-dashed rounded-2xl p-4 transition-all relative text-center cursor-pointer ${
                      editIsDragOver 
                        ? 'border-indigo-500 bg-indigo-500/5 animate-pulse' 
                        : 'border-slate-800 hover:border-indigo-500/30 bg-slate-950/40'
                    }`}
                  >
                    <input
                      type="file"
                      id="edit-avatar-upload"
                      accept="image/*"
                      onChange={handleEditImageFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <p className="text-[11px] font-bold text-slate-300">Drag & drop avatar here, or click below</p>
                    <label 
                      htmlFor="edit-avatar-upload" 
                      className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 shadow-md shadow-indigo-600/15"
                    >
                      <FileUp className="w-3 h-3" />
                      <span>Choose File</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Knowledge Base PDF Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Knowledge Base PDF Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={editKbPdfName}
                    onChange={(e) => setEditKbPdfName(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const samplePDFs = ['nexus_instructions.pdf', 'system_calibration.pdf', 'product_guide_v2.pdf', 'company_faq_v5.pdf'];
                      const selectedSample = samplePDFs[Math.floor(Math.random() * samplePDFs.length)];
                      setEditKbPdfName(selectedSample);
                      showToast(`Simulated attachment uploaded!`);
                    }}
                    className="px-4 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-2xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Attach PDF</span>
                  </button>
                </div>
              </div>

              {/* Activation Gesture Keyword */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Activation Gesture Keyword
                </label>
                <input
                  type="text"
                  required
                  value={editActivationKeyword}
                  onChange={(e) => setEditActivationKeyword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white font-mono"
                />
              </div>

              {/* Specific Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Specific Instructions (Mandatory)
                </label>
                <textarea
                  rows={3}
                  required
                  value={editBotInstructions}
                  onChange={(e) => setEditBotInstructions(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              {/* Mechanical Movement Settings */}
              {(hasHeadMovement || hasHandMovement) && (
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-850 pb-1.5">
                    Mechanical Movement Settings
                  </span>

                  {/* Head Movement */}
                  {hasHeadMovement && (
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Head Movement Trigger</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'detecting', label: 'By detecting' },
                          { id: 'talking', label: 'By talking' },
                          { id: 'both', label: 'By both' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setEditHeadMovementMode(item.id)}
                            className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer text-center ${
                              editHeadMovementMode === item.id
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

                  {/* Hand Movement */}
                  {hasHandMovement && (
                    <div className={`space-y-2 pt-2 ${hasHeadMovement ? 'border-t border-slate-850' : ''}`}>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Hand Gesture Triggers Checklist</label>
                      <div className="space-y-2 text-left">
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                          <input
                            type="checkbox"
                            checked={editHandMovementHiDetect}
                            onChange={(e) => setEditHandMovementHiDetect(e.target.checked)}
                            className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>Detect and wave on greeting ("hi")</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                          <input
                            type="checkbox"
                            checked={editHandMovementHiSaysHi}
                            onChange={(e) => setEditHandMovementHiSaysHi(e.target.checked)}
                            className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>Wave hand when bot says "hi"</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                          <input
                            type="checkbox"
                            checked={editHandMovementByeChatEnds}
                            onChange={(e) => setEditHandMovementByeChatEnds(e.target.checked)}
                            className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>Wave hand on exit ("bye")</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                          <input
                            type="checkbox"
                            checked={editHandMovementThumbsDetect}
                            onChange={(e) => setEditHandMovementThumbsDetect(e.target.checked)}
                            className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>Thumbs up on acknowledgement</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                          <input
                            type="checkbox"
                            checked={editHandMovementThumbsCorrect}
                            onChange={(e) => setEditHandMovementThumbsCorrect(e.target.checked)}
                            className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>Thumbs up when user confirms accuracy</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingChatbot(null)}
                  className="px-4 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Chatbot Deletion */}
      <ConfirmationModal 
        isOpen={botToDelete !== null}
        title="Delete Chatbot Profile"
        message={`Are you sure you want to permanently delete "${botToDelete?.name}"? All custom system parameters, conversation channels, activation keys, and simulated joints calibration will be purged immediately.`}
        confirmText="Confirm Delete"
        cancelText="Cancel"
        isDanger={true}
        theme="dark"
        onConfirm={confirmDeleteChatbot}
        onCancel={() => setBotToDelete(null)}
      />

      {/* Confirmation Modal for Managed Client Deletion */}
      <ConfirmationModal 
        isOpen={userToDelete !== null}
        title="Delete Client Account"
        message={`Are you sure you want to delete "${userToDelete?.name}"? This will terminate their active session access, and revoke their virtual environments licensing keys.`}
        confirmText="Confirm Delete"
        cancelText="Cancel"
        isDanger={true}
        theme="dark"
        onConfirm={confirmDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600 relative z-10">
        <p>© 2026 BotApp Technologies. Multi-joint virtual chatbot simulation panel.</p>
      </footer>

    </div>
  );
}
