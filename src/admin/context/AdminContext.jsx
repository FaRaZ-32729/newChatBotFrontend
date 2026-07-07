import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createUserApi, loginApi, logoutApi } from '../../api/auth.api';
import { deleteManagerApi, getAllManagersApi, updateManagerApi } from '../../api/users.api';
import { toBackendAccess } from '../../utils/access';
import { mapManagerToUser } from '../../utils/mapManager';
import { clearSession, getRedirectPath, saveSession } from '../../utils/authSession';

const AdminContext = createContext(null);

const EMPTY_STATS = { total: 0, active: 0, inactive: 0 };

export function AdminProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('admin_logged_in') === 'true';
  });
  const [loginError, setLoginError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchManagers = useCallback(async () => {
    setIsLoadingManagers(true);
    try {
      const response = await getAllManagersApi();
      const { managers, stats: apiStats } = response.data;

      setUsers(managers.map(mapManagerToUser));
      setStats({
        total: apiStats.total,
        active: apiStats.active,
        inactive: apiStats.inactive,
      });
    } catch (error) {
      console.error('Failed to fetch managers:', error);
      showToast(error.message || 'Failed to load managers.');
    } finally {
      setIsLoadingManagers(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchManagers();
    } else {
      setUsers([]);
      setStats(EMPTY_STATS);
    }
  }, [isLoggedIn, fetchManagers]);

  const login = async (email, password) => {
    try {
      const response = await loginApi(email.trim(), password);
      const user = response.data.user;

      saveSession(user);
      setIsLoggedIn(user.role === 'admin');
      setLoginError('');

      const roleLabel = user.role === 'admin'
        ? 'administrator'
        : user.role === 'manager'
          ? 'manager'
          : 'client';

      showToast(`Successfully logged in as ${roleLabel}!`);

      return {
        success: true,
        role: user.role,
        redirect: getRedirectPath(user.role),
      };
    } catch (error) {
      setLoginError(error.message || 'Login failed. Please try again.');
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggedIn(false);
      clearSession();
      setUsers([]);
      setStats(EMPTY_STATS);
      showToast('Logged out successfully.');
    }
  };

  const deleteUser = async (userId, name) => {
    try {
      const response = await deleteManagerApi(userId);
      await fetchManagers();
      showToast(response.message || `User "${name}" has been deleted.`);
      return { success: true };
    } catch (error) {
      showToast(error.message || 'Failed to delete user.');
      return { success: false };
    }
  };

  const toggleUserStatus = (userId) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'active' ? 'inactive' : 'active';
          showToast(`Changed status for ${u.name} to ${nextStatus}.`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const addActivationKey = (userId, key) => {
    if (!key.trim()) return;
    setUsers((prev) => prev.map((u) => {
      if (u.id === userId) {
        const keys = u.activationKeys || [];
        if (keys.includes(key.trim().toLowerCase())) return u;
        return {
          ...u,
          activationKeys: [...keys, key.trim().toLowerCase()],
        };
      }
      return u;
    }));
    showToast(`Added activation key "${key.trim()}"`);
  };

  const removeActivationKey = (userId, keyIndex) => {
    setUsers((prev) => prev.map((u) => {
      if (u.id === userId) {
        const keys = u.activationKeys || [];
        return {
          ...u,
          activationKeys: keys.filter((_, idx) => idx !== keyIndex),
        };
      }
      return u;
    }));
    showToast('Removed activation key');
  };

  const updateInstructions = (userId, text) => {
    setUsers((prev) => prev.map((u) => {
      if (u.id === userId) {
        return { ...u, specificInstructions: text };
      }
      return u;
    }));
    showToast('Instructions updated successfully');
  };

  const addKnowledgeFile = (userId, fileName, fileSize = '1.5 MB') => {
    if (!fileName.trim()) return;
    setUsers((prev) => prev.map((u) => {
      if (u.id === userId) {
        const files = u.knowledgeBase || [];
        return {
          ...u,
          knowledgeBase: [
            ...files,
            {
              name: fileName.trim(),
              size: fileSize,
              uploadedAt: new Date().toISOString().split('T')[0],
            },
          ],
        };
      }
      return u;
    }));
    showToast(`Uploaded "${fileName}" to Knowledge Base`);
  };

  const removeKnowledgeFile = (userId, fileIndex) => {
    setUsers((prev) => prev.map((u) => {
      if (u.id === userId) {
        const files = u.knowledgeBase || [];
        return {
          ...u,
          knowledgeBase: files.filter((_, idx) => idx !== fileIndex),
        };
      }
      return u;
    }));
    showToast('Removed document from Knowledge Base');
  };

  const createUser = async ({ name, email, access }) => {
    try {
      const response = await createUserApi({ name, email, access });
      await fetchManagers();
      showToast(response.message || `Registered ${name}! Verification email sent.`);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to create user.' };
    }
  };

  const updateUser = async (userId, updatedFields) => {
    try {
      const payload = {
        name: updatedFields.name,
        access: toBackendAccess(updatedFields.access),
      };

      if (updatedFields.status !== updatedFields.originalStatus) {
        payload.isActive = updatedFields.status === 'active';
        if (updatedFields.status === 'inactive') {
          payload.suspensionReason = updatedFields.statusReason;
        }
      }

      const response = await updateManagerApi(userId, payload);
      await fetchManagers();
      showToast(response.message || `Successfully updated user: ${updatedFields.name}`);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to update user.' };
    }
  };

  return (
    <AdminContext.Provider value={{
      isLoggedIn,
      loginError,
      setLoginError,
      login,
      logout,
      users,
      stats,
      isLoadingManagers,
      fetchManagers,
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
      updateUser,
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
