import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createUserApi, logoutApi } from '../../api/auth.api';
import { createChatbotApi, deleteChatbotApi, getMyChatbotsApi } from '../../api/chatbot.api';
import { deleteClientUserApi, getUsersByManagerApi } from '../../api/users.api';
import { clearSession, getStoredSession } from '../../utils/authSession';
import { mapChatbotFromApi } from '../../utils/mapChatbot';
import { mapClientUserFromApi } from '../../utils/mapClientUser';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => getStoredSession());
  const [users, setUsers] = useState([]);
  const [chatbots, setChatbots] = useState([]);
  const [isLoadingChatbots, setIsLoadingChatbots] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const fetchChatbots = useCallback(async () => {
    if (!currentUser || currentUser.role === 'admin') {
      setChatbots([]);
      return;
    }

    setIsLoadingChatbots(true);
    try {
      const response = await getMyChatbotsApi();
      setChatbots((response.data || []).map(mapChatbotFromApi));
    } catch (error) {
      console.error('Failed to fetch chatbots:', error);
      setChatbots([]);
    } finally {
      setIsLoadingChatbots(false);
    }
  }, [currentUser]);

  const fetchManagedUsers = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'manager') {
      setUsers([]);
      return;
    }

    setIsLoadingUsers(true);
    try {
      const response = await getUsersByManagerApi(currentUser.id);
      setUsers((response.data?.users || []).map(mapClientUserFromApi));
    } catch (error) {
      console.error('Failed to fetch managed users:', error);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || currentUser.role === 'admin') {
      setChatbots([]);
      setUsers([]);
      return;
    }

    fetchChatbots();

    if (currentUser.role === 'manager') {
      fetchManagedUsers();
    } else {
      setUsers([]);
    }
  }, [currentUser, fetchChatbots, fetchManagedUsers]);

  const createChatbot = async (payload) => {
    try {
      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('activationKey', payload.activationKey);
      formData.append('specificInstructions', payload.specificInstructions);
      formData.append('scanCardRequired', String(payload.scanCardRequired));

      if (payload.headMovementMode) {
        formData.append('headMovementMode', payload.headMovementMode);
      }

      if (payload.handMovements) {
        formData.append('handMovements', JSON.stringify(payload.handMovements));
      }

      formData.append('onboardingImage', payload.onboardingImageFile);

      payload.pdfFiles.forEach((file) => {
        formData.append('knowledgeBasePdfs', file);
      });

      const response = await createChatbotApi(formData);
      const mapped = mapChatbotFromApi(response.data);
      setChatbots((prev) => [mapped, ...prev]);

      return { success: true, chatbot: mapped, message: response.message };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to create chatbot.' };
    }
  };

  const updateChatbot = (botId, updatedBot) => {
    setChatbots((prev) => prev.map((b) => (b.id === botId ? { ...b, ...updatedBot } : b)));
  };

  const deleteChatbot = async (botId, name) => {
    try {
      const response = await deleteChatbotApi(botId);
      await fetchChatbots();
      return {
        success: true,
        message: response.message || `Chatbot "${name || ''}" deleted successfully.`,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to delete chatbot.',
      };
    }
  };

  const syncSession = () => {
    const session = getStoredSession();
    if (!session || session.role === 'admin') {
      setCurrentUser(null);
      return;
    }
    setCurrentUser(session);
  };

  const logoutUser = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentUser(null);
      setChatbots([]);
      setUsers([]);
      clearSession();
    }
  };

  const registerUser = async (name, email) => {
    try {
      const response = await createUserApi({ name, email });
      await fetchManagedUsers();
      return {
        success: true,
        message: response.message || `Successfully registered "${name}". Verification email sent.`,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to register user.',
      };
    }
  };

  const deleteUser = async (userId, name) => {
    try {
      const response = await deleteClientUserApi(userId);
      await fetchManagedUsers();
      return {
        success: true,
        message: response.message || `User "${name || ''}" deleted successfully.`,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to delete user.',
      };
    }
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      users,
      logoutUser,
      syncSession,
      registerUser,
      chatbots,
      createChatbot,
      updateChatbot,
      deleteChatbot,
      deleteUser,
      isLoadingChatbots,
      isLoadingUsers,
      fetchChatbots,
      fetchManagedUsers,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
