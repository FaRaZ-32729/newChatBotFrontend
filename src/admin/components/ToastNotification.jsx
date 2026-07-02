import { Sparkles } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function ToastNotification() {
  const { toastMessage } = useAdmin();

  if (!toastMessage) return null;

  return (
    <div id="toast-notification" className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl border border-slate-800 animate-slide-in max-w-sm w-auto">
      <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
      <p className="text-sm font-medium">{toastMessage}</p>
    </div>
  );
}
