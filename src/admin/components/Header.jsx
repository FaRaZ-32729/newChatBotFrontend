import { Link, useNavigate } from 'react-router-dom';
import { Bot, LogOut } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function Header() {
  const { logout } = useAdmin();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-16 lg:px-24 h-16 flex items-center justify-between">

        {/* Brand Logo & Title */}
        <Link
          to="/admin/dashboard"
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-900/30 group-hover:bg-indigo-500 transition-all">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-white tracking-tight leading-none">BotAdmin</h1>
            <p className="text-[9px] text-slate-400 font-bold tracking-wider uppercase mt-1 leading-none">Control Panel</p>
          </div>
        </Link>

        {/* Right Controls: Sign Out Only */}
        <div className="flex items-center gap-3">
          <button
            id="header-logout-btn"
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </header>
  );
}
