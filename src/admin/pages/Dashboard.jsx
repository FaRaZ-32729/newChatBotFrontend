import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import Header from '../components/Header';
import StatsGrid from '../components/StatsGrid';
import UsersTable from '../components/UsersTable';
import EditUserModal from '../components/EditUserModal';
import ToastNotification from '../components/ToastNotification';

export default function Dashboard() {
  const { isLoggedIn } = useAdmin();
  const navigate = useNavigate();

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Edit User modal state
  const [editingUser, setEditingUser] = useState(null);

  // Authenticated state guard
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return null; // Don't flash dashboard before redirect completes
  }

  return (
    <div id="admin-shell" className="min-h-screen md:h-screen md:overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-800">
      <ToastNotification />
      <Header />

      {/* --- MAIN CONTENT WINDOW --- */}
      <main id="main-content" className="flex-1 flex flex-col min-h-0 overflow-y-auto md:overflow-hidden px-6 py-6 sm:px-10 md:px-16 lg:px-24 max-w-[1440px] mx-auto w-full transition-all">
        
        {/* --- HEADER BAR --- */}
        <header className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 id="view-title" className="text-2xl font-bold text-slate-900 tracking-tight sm:text-3xl">
              Chatbot Analytics & Users
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage active sessions, view stats, and administer user statuses.
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="header-btn-create"
              onClick={() => navigate('/admin/users/new')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-100 transition-all cursor-pointer animate-fade-in"
            >
              <Plus className="w-4 h-4" />
              Add New User
            </button>
          </div>
        </header>

        {/* --- VIEW CONTENT: DASHBOARD --- */}
        <div id="dashboard-view" className="flex-1 flex flex-col min-h-0 space-y-6 md:space-y-6 animate-fade-in">
          
          {/* --- STATS GRID CONTAINER --- */}
          <StatsGrid 
            statusFilter={statusFilter} 
            setStatusFilter={setStatusFilter} 
          />

          {/* --- USER TABLE & SEARCH FILTERS --- */}
          <UsersTable 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onStartEdit={(user) => setEditingUser(user)}
          />

        </div>
      </main>

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
        />
      )}
    </div>
  );
}
