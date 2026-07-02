import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { INITIAL_USERS } from '../data/initialUser';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('admin_logged_in') === 'true';
  });
  const [adminEmail, setAdminEmail] = useState('admin@chatbot.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Toast Success Notification state
  const [toastMessage, setToastMessage] = useState(null);

  // Users State
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('chatbot_users');
    const parsed = saved ? JSON.parse(saved) : INITIAL_USERS;
    return parsed.map(u => ({
      ...u,
      role: u.role || 'user',
      access: Array.isArray(u.access) ? u.access : (u.access ? [u.access] : []),
      activationKeys: u.activationKeys || ['salam', 'hello', 'hay'],
      knowledgeBase: u.knowledgeBase || [
        { name: 'general_faq.pdf', size: '1.2 MB', uploadedAt: '2026-06-15' },
        { name: 'system_commands.pdf', size: '420 KB', uploadedAt: '2026-06-16' }
      ],
      specificInstructions: u.specificInstructions || 'Greet the user warmly. Assist them with navigation and shortcuts.'
    }));
  });

  // Sync users to localStorage
  useEffect(() => {
    localStorage.setItem('chatbot_users', JSON.stringify(users));
  }, [users]);

  // Toast helper
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handle Login submission
  const login = (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check in local storage or state first to find matches for Admin, Managers, and Users
    const latestUsersSaved = localStorage.getItem('chatbot_users');
    const latestUsers = latestUsersSaved ? JSON.parse(latestUsersSaved) : users;
    const userProfile = latestUsers.find(u => u.email.trim().toLowerCase() === cleanEmail);
    
    if (userProfile) {
      if (userProfile.status === 'inactive') {
        setLoginError(`Your account is deactivated. Reason: ${userProfile.statusReason || 'No reason specified.'}`);
        return { success: false };
      }
      
      if (password === 'password123') {
        const userRole = userProfile.role || 'user';
        setIsLoggedIn(userRole === 'admin');
        if (userRole === 'admin') {
          localStorage.setItem('admin_logged_in', 'true');
        } else {
          localStorage.removeItem('admin_logged_in');
        }
        setLoginError('');
        
        const profile = {
          ...userProfile,
          role: userRole
        };
        localStorage.setItem('logged_in_user', JSON.stringify(profile));
        
        if (userRole === 'admin') {
          localStorage.removeItem('current_user'); // Clear user hub session if any
          showToast('Successfully logged in as administrator!');
          return { success: true, role: 'admin', redirect: '/admin/dashboard' };
        } else {
          localStorage.setItem('current_user', JSON.stringify(profile));
          showToast(`Successfully logged in as ${userRole === 'manager' ? 'manager' : 'client'}!`);
          return { success: true, role: userRole, redirect: '/' };
        }
      } else {
        setLoginError('Invalid password. For sandbox testing, use "password123".');
        return { success: false };
      }
    }
    
    // Generic fallback for standard hardcoded accounts if somehow cleared from database
    if (cleanEmail === 'admin@chatbot.com' && password === 'password123') {
      setIsLoggedIn(true);
      setLoginError('');
      localStorage.setItem('admin_logged_in', 'true');
      const adminProfile = { email: cleanEmail, role: 'admin', name: 'System Admin', access: ['Head Movement', 'Hand Movement'] };
      localStorage.setItem('logged_in_user', JSON.stringify(adminProfile));
      localStorage.removeItem('current_user');
      showToast('Successfully logged in as administrator!');
      return { success: true, role: 'admin', redirect: '/admin/dashboard' };
    }
    
    if (cleanEmail === 'manager@chatbot.com' && password === 'password123') {
      setIsLoggedIn(false);
      localStorage.removeItem('admin_logged_in');
      setLoginError('');
      const managerProfile = { 
        id: 'mgr_1',
        email: cleanEmail, 
        role: 'manager', 
        name: 'Manager User',
        access: ['Head Movement', 'Hand Movement'],
        status: 'active'
      };
      localStorage.setItem('logged_in_user', JSON.stringify(managerProfile));
      localStorage.setItem('current_user', JSON.stringify(managerProfile));
      showToast('Successfully logged in as manager!');
      return { success: true, role: 'manager', redirect: '/' };
    }

    setLoginError('Invalid email or password. Verify details and try again.');
    return { success: false };
  };

  // Handle Logout
  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('logged_in_user');
    localStorage.removeItem('current_user');
    showToast('Logged out successfully.');
  };

  // Delete User
  const deleteUser = (userId, name) => {
    if (confirm(`Are you sure you want to delete user ${name}?`)) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast(`User "${name}" has been deleted.`);
      return true;
    }
    return false;
  };

  // Toggle Status Inline
  const toggleUserStatus = (userId) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const nextStatus = u.status === 'active' ? 'inactive' : 'active';
          showToast(`Changed status for ${u.name} to ${nextStatus}.`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  // Add Activation Key
  const addActivationKey = (userId, key) => {
    if (!key.trim()) return;
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const keys = u.activationKeys || [];
        if (keys.includes(key.trim().toLowerCase())) return u;
        return {
          ...u,
          activationKeys: [...keys, key.trim().toLowerCase()]
        };
      }
      return u;
    }));
    showToast(`Added activation key "${key.trim()}"`);
  };

  // Remove Activation Key
  const removeActivationKey = (userId, keyIndex) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const keys = u.activationKeys || [];
        const updatedKeys = keys.filter((_, idx) => idx !== keyIndex);
        return {
          ...u,
          activationKeys: updatedKeys
        };
      }
      return u;
    }));
    showToast(`Removed activation key`);
  };

  // Update Specific Instructions
  const updateInstructions = (userId, text) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          specificInstructions: text
        };
      }
      return u;
    }));
    showToast(`Instructions updated successfully`);
  };

  // Add PDF to Knowledge Base
  const addKnowledgeFile = (userId, fileName, fileSize = '1.5 MB') => {
    if (!fileName.trim()) return;
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
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
    showToast(`Uploaded "${fileName}" to Knowledge Base`);
  };

  // Remove PDF from Knowledge Base
  const removeKnowledgeFile = (userId, fileIndex) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const files = u.knowledgeBase || [];
        const updatedFiles = files.filter((_, idx) => idx !== fileIndex);
        return {
          ...u,
          knowledgeBase: updatedFiles
        };
      }
      return u;
    }));
    showToast(`Removed document from Knowledge Base`);
  };

  // Create User
  const createUser = (newUser) => {
    setUsers(prev => [newUser, ...prev]);
    showToast(`Successfully created user: ${newUser.name}`);
  };

  // Update User
  const updateUser = (userId, updatedFields) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          ...updatedFields
        };
      }
      return u;
    }));
    showToast(`Successfully updated user: ${updatedFields.name}`);
  };

  // Computed metrics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const inactive = total - active;
    const totalConversations = users.reduce((acc, u) => acc + u.conversations, 0);
    return { total, active, inactive, totalConversations };
  }, [users]);

  return (
    <AdminContext.Provider value={{
      isLoggedIn,
      adminEmail,
      adminPassword,
      loginError,
      setAdminEmail,
      setAdminPassword,
      setLoginError,
      login,
      logout,
      users,
      stats,
      toastMessage,
      showToast,
      deleteUser,
      toggleUserStatus,
      addActivationKey,
      removeActivationKey,
      updateInstructions,
      addKnowledgeFile,
      removeKnowledgeFile,
      createUser,
      updateUser
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
