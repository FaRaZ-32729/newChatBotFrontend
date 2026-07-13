import { useState } from 'react';
import { X, Settings, Upload, FileUp, Trash2, Loader2 } from 'lucide-react';

function mapExistingPdfs(chatbot) {
  if (chatbot?.knowledgeBasePdfs && Array.isArray(chatbot.knowledgeBasePdfs)) {
    return chatbot.knowledgeBasePdfs.map((p) => ({
      name: p.name,
      size: p.size || '',
      url: p.url || '',
      isExisting: Boolean(p.url),
      file: null,
    }));
  }
  return [];
}

export default function EditChatbotModal({
  chatbot,
  onClose,
  onUpdateChatbot,
  hasHeadMovement,
  hasHandMovement,
  showToast,
}) {
  const [editBotName, setEditBotName] = useState(chatbot?.name || '');
  const [editSelectedAvatar, setEditSelectedAvatar] = useState(
    chatbot?.onboardingImage
      || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [editIsDragOver, setEditIsDragOver] = useState(false);
  const [editUploadedPdfs, setEditUploadedPdfs] = useState(() => mapExistingPdfs(chatbot));
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
  const [isSaving, setIsSaving] = useState(false);

  const applyAvatarFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (png, jpeg, webp)!');
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setEditSelectedAvatar(reader.result);
      showToast('Edit avatar updated!');
    };
    reader.readAsDataURL(file);
  };

  const addPdfFiles = (fileList) => {
    if (!fileList?.length) return;
    const newPdfs = [];
    for (let i = 0; i < fileList.length; i += 1) {
      const file = fileList[i];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        showToast(`File "${file.name}" is not a PDF!`);
        continue;
      }
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      newPdfs.push({
        name: file.name,
        size: `${sizeMb} MB`,
        url: '',
        isExisting: false,
        file,
      });
    }
    if (newPdfs.length > 0) {
      setEditUploadedPdfs((prev) => [...prev, ...newPdfs]);
      showToast(`Added ${newPdfs.length} PDF(s)!`);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

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

    const formData = new FormData();
    formData.append('name', editBotName.trim());
    formData.append('activationKey', editActivationKeyword.trim().toLowerCase());
    formData.append('specificInstructions', editBotInstructions.trim());
    formData.append('scanCardRequired', String(editScanCardRequired));

    if (hasHeadMovement) {
      formData.append('headMovementMode', editHeadMovementMode);
    }

    if (hasHandMovement) {
      formData.append(
        'handMovements',
        JSON.stringify({
          hi: {
            detects: editHandMovementHiDetect,
            saysHi: editHandMovementHiSaysHi,
          },
          bye: {
            chatEnds: editHandMovementByeChatEnds,
          },
          thumbsUp: {
            detects: editHandMovementThumbsDetect,
            correctInfo: editHandMovementThumbsCorrect,
          },
        })
      );
    }

    const retainedPdfUrls = editUploadedPdfs
      .filter((p) => p.isExisting && p.url)
      .map((p) => p.url);
    formData.append('retainedPdfUrls', JSON.stringify(retainedPdfUrls));

    editUploadedPdfs
      .filter((p) => !p.isExisting && p.file)
      .forEach((p) => {
        formData.append('knowledgeBasePdfs', p.file);
      });

    if (avatarFile) {
      formData.append('onboardingImage', avatarFile);
    }

    setIsSaving(true);
    try {
      const result = await onUpdateChatbot(chatbot.id, formData);
      if (result?.success) {
        showToast(result.message || `Successfully updated "${editBotName.trim()}"!`);
        onClose();
      } else {
        showToast(result?.message || 'Update failed. No changes were applied.');
      }
    } catch (err) {
      showToast(err?.message || 'Update failed. No changes were applied.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-3 border-b border-slate-800 text-left">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Edit Chatbot</h3>
            <p className="text-[11px] text-slate-500">Update settings, PDFs, and triggers. Unchanged fields stay as-is.</p>
          </div>
        </div>

        <form onSubmit={handleUpdateSubmit} className="space-y-5 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Name
            </label>
            <input
              type="text"
              required
              value={editBotName}
              onChange={(e) => setEditBotName(e.target.value)}
              disabled={isSaving}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Onboarding Image
            </label>
            <div className="flex items-center gap-4">
              <img
                src={editSelectedAvatar}
                alt="Avatar"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border border-slate-800"
              />
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setEditIsDragOver(true);
                }}
                onDragLeave={() => setEditIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setEditIsDragOver(false);
                  applyAvatarFile(e.dataTransfer?.files?.[0]);
                }}
                className={`flex-1 border-2 border-dashed rounded-2xl p-3 text-center relative transition-all ${
                  editIsDragOver
                    ? 'border-indigo-500 bg-indigo-500/5'
                    : 'border-slate-800 hover:border-indigo-500/30 bg-slate-950/40'
                }`}
              >
                <input
                  type="file"
                  id="edit-avatar-upload"
                  accept="image/*"
                  disabled={isSaving}
                  onChange={(e) => applyAvatarFile(e.target.files?.[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <Upload className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-slate-400">Replace image (optional)</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Knowledge Base PDFs
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setEditIsPdfDragOver(true);
              }}
              onDragLeave={() => setEditIsPdfDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setEditIsPdfDragOver(false);
                addPdfFiles(e.dataTransfer?.files);
              }}
              className={`border-2 border-dashed rounded-2xl p-4 text-center relative transition-all flex flex-col items-center justify-center gap-1.5 ${
                editIsPdfDragOver
                  ? 'border-indigo-500 bg-indigo-500/5'
                  : 'border-slate-800 hover:border-indigo-500/30 bg-slate-950/40'
              }`}
            >
              <input
                type="file"
                id="edit-pdf-multiple"
                multiple
                accept=".pdf"
                disabled={isSaving}
                onChange={(e) => {
                  addPdfFiles(e.target.files);
                  e.target.value = '';
                }}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <FileUp className="w-5 h-5 text-indigo-400" />
              <p className="text-[11px] font-bold text-slate-300">Add new PDFs (optional)</p>
            </div>

            {editUploadedPdfs.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Documents ({editUploadedPdfs.length})
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {editUploadedPdfs.map((pdf, idx) => (
                    <div
                      key={`${pdf.name}-${pdf.url || idx}`}
                      className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl"
                    >
                      <div className="flex items-center gap-2 overflow-hidden min-w-0">
                        <FileUp className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <div className="overflow-hidden min-w-0">
                          <p className="text-[11px] text-slate-200 font-mono truncate" title={pdf.name}>
                            {pdf.name}
                          </p>
                          <span className="text-[8px] text-slate-500 font-mono">
                            {pdf.size}
                            {pdf.isExisting ? ' · saved' : ' · new'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => {
                          setEditUploadedPdfs((prev) => prev.filter((_, i) => i !== idx));
                          showToast(pdf.isExisting ? 'PDF marked for removal on save.' : 'New PDF removed.');
                        }}
                        className="p-1 bg-slate-900 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 rounded-md transition-all cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Trigger Keyword
            </label>
            <input
              type="text"
              required
              value={editActivationKeyword}
              onChange={(e) => setEditActivationKeyword(e.target.value)}
              disabled={isSaving}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Specific Instructions
            </label>
            <textarea
              required
              rows={4}
              value={editBotInstructions}
              onChange={(e) => setEditBotInstructions(e.target.value)}
              disabled={isSaving}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed disabled:opacity-50"
            />
          </div>

          {(hasHeadMovement || hasHandMovement) && (
            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-850 pb-1.5">
                Movement Settings
              </span>

              {hasHeadMovement && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Head Trigger</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'detecting', label: 'By detecting' },
                      { id: 'talking', label: 'By talking' },
                      { id: 'both', label: 'By both' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        disabled={isSaving}
                        onClick={() => setEditHeadMovementMode(item.id)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer text-center disabled:opacity-50 ${
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

              {hasHandMovement && (
                <div className={`space-y-2 pt-2 ${hasHeadMovement ? 'border-t border-slate-850' : ''}`}>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Hand Gestures</label>
                  <div className="space-y-2 text-left">
                    {[
                      [editHandMovementHiDetect, setEditHandMovementHiDetect, 'Wave on hello'],
                      [editHandMovementHiSaysHi, setEditHandMovementHiSaysHi, 'Wave when bot speaks'],
                      [editHandMovementByeChatEnds, setEditHandMovementByeChatEnds, 'Wave on goodbye'],
                      [editHandMovementThumbsDetect, setEditHandMovementThumbsDetect, 'Thumbs up on acknowledge'],
                      [editHandMovementThumbsCorrect, setEditHandMovementThumbsCorrect, 'Thumbs up on confirmation'],
                    ].map(([checked, setChecked, label]) => (
                      <label key={label} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={isSaving}
                          onChange={(e) => setChecked(e.target.checked)}
                          className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800 space-y-2 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-850 pb-1.5">
              Security Protocol
            </span>
            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white py-1">
              <input
                type="checkbox"
                checked={editScanCardRequired}
                disabled={isSaving}
                onChange={(e) => setEditScanCardRequired(e.target.checked)}
                className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span className="font-bold">Scan Card</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer inline-flex items-center gap-2 disabled:opacity-60"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
