import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, AlertCircle, BookOpen, FileText, Upload, Trash2, Key, Sparkles } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import Header from '../components/Header';
import ToastNotification from '../components/ToastNotification';

export default function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, users, removeKnowledgeFile, showToast } = useAdmin();

  // Find the user dynamically to keep it reactive and in sync
  const user = users.find(u => u.id === userId);

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/admin/login', { replace: true });
    } else if (!user) {
      showToast('User configuration not found.');
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isLoggedIn, user, navigate, showToast]);

  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <div id="admin-shell" className="min-h-screen md:h-screen md:overflow-hidden bg-slate-50 flex flex-col font-sans text-slate-800">
      <ToastNotification />
      <Header />

      {/* --- MAIN CONTENT WINDOW --- */}
      <main id="main-content" className="flex-1 flex flex-col min-h-0 overflow-y-auto md:overflow-hidden px-6 py-6 sm:px-10 md:px-16 lg:px-24 max-w-[1440px] mx-auto w-full transition-all">
        
        {/* --- HEADER BAR --- */}
        <header className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 id="view-title" className="text-2xl font-bold text-slate-900 tracking-tight sm:text-3xl">
              User Configuration Details
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Detailed analysis and customized integration parameters for {user.name}.
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="header-btn-back"
              onClick={() => navigate('/admin/dashboard')}
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 shadow-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </header>

        {/* --- VIEW CONTENT: USER DETAILS --- */}
        <div id="user-details-view" className="flex-1 flex flex-col min-h-0 space-y-6 animate-fade-in pb-12 overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          
          {/* Quick Action back button and quick user indicators */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to User Configurations
            </button>
            
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>USER ID: {user.id}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* --- LEFT COLUMN: CORE PROFILE INFO CARD --- */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-150 p-4 sm:p-5 rounded-3xl shadow-xs space-y-4">
                
                {/* Big Avatar Header */}
                <div className="flex flex-col items-center text-center pb-3.5 border-b border-slate-100">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-extrabold flex items-center justify-center text-2xl shadow-md shadow-indigo-100 mb-3">
                    {user.name?.charAt(0)}
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{user.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
                  
                  <div className="mt-3 flex gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      user.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    
                    <span className="inline-flex px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200">
                      {user.platform || 'Web Widget'}
                    </span>
                  </div>
                </div>

                {/* Access Details */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Granted Access Methods</h4>
                  <div className="flex flex-wrap gap-1">
                    {user.access?.map((acc, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-100/50 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        {acc}
                      </span>
                    ))}
                  </div>
                </div>

                {user.status === 'inactive' && (
                  <div className="pt-3 border-t border-slate-100">
                    <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-2xl text-xs text-rose-800">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
                        <div>
                          <span className="font-bold block mb-0.5">Deactivation Reason:</span>
                          <p className="italic">{user.statusReason || 'No specific reason provided.'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* --- RIGHT COLUMN: INTERACTIVE DOCUMENTS & CONFIGURATIONS --- */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. KNOWLEDGE BASE (UPLOADED PDF FILES) */}
              <div className="bg-white border border-slate-150 p-4 sm:p-5 rounded-3xl shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Knowledge Base</h3>
                      <p className="text-xs text-slate-500">Provide PDF files that feed contextual knowledge to this user's AI Chatbot.</p>
                    </div>
                  </div>
                </div>

                {/* Document List */}
                <div className="space-y-2.5">
                  {!user.knowledgeBase || user.knowledgeBase.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                      <FileText className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                      <p className="text-sm font-semibold text-slate-500">No documents in knowledge base</p>
                      <p className="text-xs text-slate-400 mt-1">Upload relevant manuals, prompt FAQs, or instructions below.</p>
                    </div>
                  ) : (
                    <div className={`divide-y divide-slate-100 border border-slate-150 rounded-2xl bg-white ${
                      user.knowledgeBase.length > 4 
                        ? 'max-h-[260px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent' 
                        : 'overflow-hidden'
                    }`}>
                      {user.knowledgeBase.map((file, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-bold text-slate-800 truncate" title={file.name}>{file.name}</p>
                              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                                <span>{file.size}</span>
                                <span>•</span>
                                <span>Uploaded: {file.uploadedAt}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                showToast(`Downloading mock resource: "${file.name}"...`);
                              }}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                              title="Download PDF Document"
                            >
                              <Upload className="w-4 h-4 rotate-180" />
                            </a>
                            <button
                              onClick={() => removeKnowledgeFile(user.id, idx)}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                              title="Remove from Knowledge Base"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* 2. ACTIVATION KEYS CONFIGURATION (Shown in all access methods, read-only) */}
              <div className="bg-white border border-slate-150 p-4 sm:p-5 rounded-3xl shadow-xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Activation Keys</h3>
                    <p className="text-xs text-slate-500">Keywords that trigger specialized actions or gestures.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    <span>Active Triggers</span>
                    <span>Total: {user.activationKeys?.length || 0}</span>
                  </div>

                  {/* Tags container - Read-Only */}
                  <div className="flex flex-wrap gap-1.5 p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl min-h-[44px]">
                    {!user.activationKeys || user.activationKeys.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No active activation keys assigned.</span>
                    ) : (
                      user.activationKeys.map((keyVal, idx) => (
                        <span 
                          key={idx} 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50/50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100/50"
                        >
                          <Key className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                          <span>{keyVal}</span>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* 3. SPECIFIC INSTRUCTIONS CONFIGURATION (Shown only for Hand Movement, read-only) */}
              {user.access?.includes('Hand Movement') && (
                <div className="bg-white border border-slate-150 p-4 sm:p-5 rounded-3xl shadow-xs space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Specific Instructions</h3>
                      <p className="text-xs text-slate-500">Customized guidelines and context payload overriding defaults.</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-700 leading-relaxed italic">
                    {user.specificInstructions ? (
                      <span>"{user.specificInstructions}"</span>
                    ) : (
                      <span className="text-slate-400">No custom instructions provided.</span>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
