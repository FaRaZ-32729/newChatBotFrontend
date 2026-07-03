import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  // Store the logged in user
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Store all users to keep shared state synced with localStorage
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('chatbot_users');
    return saved ? JSON.parse(saved) : [];
  });

  // Keep users synchronized with localStorage
  useEffect(() => {
    localStorage.setItem('chatbot_users', JSON.stringify(users));
    // If the logged-in user is updated, sync their details in current_user too
    if (currentUser) {
      const updatedMe = users.find(u => u.id === currentUser.id);
      if (updatedMe) {
        setCurrentUser(updatedMe);
        localStorage.setItem('current_user', JSON.stringify(updatedMe));
      }
    }
  }, [users]);

  // Store all chatbots to keep state synced across the application
  const [chatbots, setChatbots] = useState(() => {
    const saved = localStorage.getItem('chatbot_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    // Pre-populate with a gorgeous default chatbot if empty
    return [
      {
        id: 'bot_default_1',
        name: 'OmniSphere Assistant',
        onboardingImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        knowledgeBasePdf: 'omnisphere_manual.pdf',
        activationKey: 'wave',
        specificInstructions: 'Act as a premium, highly intellectual concierge. Wave your hand gracefully whenever greeted or activated.',
        createdBy: 'manager@chatbot.com',
        createdAt: '2026-07-02'
      }
    ];
  });

  // Keep chatbots synchronized with localStorage
  useEffect(() => {
    localStorage.setItem('chatbot_list', JSON.stringify(chatbots));
  }, [chatbots]);

  // Create chatbot helper
  const createChatbot = (newBot) => {
    setChatbots(prev => [newBot, ...prev]);
  };

  // Update chatbot helper
  const updateChatbot = (botId, updatedBot) => {
    setChatbots(prev => prev.map(b => b.id === botId ? { ...b, ...updatedBot } : b));
  };

  // Delete chatbot helper
  const deleteChatbot = (botId) => {
    setChatbots(prev => prev.filter(b => b.id !== botId));
  };

  // Handle User Login
  const loginUser = (email) => {
    // Re-fetch users from localStorage to make sure we have the latest from admin changes
    const latestUsersSaved = localStorage.getItem('chatbot_users');
    const latestUsers = latestUsersSaved ? JSON.parse(latestUsersSaved) : users;
    setUsers(latestUsers);

    const user = latestUsers.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
    
    if (!user) {
      return { success: false, error: 'User with this email was not found. Contact administrator.' };
    }

    if (user.status === 'inactive') {
      return { 
        success: false, 
        error: `Your account is deactivated. Reason: ${user.statusReason || 'No specific reason provided.'}` 
      };
    }

    setCurrentUser(user);
    localStorage.setItem('current_user', JSON.stringify(user));
    return { success: true };
  };

  // Sync session on-demand
  const syncSession = () => {
    const saved = localStorage.getItem('current_user');
    setCurrentUser(saved ? JSON.parse(saved) : null);
    
    const latestUsersSaved = localStorage.getItem('chatbot_users');
    if (latestUsersSaved) {
      setUsers(JSON.parse(latestUsersSaved));
    }
  };

  // Handle Logout
  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('current_user');
    localStorage.removeItem('logged_in_user');
    localStorage.removeItem('admin_logged_in');
  };

  // User Action: Add File to Knowledge Base
  const addKnowledgeFile = (fileName, fileSize = '1.2 MB') => {
    if (!currentUser) return;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const files = u.knowledgeBase || [];
        return {
          ...u,
          knowledgeBase: [
            ...files,
            {
              name: fileName.trim(),
              size: fileSize,
              uploadedAt: new Date().toISOString().split('T')[0]
            }
          ]
        };
      }
      return u;
    }));
  };

  // User Action: Remove File from Knowledge Base
  const removeKnowledgeFile = (fileIndex) => {
    if (!currentUser) return;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const files = u.knowledgeBase || [];
        return {
          ...u,
          knowledgeBase: files.filter((_, idx) => idx !== fileIndex)
        };
      }
      return u;
    }));
  };

  // User Action: Add Activation Key
  const addActivationKey = (key) => {
    if (!currentUser || !key.trim()) return;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const keys = u.activationKeys || [];
        if (keys.includes(key.trim().toLowerCase())) return u;
        return {
          ...u,
          activationKeys: [...keys, key.trim().toLowerCase()]
        };
      }
      return u;
    }));
  };

  // User Action: Remove Activation Key
  const removeActivationKey = (keyIndex) => {
    if (!currentUser) return;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const keys = u.activationKeys || [];
        return {
          ...u,
          activationKeys: keys.filter((_, idx) => idx !== keyIndex)
        };
      }
      return u;
    }));
  };

  // User Action: Update Specific Instructions (Only if Hand Movement exists)
  const updateInstructions = (text) => {
    if (!currentUser) return;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          specificInstructions: text
        };
      }
      return u;
    }));
  };

  // User Action: Register / Create New User with Name & Email Only
  const registerUser = (name, email) => {
    // Determine who is creating this user (Manager or Administrator)
    let creatorEmail = 'admin@chatbot.com';
    try {
      const savedUser = localStorage.getItem('logged_in_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.email) {
          creatorEmail = parsed.email;
        }
      }
    } catch (e) {
      console.error(e);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      status: 'active',
      role: 'user',
      access: ['Head Movement'],
      conversations: 0,
      lastActive: 'Never',
      platform: 'Web Widget',
      createdAt: new Date().toISOString().split('T')[0],
      activationKeys: ['salam', 'hello', 'hay'],
      knowledgeBase: [],
      specificInstructions: 'Greet the user warmly. Assist them with navigation.',
      createdBy: creatorEmail,
      otp: otp,
      otpVerified: false,
      password: ''
    };

    // Save last simulated email with OTP in localStorage for easy sandbox retrieval/simulation
    localStorage.setItem('sandbox_last_email_otp', JSON.stringify({
      email: newUser.email,
      otp: otp,
      name: newUser.name,
      type: 'creation'
    }));

    setUsers(prev => [newUser, ...prev]);
    return newUser;
  };

  // Delete user method
  const deleteUser = (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      users,
      loginUser,
      logoutUser,
      syncSession,
      addKnowledgeFile,
      removeKnowledgeFile,
      addActivationKey,
      removeActivationKey,
      updateInstructions,
      registerUser,
      chatbots,
      createChatbot,
      updateChatbot,
      deleteChatbot,
      deleteUser
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
