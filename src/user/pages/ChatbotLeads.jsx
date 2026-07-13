/**
 * ChatbotLeads — list leads captured for one chatbot.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Briefcase,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  UserRound,
  Users,
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { getChatbotLeadsApi } from '../../api/lead.api';
import UserHeader from '../components/UserHeader';

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return '—';
  }
}

function getTopicEntries(topicCounts) {
  if (!topicCounts || typeof topicCounts !== 'object') return [];
  return Object.entries(topicCounts)
    .map(([topic, count]) => [String(topic), Number(count) || 0])
    .filter(([topic]) => topic.trim())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function TopicCountChips({ topicCounts, compact = false }) {
  const entries = getTopicEntries(topicCounts);
  if (!entries.length) {
    return <span className="text-slate-600 text-xs">—</span>;
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${compact ? 'max-w-[280px]' : ''}`}>
      {entries.map(([topic, count]) => (
        <span
          key={topic}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-200"
          title={`${topic}: ${count}`}
        >
          <span className="truncate max-w-[120px]">{topic}</span>
          <span className="text-indigo-400 tabular-nums">{count}</span>
        </span>
      ))}
    </div>
  );
}

export default function ChatbotLeads() {
  const { chatbotId } = useParams();
  const navigate = useNavigate();
  const { currentUser, logoutUser } = useUser();

  const [chatbotName, setChatbotName] = useState('');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  const loadLeads = useCallback(async () => {
    if (!chatbotId) return;
    setLoading(true);
    setError('');
    try {
      const res = await getChatbotLeadsApi(chatbotId);
      setChatbotName(res.data?.chatbot?.name || 'Chatbot');
      setLeads(Array.isArray(res.data?.leads) ? res.data.leads : []);
    } catch (err) {
      setError(err.message || 'Failed to load leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [chatbotId]);

  useEffect(() => {
    if (currentUser) loadLeads();
  }, [currentUser, loadLeads]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((lead) => {
      const topics = getTopicEntries(lead.topic_counts)
        .map(([topic, count]) => `${topic} ${count}`)
        .join(' ');
      const hay = [lead.name, lead.company, lead.designation, lead.phone, lead.email, topics]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [leads, query]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <UserHeader
        onSignOut={async () => {
          await logoutUser();
          navigate('/login');
        }}
      />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-20 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to chatbots
            </Link>
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-2xl bg-indigo-600/15 border border-indigo-500/20 text-indigo-300 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white truncate">
                  {chatbotName || 'Leads'}
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                  {loading ? 'Loading…' : `${filtered.length} lead${filtered.length === 1 ? '' : 's'}`}
                  {query.trim() && !loading ? ` matching “${query.trim()}”` : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search leads…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <button
              type="button"
              onClick={loadLeads}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/30 transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-500 gap-2 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            Loading leads…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 sm:py-20 px-4 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl">
            <Users className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <h2 className="text-base font-extrabold text-slate-300">No leads yet</h2>
            <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">
              {query.trim()
                ? 'No leads match your search.'
                : 'Leads collected by this chatbot will appear here.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="grid gap-3 md:hidden">
              {filtered.map((lead) => (
                <article
                  key={lead.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-white truncate">{lead.name || '—'}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">{formatDate(lead.createdAt)}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-300 shrink-0">
                      <UserRound className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{lead.company || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{lead.designation || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <a href={lead.phone ? `tel:${lead.phone}` : undefined} className="truncate hover:text-indigo-300">
                        {lead.phone || '—'}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <a href={lead.email ? `mailto:${lead.email}` : undefined} className="truncate hover:text-indigo-300">
                        {lead.email || '—'}
                      </a>
                    </div>
                    <div className="pt-1.5 border-t border-slate-800/80">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                        Topic counts
                      </span>
                      <TopicCountChips topicCounts={lead.topic_counts} />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block rounded-3xl border border-slate-800 bg-slate-900/50 shadow-xl overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar pb-1">
                <table className="w-full min-w-[920px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3.5 font-bold whitespace-nowrap">Name</th>
                      <th className="px-5 py-3.5 font-bold whitespace-nowrap">Company</th>
                      <th className="px-5 py-3.5 font-bold whitespace-nowrap">Designation</th>
                      <th className="px-5 py-3.5 font-bold whitespace-nowrap">Phone</th>
                      <th className="px-5 py-3.5 font-bold whitespace-nowrap">Email</th>
                      <th className="px-5 py-3.5 font-bold whitespace-nowrap">Topics</th>
                      <th className="px-5 py-3.5 font-bold whitespace-nowrap">Captured</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b border-slate-800/70 last:border-0 hover:bg-slate-900/80 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-semibold text-white whitespace-nowrap">
                          {lead.name || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-300 max-w-[180px] truncate">
                          {lead.company || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-300 max-w-[160px] truncate">
                          {lead.designation || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">
                          {lead.phone ? (
                            <a href={`tel:${lead.phone}`} className="hover:text-indigo-300">
                              {lead.phone}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-slate-300 max-w-[220px] truncate">
                          {lead.email ? (
                            <a href={`mailto:${lead.email}`} className="hover:text-indigo-300">
                              {lead.email}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-5 py-3.5 align-top">
                          <TopicCountChips topicCounts={lead.topic_counts} compact />
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                          {formatDate(lead.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
