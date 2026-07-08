import { useState } from 'react';
import {
  Sparkles, Image, FileUp, Upload, Key, Settings,
  ChevronRight, ChevronLeft, Bot, CheckCircle, Shield, Trash2, Loader2
} from 'lucide-react';

export default function CreateChatbotWizard({
  hasHeadMovement,
  hasHandMovement,
  onCreateBot,
  showToast
}) {
  const [wizardStep, setWizardStep] = useState(1);
  const [botName, setBotName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedPdfs, setUploadedPdfs] = useState([]);
  const [isPdfDragOver, setIsPdfDragOver] = useState(false);
  const [activationKeyword, setActivationKeyword] = useState('');
  const [botInstructions, setBotInstructions] = useState('');
  const [scanCardRequired, setScanCardRequired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [headMovementMode, setHeadMovementMode] = useState('both');
  const [handMovementHiDetect, setHandMovementHiDetect] = useState(true);
  const [handMovementHiSaysHi, setHandMovementHiSaysHi] = useState(true);
  const [handMovementByeChatEnds, setHandMovementByeChatEnds] = useState(true);
  const [handMovementThumbsDetect, setHandMovementThumbsDetect] = useState(true);
  const [handMovementThumbsCorrect, setHandMovementThumbsCorrect] = useState(true);

  const resetForm = () => {
    setBotName('');
    setAvatarPreview('');
    setAvatarFile(null);
    setUploadedPdfs([]);
    setActivationKeyword('');
    setBotInstructions('');
    setHeadMovementMode('both');
    setHandMovementHiDetect(true);
    setHandMovementHiSaysHi(true);
    setHandMovementByeChatEnds(true);
    setHandMovementThumbsDetect(true);
    setHandMovementThumbsCorrect(true);
    setScanCardRequired(false);
    setWizardStep(1);
  };

  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (png, jpeg, webp)!');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
      showToast('Image uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const processPdfFiles = (fileList) => {
    if (!fileList?.length) return;

    const newPdfs = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        showToast(`File "${file.name}" is not a PDF!`);
        continue;
      }

      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      newPdfs.push({
        name: file.name,
        size: `${sizeMb} MB`,
        file,
      });
    }

    if (newPdfs.length > 0) {
      setUploadedPdfs((prev) => [...prev, ...newPdfs]);
      showToast(`Successfully uploaded ${newPdfs.length} PDF(s)!`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!botName.trim()) {
      showToast('Chatbot Name is required!');
      setWizardStep(1);
      return;
    }
    if (!avatarFile) {
      showToast('Onboarding image is required!');
      setWizardStep(1);
      return;
    }
    if (uploadedPdfs.length === 0) {
      showToast('Knowledge Base PDF is required!');
      setWizardStep(2);
      return;
    }
    if (!activationKeyword.trim()) {
      showToast('Activation Gesture Keyword is required!');
      setWizardStep(2);
      return;
    }
    if (!botInstructions.trim() || botInstructions.trim().length < 10) {
      showToast('Specific Instructions must be at least 10 characters!');
      setWizardStep(3);
      return;
    }

    setIsSubmitting(true);

    const result = await onCreateBot({
      name: botName.trim(),
      activationKey: activationKeyword.trim().toLowerCase(),
      specificInstructions: botInstructions.trim(),
      scanCardRequired,
      headMovementMode: hasHeadMovement ? headMovementMode : null,
      handMovements: hasHandMovement
        ? {
            hi: {
              detects: handMovementHiDetect,
              saysHi: handMovementHiSaysHi,
            },
            bye: {
              chatEnds: handMovementByeChatEnds,
            },
            thumbsUp: {
              detects: handMovementThumbsDetect,
              correctInfo: handMovementThumbsCorrect,
            },
          }
        : null,
      onboardingImageFile: avatarFile,
      pdfFiles: uploadedPdfs.map((p) => p.file),
    });

    setIsSubmitting(false);

    if (result?.success) {
      resetForm();
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="bg-slate-900/50 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="mb-8 text-left">
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            Create Chatbot
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Follow the steps below to set up your custom chatbot.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-8 text-center text-xs font-mono">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setWizardStep(1)}
            className={`py-2 rounded-xl border transition-all cursor-pointer disabled:opacity-50 ${
              wizardStep === 1
                ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300 font-extrabold'
                : 'bg-slate-950/40 border-slate-850 text-slate-500'
            }`}
          >
            <span className="block text-[10px] font-bold text-slate-400 mb-0.5">STEP 01</span>
            <span>Identity</span>
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => (botName.trim() && avatarFile ? setWizardStep(2) : showToast('Please complete name and avatar first!'))}
            className={`py-2 rounded-xl border transition-all cursor-pointer disabled:opacity-50 ${
              wizardStep === 2
                ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300 font-extrabold'
                : 'bg-slate-950/40 border-slate-850 text-slate-500'
            }`}
          >
            <span className="block text-[10px] font-bold text-slate-400 mb-0.5">STEP 02</span>
            <span>Knowledge Base</span>
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => (botName.trim() && avatarFile && uploadedPdfs.length > 0 ? setWizardStep(3) : showToast('Please fill out preceding steps!'))}
            className={`py-2 rounded-xl border transition-all cursor-pointer disabled:opacity-50 ${
              wizardStep === 3
                ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300 font-extrabold'
                : 'bg-slate-950/40 border-slate-850 text-slate-500'
            }`}
          >
            <span className="block text-[10px] font-bold text-slate-400 mb-0.5">STEP 03</span>
            <span>Gestures</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {wizardStep === 1 && (
            <div className="space-y-5 animate-fade-in text-left">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  Name
                </label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  placeholder="e.g. Assistant"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white placeholder-slate-600 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  Avatar Image <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                  Upload an image to represent your chatbot.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-950 border border-slate-800 rounded-2xl relative group overflow-hidden">
                    <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest mb-2 block">Preview</span>
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-800 shadow-md relative bg-slate-900 flex items-center justify-center">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar Preview"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Image className="w-8 h-8 text-slate-700" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 font-mono truncate max-w-full">
                      {avatarFile ? avatarFile.name : 'No image selected'}
                    </span>
                  </div>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      processImageFile(e.dataTransfer?.files?.[0]);
                    }}
                    className={`md:col-span-2 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 transition-all relative text-center group cursor-pointer ${
                      isDragOver
                        ? 'border-indigo-500 bg-indigo-500/5'
                        : 'border-slate-800 hover:border-indigo-500/30 bg-slate-950/40 hover:bg-slate-950/80'
                    }`}
                  >
                    <input
                      type="file"
                      id="avatar-file-upload"
                      accept="image/*"
                      disabled={isSubmitting}
                      onChange={(e) => processImageFile(e.target.files?.[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-2xl mb-2 group-hover:scale-110 transition-transform">
                      <Image className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-300">Drag and drop your avatar image here</p>
                    <p className="text-[10px] text-slate-500 mt-1">Supports PNG, JPEG, WEBP or GIF</p>
                    <div className="mt-3.5 relative z-20">
                      <label
                        htmlFor="avatar-file-upload"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/15"
                      >
                        <FileUp className="w-3.5 h-3.5" />
                        <span>Choose File</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => (botName.trim() && avatarFile ? setWizardStep(2) : showToast('Please enter a name and upload an avatar!'))}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-5 animate-fade-in text-left">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <FileUp className="w-3.5 h-3.5 text-indigo-400" />
                  Knowledge Base PDFs <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                  Upload one or multiple PDF documents to train your chatbot.
                </p>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsPdfDragOver(true); }}
                  onDragLeave={() => setIsPdfDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsPdfDragOver(false);
                    processPdfFiles(e.dataTransfer?.files);
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center relative group transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                    isPdfDragOver
                      ? 'border-indigo-500 bg-indigo-500/5'
                      : 'border-slate-800 hover:border-indigo-500/30 bg-slate-950/40 hover:bg-slate-950/80'
                  }`}
                >
                  <input
                    type="file"
                    id="pdf-multiple-upload"
                    multiple
                    accept=".pdf"
                    disabled={isSubmitting}
                    onChange={(e) => processPdfFiles(e.target.files)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
                    <FileUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-300">Drag & drop multiple PDFs here, or click to upload</p>
                    <p className="text-[10px] text-slate-500 mt-1">Supports standard PDF manuals and guidelines</p>
                  </div>
                  <label
                    htmlFor="pdf-multiple-upload"
                    className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer z-20 relative"
                  >
                    Select PDFs from PC
                  </label>
                </div>

                {uploadedPdfs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Uploaded Documents ({uploadedPdfs.length})
                    </span>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {uploadedPdfs.map((pdf, idx) => (
                        <div
                          key={`${pdf.name}-${idx}`}
                          className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl animate-fade-in"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <FileUp className="w-4 h-4 text-indigo-400 shrink-0" />
                            <div className="overflow-hidden">
                              <p className="text-xs text-slate-200 font-mono truncate" title={pdf.name}>
                                {pdf.name}
                              </p>
                              <span className="text-[9px] text-slate-500 font-mono">
                                {pdf.size}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => {
                              setUploadedPdfs((prev) => prev.filter((_, i) => i !== idx));
                              showToast('Removed document.');
                            }}
                            className="p-1.5 bg-slate-900 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 rounded-lg transition-all cursor-pointer shrink-0 disabled:opacity-50"
                            title="Remove Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  Trigger Keyword
                </label>
                <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                  Enter a keyword. When users type this word in the conversation, they will trigger special gestures!
                </p>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  placeholder="e.g. wave, nod, activate"
                  value={activationKeyword}
                  onChange={(e) => setActivationKeyword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white placeholder-slate-600 font-mono disabled:opacity-50"
                />
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-850">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-3 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => (uploadedPdfs.length > 0 && activationKeyword.trim() ? setWizardStep(3) : showToast('Please complete all fields first!'))}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-5 animate-fade-in text-left">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-indigo-400" />
                    Instructions <span className="text-rose-500">*</span>
                  </label>
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-[9px] font-mono font-bold uppercase">
                    Required
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                  Provide the main rules and instructions for your chatbot's responses (min 10 characters).
                </p>
                <textarea
                  rows={4}
                  required
                  disabled={isSubmitting}
                  value={botInstructions}
                  onChange={(e) => setBotInstructions(e.target.value)}
                  placeholder="e.g. Always respond in a polite and helpful manner..."
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed disabled:opacity-50"
                />
              </div>

              {(hasHeadMovement || hasHandMovement) && (
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4 text-left">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
                    <Bot className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Movement Settings
                    </h4>
                  </div>

                  {hasHeadMovement && (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Head Trigger
                      </label>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Select when the chatbot should move its head.
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'detecting', label: 'By detecting' },
                          { id: 'talking', label: 'By talking' },
                          { id: 'both', label: 'By both' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => setHeadMovementMode(item.id)}
                            className={`py-2 px-3 rounded-xl border text-[10px] font-bold tracking-wide transition-all cursor-pointer text-center disabled:opacity-50 ${
                              headMovementMode === item.id
                                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {hasHandMovement && (
                    <div className={`space-y-3 pt-3 ${hasHeadMovement ? 'border-t border-slate-850' : ''}`}>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Hand Gestures
                      </label>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Configure when hand gestures are performed.
                      </p>

                      <div className="space-y-3">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                          <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            On "hi" (Wave)
                          </span>
                          <div className="space-y-2 pt-1">
                            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                              <input
                                type="checkbox"
                                disabled={isSubmitting}
                                checked={handMovementHiDetect}
                                onChange={(e) => setHandMovementHiDetect(e.target.checked)}
                                className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                              />
                              <span>when person is detected</span>
                            </label>
                            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                              <input
                                type="checkbox"
                                disabled={isSubmitting}
                                checked={handMovementHiSaysHi}
                                onChange={(e) => setHandMovementHiSaysHi(e.target.checked)}
                                className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                              />
                              <span>when user says hi</span>
                            </label>
                          </div>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                          <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            On "bye" (Wave)
                          </span>
                          <div className="space-y-2 pt-1">
                            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                              <input
                                type="checkbox"
                                disabled={isSubmitting}
                                checked={handMovementByeChatEnds}
                                onChange={(e) => setHandMovementByeChatEnds(e.target.checked)}
                                className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                              />
                              <span>when chat ends</span>
                            </label>
                          </div>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                          <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            On "thumbs up"
                          </span>
                          <div className="space-y-2 pt-1">
                            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                              <input
                                type="checkbox"
                                disabled={isSubmitting}
                                checked={handMovementThumbsDetect}
                                onChange={(e) => setHandMovementThumbsDetect(e.target.checked)}
                                className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                              />
                              <span>when person is detected</span>
                            </label>
                            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                              <input
                                type="checkbox"
                                disabled={isSubmitting}
                                checked={handMovementThumbsCorrect}
                                onChange={(e) => setHandMovementThumbsCorrect(e.target.checked)}
                                className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                              />
                              <span>on confirmation</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Card Scanning Protocol
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Require users to scan an authentication card before they can access and chat with this robot.
                </p>
                <label className="flex items-center gap-3 py-1 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={isSubmitting}
                    checked={scanCardRequired}
                    onChange={(e) => setScanCardRequired(e.target.checked)}
                    className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="font-bold">Scan Card</span>
                </label>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-1.5 font-mono text-[11px]">
                <h4 className="font-bold text-slate-300">Ready:</h4>
                <p className="text-slate-500">Name: <span className="text-slate-300 font-bold">{botName}</span></p>
                <p className="text-slate-500">Trigger keyword: <span className="text-indigo-300 font-bold">"{activationKeyword}"</span></p>
                <p className="text-slate-500">Knowledge base: <span className="text-slate-300">
                  {uploadedPdfs.map((p) => p.name).join(', ')}
                </span></p>
                <p className="text-slate-500">Card Authentication: <span className={scanCardRequired ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {scanCardRequired ? 'Required (Scan Card)' : 'Disabled'}
                </span></p>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-850">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setWizardStep(2)}
                  className="px-4 py-3 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Create Chatbot</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
