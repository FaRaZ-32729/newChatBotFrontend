import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Users, Eye, Pencil, Trash2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function UsersTable({ 
  searchQuery, 
  setSearchQuery, 
  statusFilter, 
  setStatusFilter, 
  onStartEdit 
}) {
  const { users, deleteUser, isLoadingManagers } = useAdmin();
  const navigate = useNavigate();
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered and searched users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.platform || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.status === 'active') ||
        (statusFilter === 'inactive' && user.status === 'inactive');

      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  const handleViewDetails = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  return (
    <section id="users-directory" className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl border border-slate-150 shadow-xs overflow-hidden">
      
      {/* Header Filter Controls Bar */}
      <div className="p-2.5 sm:px-4 sm:py-2 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-input"
            type="text"
            placeholder="Search users by name, email, platform..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 text-sm bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Tabs Filter */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-lg self-start md:self-auto shrink-0">
          <button
            id="filter-all"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Users
          </button>
          <button
            id="filter-active"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Active
          </button>
          <button
            id="filter-inactive"
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              statusFilter === 'inactive'
                ? 'bg-white text-slate-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Inactive
          </button>
        </div>

      </div>

      {/* TABLE LIST - Dynamic Responsive Presentation with internal scrollbars */}
      <div id="users-table-container" className="flex-1 min-h-0 w-full overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {isLoadingManagers ? (
          <div className="py-16 px-4 text-center">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Loading managers...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-800">No users found</p>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              No chatbot users match your current search query or status filter criteria. Try adjusting your settings.
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* --- MOBILE COLLAPSED LAYOUT (shows below md breakpoint) --- */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 flex flex-col gap-2.5 bg-white hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="cursor-pointer flex-1 group" onClick={() => handleViewDetails(user.id)}>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 group-hover:underline transition-colors flex items-center gap-2">
                        <span>{user.name}</span>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                          user.role === 'admin'
                            ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                            : user.role === 'manager'
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {user.role || 'user'}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {(user.access?.length ? user.access : ['No Access']).map((acc, idx) => (
                          <span key={idx} className="inline-flex px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md uppercase tracking-wider">
                            {acc}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        user.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                      {user.status === 'inactive' && user.statusReason && (
                        <span className="text-[10px] text-slate-500 italic max-w-[120px] truncate block" title={user.statusReason}>
                          Reason: {user.statusReason}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    {/* View details */}
                    <button
                      onClick={() => handleViewDetails(user.id)}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onStartEdit(user)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                      title="Edit user details"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setDeleteConfirmTarget({ id: user.id, name: user.name })}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* --- DESKTOP TABLE LAYOUT (hidden below md breakpoint) --- */}
            <div className="hidden md:block">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-5 py-3 text-xs font-semibold tracking-wider text-slate-400 uppercase w-1/4">Name</th>
                    <th className="px-5 py-3 text-xs font-semibold tracking-wider text-slate-400 uppercase w-1/4">Email</th>
                    <th className="px-5 py-3 text-xs font-semibold tracking-wider text-slate-400 uppercase w-1/4">Access Method</th>
                    <th className="px-5 py-3 text-xs font-semibold tracking-wider text-slate-400 uppercase w-1/6">Chat Status</th>
                    <th className="px-5 py-3 text-xs font-semibold tracking-wider text-slate-400 uppercase text-right w-[12%]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Name Info */}
                      <td className="px-5 py-3 whitespace-nowrap truncate">
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleViewDetails(user.id)}>
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs uppercase group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div className="flex items-center gap-2 overflow-hidden truncate">
                            <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 group-hover:underline transition-all truncate" title={user.name}>{user.name}</span>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border shrink-0 ${
                              user.role === 'admin'
                                ? 'bg-rose-50 text-rose-700 border-rose-100'
                                : user.role === 'manager'
                                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {user.role || 'user'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email Info */}
                      <td className="px-5 py-3 whitespace-nowrap truncate">
                        <span className="text-sm text-slate-600 font-mono truncate block" title={user.email}>{user.email}</span>
                      </td>

                      {/* Access Method Info */}
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {(user.access?.length ? user.access : ['No Access']).map((acc, idx) => (
                            <span key={idx} className="inline-flex px-2 py-0.5 bg-indigo-50/50 text-indigo-700 text-[10px] font-semibold rounded-md uppercase tracking-wider">
                              {acc}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-0.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            user.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {user.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                          {user.status === 'inactive' && user.statusReason && (
                            <span className="text-[10px] text-slate-500 italic max-w-[150px] truncate block" title={user.statusReason}>
                              Reason: {user.statusReason}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions menu */}
                      <td className="px-5 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {/* View details */}
                          <button
                            onClick={() => handleViewDetails(user.id)}
                            className="p-1 text-slate-500 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit details */}
                          <button
                            onClick={() => onStartEdit(user)}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                            title="Edit user details"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmTarget({ id: user.id, name: user.name })}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                            title="Delete chat configuration"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <ConfirmationModal
        isOpen={deleteConfirmTarget !== null}
        title="Delete User Account"
        message={`Are you sure you want to delete "${deleteConfirmTarget?.name}"? This manager and all associated client accounts will be permanently removed.`}
        confirmText={isDeleting ? 'Deleting...' : 'Confirm Delete'}
        cancelText="Cancel"
        theme="light"
        onConfirm={async () => {
          if (!deleteConfirmTarget || isDeleting) return;
          setIsDeleting(true);
          const result = await deleteUser(deleteConfirmTarget.id, deleteConfirmTarget.name);
          setIsDeleting(false);
          if (result?.success) {
            setDeleteConfirmTarget(null);
          }
        }}
        onCancel={() => {
          if (!isDeleting) setDeleteConfirmTarget(null);
        }}
      />

    </section>
  );
}
