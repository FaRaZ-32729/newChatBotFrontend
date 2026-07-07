  import { useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { 
    Bot, Sparkles, Settings
  } from 'lucide-react';
  import { useUser } from '../context/UserContext';

  // Import newly broken out modular sub-components
  import UserBanner from '../components/UserBanner';
  import ChatbotsList from '../components/ChatbotsList';
  import CreateChatbotWizard from '../components/CreateChatbotWizard';
  import ClientsRegistry from '../components/ClientsRegistry';
  import ConfirmationModal from '../../components/ConfirmationModal';
  import UserHeader from '../components/UserHeader';
  import EditChatbotModal from '../components/EditChatbotModal';

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

    // Edit chatbot modal target
    const [editingChatbot, setEditingChatbot] = useState(null);

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

    const handleSignOut = async () => {
      await logoutUser();
      navigate('/login');
    };

    // Handle callback for starting editing of chatbot
    const handleStartEditBot = (chatbot) => {
      setEditingChatbot(chatbot);
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

        {/* Modular Header */}
        <UserHeader onSignOut={handleSignOut} />

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
                <span>Chatbots ({myChatbots.length})</span>
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
                <span>Create Chatbot</span>
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
                  <span>Users ({managedUsers.length})</span>
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
          <EditChatbotModal
            chatbot={editingChatbot}
            onClose={() => setEditingChatbot(null)}
            onUpdateChatbot={updateChatbot}
            hasHeadMovement={hasHeadMovement}
            hasHandMovement={hasHandMovement}
            showToast={showToast}
          />
        )}

        {/* Confirmation Modal for Chatbot Deletion */}
        <ConfirmationModal 
          isOpen={botToDelete !== null}
          title="Delete Chatbot"
          message={`Are you sure you want to delete "${botToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isDanger={true}
          theme="dark"
          onConfirm={confirmDeleteChatbot}
          onCancel={() => setBotToDelete(null)}
        />

        {/* Confirmation Modal for Managed Client Deletion */}
        <ConfirmationModal 
          isOpen={userToDelete !== null}
          title="Delete User"
          message={`Are you sure you want to delete "${userToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isDanger={true}
          theme="dark"
          onConfirm={confirmDeleteUser}
          onCancel={() => setUserToDelete(null)}
        />

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600 relative z-10">
          <p>© 2026 BotApp. All rights reserved.</p>
        </footer>

      </div>
    );
  }
