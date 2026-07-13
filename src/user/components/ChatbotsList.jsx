import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot, ExternalLink, Edit2, Trash2, Plus, Copy, Check, Users
} from 'lucide-react';

export default function ChatbotsList({
  myChatbots,
  canManage = false,
  onStartEditBot,
  onDeleteBot,
  onSwitchToCreate,
  showToast,
}) {
  const [copiedId, setCopiedId] = useState('');

  const handleCopyUrl = (botId) => {
    const url = `${window.location.origin}/chatbot/${botId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(botId);
    showToast('Assistant URL copied to clipboard!');
    setTimeout(() => setCopiedId(''), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {myChatbots.length === 0 ? (
        <div className="py-20 px-4 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
          <Bot className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-slate-300">No Chatbots Found</h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
            {canManage
              ? "You haven't created any chatbots yet. Get started by making your first one."
              : 'No chatbots are available from your manager yet.'}
          </p>
          {canManage && (
            <button
              onClick={onSwitchToCreate}
              className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Chatbot</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myChatbots.map((chatbot) => (
            <div
              key={chatbot.id}
              className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 hover:border-indigo-500/30 transition-all flex flex-col justify-between group relative overflow-hidden shadow-xl"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-bl-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />

              <div>
                <div className="flex items-center gap-4.5 mb-4">
                  <img
                    src={chatbot.onboardingImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'}
                    alt={chatbot.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-800 shadow-md group-hover:scale-105 transition-transform"
                  />
                  <div className="overflow-hidden">
                    <h4 className="font-extrabold text-base text-white truncate leading-snug">
                      {chatbot.name}
                    </h4>
                    <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider block mt-0.5">
                      ID: {String(chatbot.id).slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="mt-3.5 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-850 space-y-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                    Link
                  </span>
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/chatbot/${chatbot.id}`}
                      className="flex-1 bg-transparent border-none text-[10px] text-slate-400 font-mono outline-none focus:ring-0 truncate"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(chatbot.id)}
                      className="p-1.5 hover:bg-slate-850 text-slate-400 hover:text-indigo-400 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Copy Link"
                    >
                      {copiedId === chatbot.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {(chatbot.headMovementMode || chatbot.handMovements) && (
                  <div className="mt-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-850 space-y-1.5 font-mono text-[10px] text-slate-400">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Movement Settings</span>
                    {chatbot.headMovementMode && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Head Movement:</span>
                        <span className="text-slate-200 capitalize">by {chatbot.headMovementMode}</span>
                      </div>
                    )}
                    {chatbot.handMovements && (
                      <div className="pt-1.5 border-t border-slate-900">
                        <span className="text-[9px] text-slate-500 block mb-1">Hand Gestures Enabled:</span>
                        <div className="flex flex-wrap gap-1">
                          {(chatbot.handMovements.hi?.detects || chatbot.handMovements.hi?.saysHi) && (
                            <span className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold rounded text-[8px]">"hi"</span>
                          )}
                          {chatbot.handMovements.bye?.chatEnds && (
                            <span className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold rounded text-[8px]">"bye"</span>
                          )}
                          {(chatbot.handMovements.thumbsUp?.detects || chatbot.handMovements.thumbsUp?.correctInfo) && (
                            <span className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold rounded text-[8px]">"thumbs up"</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/60 flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5">
                  <a
                    href={`/chatbot/${chatbot.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-indigo-600/15 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Chatbot</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {canManage && (
                    <>
                      <button
                        type="button"
                        onClick={() => onStartEditBot(chatbot)}
                        className="p-3 bg-slate-950 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 border border-slate-800 hover:border-indigo-500/20 rounded-2xl transition-all cursor-pointer"
                        title="Edit Chatbot"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteBot(chatbot)}
                        className="p-3 bg-slate-950 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 rounded-2xl transition-all cursor-pointer"
                        title="Delete Chatbot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                <Link
                  to={`/chatbot/${chatbot.id}/leads`}
                  className="w-full py-2.5 px-4 bg-slate-950 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/25 font-bold rounded-2xl text-xs transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>View Leads</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
