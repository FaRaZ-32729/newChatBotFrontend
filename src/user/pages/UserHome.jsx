import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, Sparkles, Settings, Loader2
} from 'lucide-react';
import { useUser } from '../context/UserContext';

import UserBanner from '../components/UserBanner';
import ChatbotsList from '../components/ChatbotsList';
import CreateChatbotWizard from '../components/CreateChatbotWizard';
import ClientsRegistry from '../components/ClientsRegistry';
import ConfirmationModal from '../../components/ConfirmationModal';
import UserHeader from '../components/UserHeader';
import EditChatbotModal from '../components/EditChatbotModal';

export default function UserHome() {
  const {
    currentUser,
    users,
    logoutUser,
    registerUser,
    chatbots,
    createChatbot,
    updateChatbot,
    deleteChatbot,
    deleteUser,
    isLoadingChatbots,
    isLoadingUsers,
  } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  const [activeTab, setActiveTab] = useState('chatbots');
  const [editingChatbot, setEditingChatbot] = useState(null);
  const [botToDelete, setBotToDelete] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isDeletingBot, setIsDeletingBot] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [toast, setToast] = useState('');

  if (!currentUser) {
    return null;
  }

  const isManager = currentUser.role === 'manager';
  // Managers and their users can create/edit/delete chatbots
  const canManageChatbots = isManager || currentUser.role === 'user';
  const myChatbots = chatbots || [];
  const managedUsers = users || [];

  const hasHeadMovement = (currentUser.access || []).some(
    (a) => String(a).toLowerCase() === 'head movement'
  );
  const hasHandMovement = (currentUser.access || []).some(
    (a) => String(a).toLowerCase() === 'hand movement'
  );

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleSignOutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmSignOut = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await logoutUser();
    setIsLoggingOut(false);
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const handleStartEditBot = (chatbot) => {
    setEditingChatbot(chatbot);
  };

  const handleCreateBot = async (payload) => {
    const result = await createChatbot(payload);
    if (result?.success) {
      showToast(result.message || `Successfully created "${result.chatbot?.name}" chatbot!`);
      setActiveTab('chatbots');
      return { success: true };
    }

    showToast(result?.message || 'Failed to create chatbot.');
    return { success: false, message: result?.message };
  };

  const triggerDeleteChatbot = (chatbot) => {
    setBotToDelete(chatbot);
  };

  const confirmDeleteChatbot = async () => {
    if (!botToDelete || isDeletingBot) return;

    setIsDeletingBot(true);
    const result = await deleteChatbot(botToDelete.id, botToDelete.name);
    setIsDeletingBot(false);

    if (result?.success) {
      showToast(result.message || `Deleted chatbot: "${botToDelete.name}"`);
      setBotToDelete(null);
      return;
    }

    showToast(result?.message || 'Failed to delete chatbot.');
  };

  const triggerDeleteUser = (clientUser) => {
    setUserToDelete(clientUser);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete || isDeletingUser) return;

    setIsDeletingUser(true);
    const result = await deleteUser(userToDelete.id, userToDelete.name);
    setIsDeletingUser(false);

    if (result?.success) {
      showToast(result.message || `Deleted client account: "${userToDelete.name}"`);
      setUserToDelete(null);
      return;
    }

    showToast(result?.message || 'Failed to delete user.');
  };

  return (
    <div id="user-portal-shell" className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

        <UserHeader onSignOut={handleSignOutClick} />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-500/30 animate-fade-in">
          <Sparkles className="w-4 h-4 text-indigo-200 shrink-0" />
          <p className="text-xs font-bold">{toast}</p>
        </div>
      )}

      <main id="user-dashboard-main" className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-10 md:px-16 lg:px-24 py-8 relative z-10 flex flex-col gap-6">
        <UserBanner currentUser={currentUser} />

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

          {canManageChatbots && (
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
          )}

          {isManager && (
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

        {activeTab === 'chatbots' && (
          isLoadingChatbots ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Loading chatbots...</p>
            </div>
          ) : (
            <ChatbotsList
              myChatbots={myChatbots}
              canManage={canManageChatbots}
              onStartEditBot={handleStartEditBot}
              onDeleteBot={triggerDeleteChatbot}
              onSwitchToCreate={() => setActiveTab('create')}
              showToast={showToast}
            />
          )
        )}

        {activeTab === 'create' && canManageChatbots && (
          <CreateChatbotWizard
            hasHeadMovement={hasHeadMovement}
            hasHandMovement={hasHandMovement}
            onCreateBot={handleCreateBot}
            showToast={showToast}
          />
        )}

        {activeTab === 'users' && isManager && (
          isLoadingUsers ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Loading users...</p>
            </div>
          ) : (
            <ClientsRegistry
              managedUsers={managedUsers}
              onRegisterUser={registerUser}
              onDeleteUser={triggerDeleteUser}
            />
          )
        )}
      </main>

      {editingChatbot && canManageChatbots && (
        <EditChatbotModal
          chatbot={editingChatbot}
          onClose={() => setEditingChatbot(null)}
          onUpdateChatbot={updateChatbot}
          hasHeadMovement={hasHeadMovement}
          hasHandMovement={hasHandMovement}
          showToast={showToast}
        />
      )}

      <ConfirmationModal
        isOpen={botToDelete !== null}
        title="Delete Chatbot"
        message={`Are you sure you want to delete "${botToDelete?.name}"? This action cannot be undone.`}
        confirmText={isDeletingBot ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        isDanger={true}
        theme="dark"
        onConfirm={confirmDeleteChatbot}
        onCancel={() => {
          if (!isDeletingBot) setBotToDelete(null);
        }}
      />

      <ConfirmationModal
        isOpen={userToDelete !== null}
        title="Delete User"
        message={`Are you sure you want to delete "${userToDelete?.name}"? This action cannot be undone.`}
        confirmText={isDeletingUser ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        isDanger={true}
        theme="dark"
        onConfirm={confirmDeleteUser}
        onCancel={() => {
          if (!isDeletingUser) setUserToDelete(null);
        }}
      />

      <ConfirmationModal
        isOpen={showLogoutConfirm}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText={isLoggingOut ? 'Signing Out...' : 'Sign Out'}
        cancelText="Cancel"
        isDanger={true}
        theme="dark"
        onConfirm={confirmSignOut}
        onCancel={() => {
          if (!isLoggingOut) setShowLogoutConfirm(false);
        }}
      />

      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600 relative z-10">
        <p>© 2026 BotApp. All rights reserved.</p>
      </footer>
    </div>
  );
}
