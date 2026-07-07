import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const ACCESS_OPTIONS = ['Head Movement', 'Hand Movement'];

export default function EditUserModal({ user, onClose }) {
  const { updateUser } = useAdmin();

  const [editUserName, setEditUserName] = useState(user.name);
  const [editUserStatus, setEditUserStatus] = useState(user.status);
  const [editUserAccess, setEditUserAccess] = useState(
    Array.isArray(user.access) ? user.access : []
  );
  const [editStatusReason, setEditStatusReason] = useState(user.statusReason || '');
  const [editFormErrors, setEditFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleAccess = (option) => {
    setEditUserAccess((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleSaveEdit = async (e) => {
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

    setEditFormErrors({});
    setIsSubmitting(true);

    const result = await updateUser(user.id, {
      name: editUserName.trim(),
      status: editUserStatus,
      originalStatus: user.status,
      statusReason: editUserStatus === 'inactive' ? editStatusReason.trim() : '',
      access: editUserAccess,
    });

    if (result?.success) {
      onClose();
      return;
    }

    setEditFormErrors({ submit: result?.message || 'Failed to update user.' });
    setIsSubmitting(false);
  };

  return (
    <div id="edit-user-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-150 shadow-2xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Edit Manager</h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveEdit} className="space-y-5">
          {editFormErrors.submit && (
            <p className="text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              {editFormErrors.submit}
            </p>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              User Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              value={editUserName}
              onChange={(e) => {
                setEditUserName(e.target.value);
                if (editFormErrors.name) setEditFormErrors((prev) => ({ ...prev, name: undefined }));
              }}
              className={`w-full px-4 py-2.5 border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm text-slate-800 ${editFormErrors.name ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-200'}`}
            />
            {editFormErrors.name && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{editFormErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Chat Status
            </label>
            <select
              value={editUserStatus}
              disabled={isSubmitting}
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

          {editUserStatus === 'inactive' && (
            <div className="animate-fade-in">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Reason for Deactivation <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={editStatusReason}
                disabled={isSubmitting}
                onChange={(e) => {
                  setEditStatusReason(e.target.value);
                  if (editFormErrors.statusReason) {
                    setEditFormErrors((prev) => ({ ...prev, statusReason: undefined }));
                  }
                }}
                rows={3}
                placeholder="Specify reason (e.g. Account suspended, temporary deactivation request...)"
                className={`w-full px-4 py-2.5 border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm text-slate-800 ${editFormErrors.statusReason ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200'}`}
              />
              {editFormErrors.statusReason && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{editFormErrors.statusReason}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Access Method
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Select one or both. Leave unchecked for no access.
            </p>
            <div className="space-y-2">
              {ACCESS_OPTIONS.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 px-4 py-2.5 border border-slate-200 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={editUserAccess.includes(option)}
                    disabled={isSubmitting}
                    onChange={() => toggleAccess(option)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-75 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
