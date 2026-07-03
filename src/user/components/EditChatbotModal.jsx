import { useState } from 'react';
import { X, Settings, Upload, FileUp } from 'lucide-react';

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
  const [editKbPdfName, setEditKbPdfName] = useState(chatbot?.knowledgeBasePdf || '');
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
    if (!editKbPdfName.trim()) {
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
      knowledgeBasePdf: editKbPdfName.trim(),
      activationKey: editActivationKeyword.trim().toLowerCase(),
      specificInstructions: editBotInstructions.trim(),
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
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Knowledge Base PDF
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={editKbPdfName}
                onChange={(e) => setEditKbPdfName(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  const samplePDFs = ['nexus_instructions.pdf', 'system_calibration.pdf', 'product_guide_v2.pdf', 'company_faq_v5.pdf'];
                  const selectedSample = samplePDFs[Math.floor(Math.random() * samplePDFs.length)];
                  setEditKbPdfName(selectedSample);
                  showToast(`Sample file uploaded!`);
                }}
                className="px-4 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-2xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Attach PDF</span>
              </button>
            </div>
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
