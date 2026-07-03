import { UserCheck } from 'lucide-react';

export default function UserBanner({ currentUser }) {
  if (!currentUser) return null;

  return (
    <section className="bg-gradient-to-r from-indigo-950/80 to-slate-900/80 border border-indigo-900/30 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 bg-indigo-500/5 mix-blend-overlay pointer-events-none" />
      <div className="flex items-center gap-5 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 font-black text-white text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
          {currentUser.name?.charAt(0)}
        </div>
        <div>
          <p className="text-xs font-bold text-indigo-400 tracking-wider uppercase font-mono">
            {currentUser.role === 'manager' ? 'Manager Portal Workspace' : 'Chatbot Integration Client Space'}
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">{currentUser.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">{currentUser.email} • {currentUser.role.toUpperCase()}</p>
        </div>
      </div>

      <div className="flex flex-col items-start sm:items-end gap-2.5 shrink-0 w-full sm:w-auto relative z-10">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Access Privileges</span>
        <div className="flex flex-wrap gap-1.5">
          {currentUser.access?.map((method, idx) => (
            <span 
              key={idx} 
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/20 shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              {method}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
