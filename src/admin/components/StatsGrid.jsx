import { Users, UserCheck, UserX } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function StatsGrid({ statusFilter, setStatusFilter }) {
  const { stats } = useAdmin();

  return (
    <section id="stats-grid" className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      {/* Stat Card: Total Users */}
      <button
        type="button"
        onClick={() => setStatusFilter('all')}
        className={`p-4 sm:p-4.5 rounded-2xl border transition-all flex items-center justify-between text-left w-full cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
          statusFilter === 'all'
            ? 'border-indigo-600 bg-indigo-50/20 ring-1 ring-indigo-600 shadow-sm'
            : 'bg-white border-slate-150 shadow-xs hover:border-slate-300 hover:shadow-md'
        }`}
      >
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Total Bot Users</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-indigo-600 font-medium">
            <span>Registered accounts</span>
          </div>
        </div>
        <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
          <Users className="w-5.5 h-5.5" />
        </div>
      </button>

      {/* Stat Card: Active Users */}
      <button
        type="button"
        onClick={() => setStatusFilter('active')}
        className={`p-4 sm:p-4.5 rounded-2xl border transition-all flex items-center justify-between text-left w-full cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
          statusFilter === 'active'
            ? 'border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-500 shadow-sm'
            : 'bg-white border-slate-150 shadow-xs hover:border-slate-300 hover:shadow-md'
        }`}
      >
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Active Users</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.active}</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-semibold">
            <span>
              {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% Active Rate
            </span>
          </div>
        </div>
        <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
          <UserCheck className="w-5.5 h-5.5" />
        </div>
      </button>

      {/* Stat Card: Inactive Users */}
      <button
        type="button"
        onClick={() => setStatusFilter('inactive')}
        className={`p-4 sm:p-4.5 rounded-2xl border transition-all flex items-center justify-between text-left w-full cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-slate-400/20 ${
          statusFilter === 'inactive'
            ? 'border-slate-500 bg-slate-50/50 ring-1 ring-slate-500 shadow-sm'
            : 'bg-white border-slate-150 shadow-xs hover:border-slate-300 hover:shadow-md'
        }`}
      >
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Inactive Users</p>
          <p className="text-3xl font-bold text-slate-500 mt-1">{stats.inactive}</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 font-medium">
            <span>
              {stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}% Dormant
            </span>
          </div>
        </div>
        <div className="p-2.5 bg-slate-100 rounded-xl text-slate-500 shrink-0">
          <UserX className="w-5.5 h-5.5" />
        </div>
      </button>

    </section>
  );
}
