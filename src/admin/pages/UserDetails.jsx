import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  AlertCircle,
  Bot,
  FileText,
  Key,
  Loader2,
  Shield,
  Users,
  Download,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import Header from '../components/Header';
import ToastNotification from '../components/ToastNotification';
import { getManagerDetailsApi } from '../../api/users.api';
import { formatAccessForDisplay } from '../../utils/access';
import { mapChatbotFromApi, resolveAssetUrl } from '../../utils/mapChatbot';
import { mapClientUserFromApi } from '../../utils/mapClientUser';

export default function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, showToast } = useAdmin();

  const [manager, setManager] = useState(null);
  const [chatbots, setChatbots] = useState([]);
  const [managedUsers, setManagedUsers] = useState([]);
  const [stats, setStats] = useState({
    totalChatbots: 0,
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Kick out if not logged in as admin
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  // Load manager profile + chatbots + users from API
  useEffect(() => {
    if (!isLoggedIn || !userId) return;

    let cancelled = false;

    const loadDetails = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const response = await getManagerDetailsApi(userId);
        if (cancelled) return;

        const managerData = response.data.manager;
        setManager({
          id: managerData._id,
          name: managerData.name,
          email: managerData.email,
          role: managerData.role,
          status: managerData.isActive ? 'active' : 'inactive',
          statusReason: managerData.suspensionReason || null,
          access: formatAccessForDisplay(managerData.access),
          createdAt: managerData.createdAt
            ? new Date(managerData.createdAt).toISOString().split('T')[0]
            : '',
        });
        setChatbots((response.data.chatbots || []).map(mapChatbotFromApi));
        setManagedUsers((response.data.users || []).map(mapClientUserFromApi));
        setStats(response.data.stats || {
          totalChatbots: 0,
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
        });
      } catch (error) {
        if (cancelled) return;
        setLoadError(error.message || 'Failed to load manager details.');
        showToast(error.message || 'Failed to load manager details.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, userId, showToast]);

  // Open PDF in new tab so admin can download/view it
  const handleDownloadPdf = (pdf) => {
    if (!pdf?.url) {
      showToast('PDF file is not available.');
      return;
    }
    window.open(resolveAssetUrl(pdf.url), '_blank', 'noopener,noreferrer');
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div id="admin-shell" className="min-h-screen md:h-screen md:overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-800">
      <ToastNotification />
      <Header />

      <main id="main-content" className="flex-1 flex flex-col min-h-0 overflow-y-auto md:overflow-hidden px-6 py-6 sm:px-10 md:px-16 lg:px-24 max-w-[1440px] mx-auto w-full transition-all">
        <header className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 id="view-title" className="text-2xl font-bold text-slate-900 tracking-tight sm:text-3xl">
              Manager Configuration Details
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              View this manager's chatbots, PDF knowledge files, and created users.
            </p>
          </div>

          <button
            id="header-btn-back"
            onClick={() => navigate('/admin/dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </header>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
            <p className="text-sm text-slate-500">Loading manager details...</p>
          </div>
        ) : loadError || !manager ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-10 h-10 text-rose-400 mb-3" />
            <p className="text-sm font-semibold text-slate-700">{loadError || 'Manager not found.'}</p>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="mt-4 px-4 py-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              Back to dashboard
            </button>
          </div>
        ) : (
          <div id="user-details-view" className="flex-1 flex flex-col min-h-0 space-y-6 animate-fade-in pb-12 overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Managers
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span>MANAGER ID: {manager.id}</span>
              </div>
            </div>

            {/* Quick counts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chatbots</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalChatbots}</p>
              </div>
              <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Users</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalUsers}</p>
              </div>
              <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Users</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.activeUsers}</p>
              </div>
              <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inactive Users</p>
                <p className="text-2xl font-bold text-slate-500 mt-1">{stats.inactiveUsers}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: manager profile */}
              <div className="space-y-6">
                <div className="bg-white border border-slate-150 p-4 sm:p-5 rounded-3xl shadow-xs space-y-4">
                  <div className="flex flex-col items-center text-center pb-3.5 border-b border-slate-100">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-extrabold flex items-center justify-center text-2xl shadow-md shadow-indigo-100 mb-3">
                      {manager.name?.charAt(0)}
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{manager.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{manager.email}</p>

                    <div className="mt-3 flex gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        manager.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${manager.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {manager.status === 'active' ? 'Active' : 'Inactive'}
                      </span>

                      <span className="inline-flex px-2.5 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-100 capitalize">
                        {manager.role}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Granted Access Methods</h4>
                    <div className="flex flex-wrap gap-1">
                      {(manager.access?.length ? manager.access : ['No Access']).map((acc, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-100/50 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5" />
                          {acc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {manager.createdAt && (
                    <p className="text-[11px] text-slate-400 font-mono">
                      Joined: {manager.createdAt}
                    </p>
                  )}

                  {manager.status === 'inactive' && (
                    <div className="pt-3 border-t border-slate-100">
                      <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-2xl text-xs text-rose-800">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
                          <div>
                            <span className="font-bold block mb-0.5">Deactivation Reason:</span>
                            <p className="italic">{manager.statusReason || 'No specific reason provided.'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: chatbots + users */}
              <div className="lg:col-span-2 space-y-6">
                {/* Chatbots list with PDF download */}
                <div className="bg-white border border-slate-150 p-4 sm:p-5 rounded-3xl shadow-xs space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Manager Chatbots</h3>
                      <p className="text-xs text-slate-500">
                        All chatbots under this manager. Download is available on PDF knowledge files only.
                      </p>
                    </div>
                  </div>

                  {chatbots.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                      <Bot className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                      <p className="text-sm font-semibold text-slate-500">No chatbots found</p>
                      <p className="text-xs text-slate-400 mt-1">This manager has not created any chatbots yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatbots.map((bot) => (
                        <div key={bot.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/40 space-y-3">
                          <div className="flex items-start gap-3">
                            <img
                              src={bot.onboardingImage}
                              alt={bot.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900 truncate">{bot.name}</h4>
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  bot.isActive
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                  {bot.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                Created: {bot.createdAt || '—'}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Key className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span>
                                Trigger: <span className="font-bold text-slate-800">"{bot.activationKey}"</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Shield className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span>
                                Card Scan:{' '}
                                <span className="font-bold text-slate-800">
                                  {bot.scanCardRequired ? 'Required' : 'Disabled'}
                                </span>
                              </span>
                            </div>
                            {bot.headMovementMode && (
                              <div className="text-slate-600">
                                Head Movement: <span className="font-bold capitalize text-slate-800">{bot.headMovementMode}</span>
                              </div>
                            )}
                          </div>

                          {bot.specificInstructions && (
                            <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 italic leading-relaxed">
                              "{bot.specificInstructions}"
                            </div>
                          )}

                          {/* PDFs with download only */}
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Knowledge Base PDFs ({bot.knowledgeBasePdfs?.length || 0})
                            </p>

                            {!bot.knowledgeBasePdfs?.length ? (
                              <p className="text-xs text-slate-400 italic">No PDFs attached.</p>
                            ) : (
                              <div className="space-y-2">
                                {bot.knowledgeBasePdfs.map((pdf, idx) => (
                                  <div
                                    key={`${bot.id}-pdf-${idx}`}
                                    className="flex items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl"
                                  >
                                    <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                                      <div className="p-2 bg-rose-50 text-rose-600 rounded-lg shrink-0">
                                        <FileText className="w-4 h-4" />
                                      </div>
                                      <div className="overflow-hidden">
                                        <p className="text-xs font-bold text-slate-800 truncate" title={pdf.name}>
                                          {pdf.name}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-mono">{pdf.size || '—'}</p>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleDownloadPdf(pdf)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0"
                                      title="Download PDF"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      <span>Download</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Manager's users list */}
                <div className="bg-white border border-slate-150 p-4 sm:p-5 rounded-3xl shadow-xs space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Manager Users</h3>
                      <p className="text-xs text-slate-500">Client accounts created by this manager.</p>
                    </div>
                  </div>

                  {managedUsers.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                      <Users className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                      <p className="text-sm font-semibold text-slate-500">No users found</p>
                      <p className="text-xs text-slate-400 mt-1">This manager has not created any users yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-150">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/80 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                            <th className="p-3.5">Name</th>
                            <th className="p-3.5">Email</th>
                            <th className="p-3.5">Access</th>
                            <th className="p-3.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {managedUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-3.5 font-bold text-slate-800">{u.name}</td>
                              <td className="p-3.5 text-slate-600 font-mono text-[11px]">{u.email}</td>
                              <td className="p-3.5">
                                <div className="flex flex-wrap gap-1">
                                  {(u.access?.length ? u.access : ['No Access']).map((acc, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md text-[10px] font-bold"
                                    >
                                      {acc}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="p-3.5 text-center">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  u.status === 'active'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                  <span className={`w-1 h-1 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                  {u.status}
                                </span>
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
          </div>
        )}
      </main>
    </div>
  );
}
