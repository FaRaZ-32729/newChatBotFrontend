import { Bot, LogOut } from 'lucide-react';

export default function UserHeader({ onSignOut }) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 shadow-md">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-16 lg:px-24 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/30">
            <Bot className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h1 className="font-extrabold text-base tracking-tight leading-none text-white">BotApp</h1>
            <p className="text-[9px] text-indigo-400 font-bold tracking-wider uppercase mt-1 leading-none">Control Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Logout */}
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
