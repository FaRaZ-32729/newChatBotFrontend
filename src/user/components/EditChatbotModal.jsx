import { useState } from 'react';
import { X, Settings, Upload, FileUp, Shield, Trash2 } from 'lucide-react';

export default function EditChatbotModal({
  chatbot,
  onClose,
  onUpdateChatbot,
  hasHeadMovement,
  hasHandMovement,
  showToast
}) {
  const [editBotName, setEditBotName] = useState(chatbot?.name || '');
  const [editSelectedAvatar, setEditSelectedAvatar] = useState(
    chatbot?.onboardingImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
  );
  const [editIsDragOver, setEditIsDragOver] = useState(false);
  const [editUploadedPdfs, setEditUploadedPdfs] = useState(() => {
    if (chatbot?.knowledgeBasePdfs && Array.isArray(chatbot.knowledgeBasePdfs)) {
      return chatbot.knowledgeBasePdfs;
    }
    if (chatbot?.knowledgeBasePdf) {
      return chatbot.knowledgeBasePdf.split(',').map(name => ({
        name: name.trim(),
        size: '1.2 MB'
      }));
    }
    return [];
  });
  const [editIsPdfDragOver, setEditIsPdfDragOver] = useState(false);
  const [editScanCardRequired, setEditScanCardRequired] = useState(chatbot?.scanCardRequired ?? false);
  const [editActivationKeyword, setEditActivationKeyword] = useState(chatbot?.activationKey || '');
  const [editBotInstructions, setEditBotInstructions] = useState(chatbot?.specificInstructions || '');
  const [editHeadMovementMode, setEditHeadMovementMode] = useState(chatbot?.headMovementMode || 'both');
  const [editHandMovementHiDetect, setEditHandMovementHiDetect] = useState(chatbot?.handMovements?.hi?.detects ?? true);
  const [editHandMovementHiSaysHi, setEditHandMovementHiSaysHi] = useState(chatbot?.handMovements?.hi?.saysHi ?? true);
  const [editHandMovementByeChatEnds, setEditHandMovementByeChatEnds] = useState(chatbot?.handMovements?.bye?.chatEnds ?? true);
  const [editHandMovementThumbsDetect, setEditHandMovementThumbsDetect] = useState(chatbot?.handMovements?.thumbsUp?.detects ?? true);
  const [editHandMovementThumbsCorrect, setEditHandMovementThumbsCorrect] = useState(chatbot?.handMovements?.thumbsUp?.correctInfo ?? true);

  // Edit avatar handlers
  const handleEditImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file (png, jpeg, webp)!');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setEditSelectedAvatar(reader.result);
        showToast('Edit avatar updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditDragOver = (e) => {
    e.preventDefault();
    setEditIsDragOver(true);
  };

  const handleEditDragLeave = () => {
    setEditIsDragOver(false);
  };

  const handleEditDrop = (e) => {
    e.preventDefault();
    setEditIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file (png, jpeg, webp)!');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setEditSelectedAvatar(reader.result);
        showToast('Edit avatar updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Chatbot Update form submit
  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!editBotName.trim()) {
      showToast('Chatbot Name is required!');
      return;
    }
    if (editUploadedPdfs.length === 0) {
      showToast('Knowledge Base PDF is required!');
      return;
    }
    if (!editActivationKeyword.trim()) {
      showToast('Activation Gesture Keyword is required!');
      return;
    }
    if (!editBotInstructions.trim()) {
      showToast('Specific Instructions is required!');
      return;
    }

    const updatedBot = {
      name: editBotName.trim(),
      onboardingImage: editSelectedAvatar,
      knowledgeBasePdf: editUploadedPdfs.map(p => p.name).join(', '),
      knowledgeBasePdfs: editUploadedPdfs,
      activationKey: editActivationKeyword.trim().toLowerCase(),
      specificInstructions: editBotInstructions.trim(),
      scanCardRequired: editScanCardRequired,
      headMovementMode: hasHeadMovement ? editHeadMovementMode : null,
      handMovements: hasHandMovement ? {
        hi: {
          detects: editHandMovementHiDetect,
          saysHi: editHandMovementHiSaysHi
        },
        bye: {
          chatEnds: editHandMovementByeChatEnds
        },
        thumbsUp: {
          detects: editHandMovementThumbsDetect,
          correctInfo: editHandMovementThumbsCorrect
        }
      } : null
    };

    onUpdateChatbot(chatbot.id, updatedBot);
    showToast(`Successfully updated "${editBotName.trim()}" chatbot!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-3 border-b border-slate-800 text-left">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Edit Chatbot</h3>
            <p className="text-[11px] text-slate-500">Update your chatbot's settings.</p>
          </div>
        </div>

        <form onSubmit={handleUpdateSubmit} className="space-y-5 text-left">
          {/* Chatbot Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Name
            </label>
            <input
              type="text"
              required
              value={editBotName}
              onChange={(e) => setEditBotName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white"
            />
          </div>

          {/* Onboarding Image upload */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              Avatar Image
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest mb-1.5 block">Preview</span>
                <img
                  src={editSelectedAvatar}
                  alt="Avatar Preview"
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover border border-slate-800 shadow-md"
                />
              </div>
              <div 
                onDragOver={handleEditDragOver}
                onDragLeave={handleEditDragLeave}
                onDrop={handleEditDrop}
                className={`md:col-span-2 flex flex-col items-center justify-center border border-dashed rounded-2xl p-4 transition-all relative text-center cursor-pointer ${
                  editIsDragOver 
                    ? 'border-indigo-500 bg-indigo-500/5 animate-pulse' 
                    : 'border-slate-800 hover:border-indigo-500/30 bg-slate-950/40'
                }`}
              >
                <input
                  type="file"
                  id="edit-avatar-upload"
                  accept="image/*"
                  onChange={handleEditImageFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <p className="text-[11px] font-bold text-slate-300">Drag and drop an image here, or click to upload</p>
                <label 
                  htmlFor="edit-avatar-upload" 
                  className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 shadow-md shadow-indigo-600/15"
                >
                  <FileUp className="w-3 h-3" />
                  <span>Upload</span>
                </label>
              </div>
            </div>
          </div>

          {/* Knowledge Base PDF Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <FileUp className="w-3.5 h-3.5 text-indigo-400" />
              Knowledge Base PDFs <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
              Upload multiple PDF documents from your computer.
            </p>

            {/* Dropzone for Edit */}
            <div 
              onDragOver={(e) => { e.preventDefault(); setEditIsPdfDragOver(true); }}
              onDragLeave={() => setEditIsPdfDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setEditIsPdfDragOver(false);
                const files = e.dataTransfer?.files;
                if (files && files.length > 0) {
                  const newPdfs = [];
                  for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if (!file.name.toLowerCase().endsWith('.pdf')) {
                      showToast(`File "${file.name}" is not a PDF!`);
                      continue;
                    }
                    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
                    newPdfs.push({
                      name: file.name,
                      size: `${sizeMb} MB`
                    });
                  }
                  if (newPdfs.length > 0) {
                    setEditUploadedPdfs(prev => [...prev, ...newPdfs]);
                    showToast(`Added ${newPdfs.length} PDF(s) from PC!`);
                  }
                }
              }}
              className={`border-2 border-dashed rounded-2xl p-4 text-center relative group transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                editIsPdfDragOver 
                  ? 'border-indigo-500 bg-indigo-500/5' 
                  : 'border-slate-800 hover:border-indigo-500/30 bg-slate-950/40 hover:bg-slate-950/80'
              }`}
            >
              <input
                type="file"
                id="edit-pdf-multiple"
                multiple
                accept=".pdf"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    const newPdfs = [];
                    for (let i = 0; i < files.length; i++) {
                      const file = files[i];
                      if (!file.name.toLowerCase().endsWith('.pdf')) {
                        showToast(`File "${file.name}" is not a PDF!`);
                        continue;
                      }
                      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
                      newPdfs.push({
                        name: file.name,
                        size: `${sizeMb} MB`
                      });
                    }
                    if (newPdfs.length > 0) {
                      setEditUploadedPdfs(prev => [...prev, ...newPdfs]);
                      showToast(`Added ${newPdfs.length} PDF(s) from PC!`);
                    }
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <FileUp className="w-5 h-5 text-indigo-400" />
              <p className="text-[11px] font-bold text-slate-300">Drag & drop PDFs here, or click to upload</p>
            </div>

            {/* Load Sample helper */}
            <div className="mt-1.5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  const samplePDFs = [
                    { name: 'nexus_user_instructions.pdf', size: '1.4 MB' },
                    { name: 'calibration_specs_v2.pdf', size: '2.1 MB' }
                  ];
                  setEditUploadedPdfs(prev => [...prev, ...samplePDFs]);
                  showToast('Sample PDFs added!');
                }}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
              >
                + Add Sample PDFs
              </button>
            </div>

            {/* List of files */}
            {editUploadedPdfs.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Documents ({editUploadedPdfs.length})
                </span>
                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {editUploadedPdfs.map((pdf, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileUp className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <div className="overflow-hidden">
                          <p className="text-[11px] text-slate-200 font-mono truncate" title={pdf.name}>
                            {pdf.name}
                          </p>
                          <span className="text-[8px] text-slate-500 font-mono">
                            {pdf.size}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditUploadedPdfs(prev => prev.filter((_, i) => i !== idx));
                          showToast('Document removed.');
                        }}
                        className="p-1 bg-slate-900 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 rounded-md transition-all cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Activation Gesture Keyword */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Trigger Keyword
            </label>
            <input
              type="text"
              required
              value={editActivationKeyword}
              onChange={(e) => setEditActivationKeyword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white font-mono"
            />
          </div>

          {/* Specific Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Instructions
            </label>
            <textarea
              rows={3}
              required
              value={editBotInstructions}
              onChange={(e) => setEditBotInstructions(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          {/* Mechanical Movement Settings */}
          {(hasHeadMovement || hasHandMovement) && (
            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-850 pb-1.5">
                Movement Settings
              </span>

              {/* Head Movement */}
              {hasHeadMovement && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Head Trigger</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'detecting', label: 'By detecting' },
                      { id: 'talking', label: 'By talking' },
                      { id: 'both', label: 'By both' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setEditHeadMovementMode(item.id)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer text-center ${
                          editHeadMovementMode === item.id
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

              {/* Hand Movement */}
              {hasHandMovement && (
                <div className={`space-y-2 pt-2 ${hasHeadMovement ? 'border-t border-slate-850' : ''}`}>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Hand Gestures</label>
                  <div className="space-y-2 text-left">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={editHandMovementHiDetect}
                        onChange={(e) => setEditHandMovementHiDetect(e.target.checked)}
                        className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>Wave on hello</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={editHandMovementHiSaysHi}
                        onChange={(e) => setEditHandMovementHiSaysHi(e.target.checked)}
                        className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>Wave when bot speaks</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={editHandMovementByeChatEnds}
                        onChange={(e) => setEditHandMovementByeChatEnds(e.target.checked)}
                        className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>Wave on goodbye</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={editHandMovementThumbsDetect}
                        onChange={(e) => setEditHandMovementThumbsDetect(e.target.checked)}
                        className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>Thumbs up on acknowledge</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={editHandMovementThumbsCorrect}
                        onChange={(e) => setEditHandMovementThumbsCorrect(e.target.checked)}
                        className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>Thumbs up on confirmation</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security & Card Scanning Protocol */}
          <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800 space-y-2 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-850 pb-1.5">
              Security Protocol
            </span>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              When active, users are required to complete card scanning authentication prior to starting their chat session.
            </p>
            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white py-1">
              <input
                type="checkbox"
                checked={editScanCardRequired}
                onChange={(e) => setEditScanCardRequired(e.target.checked)}
                className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span className="font-bold">Scan Card</span>
            </label>
            {editScanCardRequired && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-900 space-y-1 animate-fade-in">
                <h5 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  End Chat Scan Requirement
                </h5>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Require user to scan the card before they end the chat.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
