import { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function EditUserModal({ user, onClose }) {
  const { updateUser } = useAdmin();

  const [editUserName, setEditUserName] = useState(user.name);
  const [editUserRole, setEditUserRole] = useState(user.role || 'user');
  const [editUserStatus, setEditUserStatus] = useState(user.status);
  const [editUserAccess, setEditUserAccess] = useState(
    Array.isArray(user.access)
      ? user.access
      : user.access
        ? [user.access]
        : ['Head Movement']
  );
  const [isEditAccessOpen, setIsEditAccessOpen] = useState(false);
  const [editStatusReason, setEditStatusReason] = useState(user.statusReason || '');
  const [editFormErrors, setEditFormErrors] = useState({});

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!editUserName.trim()) {
      errors.name = 'Name is required';
    }

    if (editUserStatus === 'inactive' && !editStatusReason.trim()) {
      errors.statusReason = 'Reason for deactivation is required';
    }

    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    updateUser(user.id, {
      name: editUserName.trim(),
      role: editUserRole,
      status: editUserStatus,
      statusReason: editUserStatus === 'inactive' ? editStatusReason.trim() : '',
      access: editUserAccess
    });

    onClose();
  };

  return (
    <div id="edit-user-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-150 shadow-2xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Edit Chatbot User</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveEdit} className="space-y-5">
          {/* Edit Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              User Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={editUserName}
              onChange={(e) => {
                setEditUserName(e.target.value);
                if (editFormErrors.name) setEditFormErrors(prev => ({ ...prev, name: undefined }));
              }}
              className={`w-full px-4 py-2.5 border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm text-slate-800 ${editFormErrors.name ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-200'
                }`}
            />
            {editFormErrors.name && (
              <p className="mt-1 text-xs text-rose-600 font-medium">
                {editFormErrors.name}
              </p>
            )}
          </div>

          {/* Edit Status */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Chat Status
            </label>
            <select
              value={editUserStatus}
              onChange={(e) => {
                setEditUserStatus(e.target.value);
                if (e.target.value === 'active') {
                  setEditStatusReason('');
                }
              }}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm text-slate-800 bg-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>



          {/* Edit Deactivation Reason (Conditional) */}
          {editUserStatus === 'inactive' && (
            <div className="animate-fade-in">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Reason for Deactivation <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={editStatusReason}
                onChange={(e) => {
                  setEditStatusReason(e.target.value);
                  if (editFormErrors.statusReason) setEditFormErrors(prev => ({ ...prev, statusReason: undefined }));
                }}
                rows={3}
                placeholder="Specify reason (e.g. Account suspended, temporary deactivation request...)"
                className={`w-full px-4 py-2.5 border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm text-slate-800 ${editFormErrors.statusReason ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200'
                  }`}
              />
              {editFormErrors.statusReason && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {editFormErrors.statusReason}
                </p>
              )}
            </div>
          )}

          {/* Edit Access */}
          <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Access Method <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsEditAccessOpen(!isEditAccessOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 border border-slate-200 rounded-2xl shadow-sm bg-white hover:bg-slate-50 transition-all text-sm text-slate-800 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <span>
                {editUserAccess.length > 0
                  ? editUserAccess.join(', ')
                  : 'Select Access Method'}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isEditAccessOpen ? 'rotate-180' : ''}`} />
            </button>

            {isEditAccessOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsEditAccessOpen(false)}
                />
                <div className="absolute left-0 right-0 mt-2 p-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 space-y-1 animate-fade-in">
                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors text-slate-700 text-sm">
                    <input
                      type="checkbox"
                      checked={editUserAccess.includes('Head Movement')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditUserAccess(prev => [...prev, 'Head Movement']);
                        } else {
                          if (editUserAccess.length > 1) {
                            setEditUserAccess(prev => prev.filter(x => x !== 'Head Movement'));
                          }
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Head Movement</span>
                  </label>
                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors text-slate-700 text-sm">
                    <input
                      type="checkbox"
                      checked={editUserAccess.includes('Hand Movement')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditUserAccess(prev => [...prev, 'Hand Movement']);
                        } else {
                          if (editUserAccess.length > 1) {
                            setEditUserAccess(prev => prev.filter(x => x !== 'Hand Movement'));
                          }
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Hand Movement</span>
                  </label>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
