import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({ 
  isOpen, 
  title = "Are you sure?", 
  message = "This action cannot be undone.", 
  confirmText = "Delete", 
  cancelText = "Cancel", 
  onConfirm, 
  onCancel,
  isDanger = true,
  theme = "dark" // "dark" for User Workspace, "light" for Admin Portal
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl relative transform transition-all scale-100 ${
          theme === 'dark' 
            ? 'bg-slate-900 border-slate-800 text-white' 
            : 'bg-white border-slate-200 text-slate-850'
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors cursor-pointer ${
            theme === 'dark' 
              ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-150'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4 text-left">
          {/* Warning Icon Banner */}
          <div className={`p-3 rounded-2xl shrink-0 ${
            isDanger 
              ? 'bg-rose-500/10 text-rose-500' 
              : 'bg-indigo-500/10 text-indigo-500'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 flex-1 pr-6">
            <h3 className={`text-base font-black tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              {title}
            </h3>
            <p className={`text-xs leading-relaxed ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex items-center justify-end gap-3 mt-6 pt-4 border-t ${
          theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              theme === 'dark' 
                ? 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300' 
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
            }`}
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md text-white ${
              isDanger 
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/15' 
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/15'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
