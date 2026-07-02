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

    const newUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      status: 'active',
      access: ['Head Movement'],
      conversations: 0,
      lastActive: 'Never',
      platform: 'Web Widget',
      createdAt: new Date().toISOString().split('T')[0],
      activationKeys: ['salam', 'hello', 'hay'],
      knowledgeBase: [],
      specificInstructions: 'Greet the user warmly. Assist them with navigation.',
      createdBy: creatorEmail
    };

    setUsers(prev => [newUser, ...prev]);
    return newUser;
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
      registerUser
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
