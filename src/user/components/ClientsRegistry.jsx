import { useState } from 'react';
import { 
  UserCheck, AlertCircle, CheckCircle, ArrowRight, Trash2 
} from 'lucide-react';

export default function ClientsRegistry({ 
  managedUsers, 
  onRegisterUser,
  onDeleteUser
}) {
  const [createUserName, setCreateUserName] = useState('');
  const [createUserEmail, setCreateUserEmail] = useState('');
  const [createUserError, setCreateUserError] = useState('');
  const [createUserSuccess, setCreateUserSuccess] = useState('');

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setCreateUserError('');
    setCreateUserSuccess('');

    if (!createUserName.trim()) {
      setCreateUserError('Name is required');
      return;
    }
    if (!createUserEmail.trim()) {
      setCreateUserError('Email is required');
      return;
    } else if (!/\S+@\S+\.\S+/.test(createUserEmail)) {
      setCreateUserError('Please enter a valid email address');
      return;
    }

    try {
      const newUser = onRegisterUser(createUserName.trim(), createUserEmail.trim());
      if (newUser) {
        setCreateUserSuccess(`Successfully registered client "${newUser.name}"!`);
        setCreateUserName('');
        setCreateUserEmail('');
      } else {
        setCreateUserError('Failed to register user. Email might already be taken.');
      }
    } catch (err) {
      setCreateUserError(err.message || 'Failed to register user.');
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 p-5 sm:p-6 rounded-3xl space-y-6 mt-4">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 text-left">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-400 shrink-0 border border-indigo-500/15">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-snug">Manager Administration Console</h3>
            <p className="text-xs text-slate-400 mt-0.5">As a Manager, you hold exclusive permission to register and monitor client user accounts.</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-full text-xs font-bold text-indigo-300 shrink-0">
          Managed Clients: {managedUsers.length}
        </span>
      </div>

      {/* Grid Layout: Create User (Left) & User List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        
        {/* Register User Panel */}
        <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl space-y-4 h-fit">
          <div>
            <h4 className="text-sm font-extrabold text-white">Register New Client Account</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Instantly configure basic access keys for a new client user.</p>
          </div>

          {createUserError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-xl flex items-start gap-2.5 text-xs animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{createUserError}</span>
            </div>
          )}

          {createUserSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3 rounded-xl flex items-start gap-2.5 text-xs animate-fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{createUserSuccess}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Field 1: Name */}
            <div>
              <label htmlFor="user-reg-name" className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Client Full Name
              </label>
              <input
                id="user-reg-name"
                type="text"
                required
                placeholder="e.g. Alice Cooper"
                value={createUserName}
                onChange={(e) => {
                  setCreateUserName(e.target.value);
                  if (createUserError) setCreateUserError('');
                  if (createUserSuccess) setCreateUserSuccess('');
                }}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white placeholder-slate-600"
              />
            </div>

            {/* Field 2: Email */}
            <div>
              <label htmlFor="user-reg-email" className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Client Email Address
              </label>
              <input
                id="user-reg-email"
                type="email"
                required
                placeholder="e.g. alice@example.com"
                value={createUserEmail}
                onChange={(e) => {
                  setCreateUserEmail(e.target.value);
                  if (createUserError) setCreateUserError('');
                  if (createUserSuccess) setCreateUserSuccess('');
                }}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white placeholder-slate-600 font-mono"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <span>Deploy Client Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Managed Users Registry Table */}
        <div className="lg:col-span-2 space-y-3">
          <div>
            <h4 className="text-sm font-extrabold text-white">Registered Client User Registry</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Below are the client user profiles deployed and managed under your license.</p>
          </div>

          {managedUsers.length === 0 ? (
            <div className="py-12 px-4 text-center bg-slate-950/40 border border-dashed border-slate-800/80 rounded-2xl">
              <UserCheck className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-400">No client accounts created yet</p>
              <p className="text-[11px] text-slate-500 mt-1">Use the register form to create your first client configuration.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-850 bg-slate-950">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-850 bg-slate-900/40 font-bold text-slate-400 uppercase tracking-wider text-[10px] font-mono">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Access Protocol</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {managedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="p-4 font-bold text-white flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-300 text-xs font-extrabold flex items-center justify-center shrink-0">
                          {u.name?.charAt(0)}
                        </div>
                        <span className="truncate max-w-[120px]" title={u.name}>{u.name}</span>
                      </td>
                      <td className="p-4 text-slate-300 font-mono text-[11px] truncate max-w-[150px]" title={u.email}>{u.email}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {u.access?.map((acc, index) => (
                            <span key={index} className="px-2 py-0.5 bg-indigo-950/40 text-indigo-400 border border-indigo-500/10 rounded-md text-[10px] font-bold whitespace-nowrap">
                              {acc}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${u.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => onDeleteUser(u)}
                          className="p-1.5 bg-slate-950 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 rounded-xl transition-all cursor-pointer"
                          title="Delete Client User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
