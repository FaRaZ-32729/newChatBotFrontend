import { useState } from 'react';
import { 
  Sparkles, Image, FileUp, Upload, Key, Settings, 
  ChevronRight, ChevronLeft, Bot, CheckCircle 
} from 'lucide-react';

export default function CreateChatbotWizard({ 
  currentUser, 
  hasHeadMovement, 
  hasHandMovement, 
  onCreateBot,
  showToast 
}) {
  const [wizardStep, setWizardStep] = useState(1); // 1, 2, 3
  const [botName, setBotName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80');
  const [isDragOver, setIsDragOver] = useState(false);
  const [kbPdfName, setKbPdfName] = useState('');
  const [activationKeyword, setActivationKeyword] = useState('');
  const [botInstructions, setBotInstructions] = useState('');

  // Physical movement configuration states
  const [headMovementMode, setHeadMovementMode] = useState('both'); // 'detecting' | 'talking' | 'both'
  const [handMovementHiDetect, setHandMovementHiDetect] = useState(true);
  const [handMovementHiSaysHi, setHandMovementHiSaysHi] = useState(true);
  const [handMovementByeChatEnds, setHandMovementByeChatEnds] = useState(true);
  const [handMovementThumbsDetect, setHandMovementThumbsDetect] = useState(true);
  const [handMovementThumbsCorrect, setHandMovementThumbsCorrect] = useState(true);

  // Drag and drop / File upload handlers
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file (png, jpeg, webp)!');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedAvatar(reader.result);
        showToast('Image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file (png, jpeg, webp)!');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedAvatar(reader.result);
        showToast('Image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!botName.trim()) {
      showToast('Chatbot Name is required!');
      setWizardStep(1);
      return;
    }
    if (!kbPdfName.trim()) {
      showToast('Knowledge Base PDF is required!');
      setWizardStep(2);
      return;
    }
    if (!activationKeyword.trim()) {
      showToast('Activation Gesture Keyword is required!');
      setWizardStep(2);
      return;
    }
    if (!botInstructions.trim()) {
      showToast('Specific Instructions is required!');
      setWizardStep(3);
      return;
    }

    const finalAvatar = selectedAvatar;
    const finalPdf = kbPdfName.trim() || 'default_knowledge.pdf';
    const finalKey = activationKeyword.trim().toLowerCase() || 'hello';

    const newBot = {
      id: `bot_${Date.now()}`,
      name: botName.trim(),
      onboardingImage: finalAvatar,
      knowledgeBasePdf: finalPdf,
      activationKey: finalKey,
      specificInstructions: botInstructions.trim(),
      createdBy: currentUser.email,
      createdAt: new Date().toISOString().split('T')[0],
      headMovementMode: hasHeadMovement ? headMovementMode : null,
      handMovements: hasHandMovement ? {
        hi: {
          detects: handMovementHiDetect,
          saysHi: handMovementHiSaysHi
        },
        bye: {
          chatEnds: handMovementByeChatEnds
        },
        thumbsUp: {
          detects: handMovementThumbsDetect,
          correctInfo: handMovementThumbsCorrect
        }
      } : null
    };

    onCreateBot(newBot);

    // Reset forms
    setBotName('');
    setSelectedAvatar('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80');
    setKbPdfName('');
    setActivationKeyword('');
    setBotInstructions('');
    setHeadMovementMode('both');
    setHandMovementHiDetect(true);
    setHandMovementHiSaysHi(true);
    setHandMovementByeChatEnds(true);
    setHandMovementThumbsDetect(true);
    setHandMovementThumbsCorrect(true);
    setWizardStep(1);
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="bg-slate-900/50 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        
        {/* Wizard Title Header */}
        <div className="mb-8 text-left">
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            Chatbot Factory Wizard
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Follow the process below to initialize, train, and configure a custom robotic chatbot profile.
          </p>
        </div>

        {/* Progress Indicator Bar */}
        <div className="grid grid-cols-3 gap-2 mb-8 text-center text-xs font-mono">
          <button 
            type="button"
            onClick={() => setWizardStep(1)}
            className={`py-2 rounded-xl border transition-all cursor-pointer ${
              wizardStep === 1 
                ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300 font-extrabold' 
                : 'bg-slate-950/40 border-slate-850 text-slate-500'
            }`}
          >
            <span className="block text-[10px] font-bold text-slate-400 mb-0.5">STEP 01</span>
            <span>Core Identity</span>
          </button>
          <button 
            type="button"
            onClick={() => botName.trim() ? setWizardStep(2) : showToast('Please enter a name first!')}
            className={`py-2 rounded-xl border transition-all cursor-pointer ${
              wizardStep === 2 
                ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300 font-extrabold' 
                : 'bg-slate-950/40 border-slate-850 text-slate-500'
            }`}
          >
            <span className="block text-[10px] font-bold text-slate-400 mb-0.5">STEP 02</span>
            <span>Training Core</span>
          </button>
          <button 
            type="button"
            onClick={() => (botName.trim() && kbPdfName.trim()) ? setWizardStep(3) : showToast('Please fill out preceding steps!')}
            className={`py-2 rounded-xl border transition-all cursor-pointer ${
              wizardStep === 3 
                ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300 font-extrabold' 
                : 'bg-slate-950/40 border-slate-850 text-slate-500'
            }`}
          >
            <span className="block text-[10px] font-bold text-slate-400 mb-0.5">STEP 03</span>
            <span>Behaviors</span>
          </button>
        </div>

        {/* Step Forms */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Step 1: Core Identity */}
          {wizardStep === 1 && (
            <div className="space-y-5 animate-fade-in text-left">
              {/* Chatbot Name input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  Chatbot Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nexus-X7 Assistant"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white placeholder-slate-600"
                />
              </div>

              {/* Onboarding Image Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  Onboarding Avatar Image
                </label>
                <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                  Upload a premium visual image from your computer to represent this chatbot on its welcome onboarding screen.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Selected Image Preview Area */}
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-950 border border-slate-800 rounded-2xl relative group overflow-hidden">
                    <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest mb-2 block">Avatar Preview</span>
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-800 shadow-md relative">
                      <img
                        src={selectedAvatar}
                        alt="Avatar Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 font-mono truncate max-w-full">
                      {selectedAvatar.startsWith('data:image') ? 'Uploaded Image' : 'Default Asset'}
                    </span>
                  </div>

                  {/* Interactive Drag and Drop Upload Area */}
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
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
                      onChange={handleImageFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-2xl mb-2 group-hover:scale-110 transition-transform">
                      <Image className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-300">Drag & drop your avatar image here</p>
                    <p className="text-[10px] text-slate-500 mt-1">Supports PNG, JPEG, WEBP or GIF</p>
                    
                    <div className="mt-3.5 relative z-20">
                      <label 
                        htmlFor="avatar-file-upload" 
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/15"
                      >
                        <FileUp className="w-3.5 h-3.5" />
                        <span>Choose from Computer</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => botName.trim() ? setWizardStep(2) : showToast('Please enter a name first!')}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Training Core & Trigger */}
          {wizardStep === 2 && (
            <div className="space-y-5 animate-fade-in text-left">
              
              {/* Simulated PDF Upload input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <FileUp className="w-3.5 h-3.5 text-indigo-400" />
                  Knowledge Base PDF Name
                </label>
                <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                  Input the filename of the documentation PDF file that will act as the chatbot's custom knowledge base.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nexus_FAQ_V4.pdf"
                    value={kbPdfName}
                    onChange={(e) => setKbPdfName(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white placeholder-slate-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const samplePDFs = ['nexus_instructions.pdf', 'system_calibration.pdf', 'product_guide_v2.pdf', 'company_faq_v5.pdf'];
                      const selectedSample = samplePDFs[Math.floor(Math.random() * samplePDFs.length)];
                      setKbPdfName(selectedSample);
                      showToast(`Simulated attachment uploaded!`);
                    }}
                    className="px-4 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-2xl text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Attach PDF</span>
                  </button>
                </div>
              </div>

              {/* Activation Key keyword input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  Activation Gesture Keyword
                </label>
                <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                  Type the secret trigger keyword. When users type this word in the chatbot conversation, they will activate on-screen physical animations!
                </p>
                <input
                  type="text"
                  required
                  placeholder="e.g. wave, nod, activate, calibrate"
                  value={activationKeyword}
                  onChange={(e) => setActivationKeyword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-white placeholder-slate-600 font-mono"
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-3 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => (botName.trim() && kbPdfName.trim() && activationKeyword.trim()) ? setWizardStep(3) : showToast('Please complete all fields first!')}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Specific Directives */}
          {wizardStep === 3 && (
            <div className="space-y-5 animate-fade-in text-left">
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-indigo-400" />
                    Specific Instructions <span className="text-rose-500">*</span>
                  </label>
                  
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-[9px] font-mono font-bold uppercase">
                    Mandatory Field
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                  Specify explicit directives, override prompts, or greeting rules for the chatbot to run. This field is mandatory for all access levels.
                </p>
                <textarea
                  rows={4}
                  required
                  value={botInstructions}
                  onChange={(e) => setBotInstructions(e.target.value)}
                  placeholder="e.g. Always respond with an intellectual tone. When the activation keyword is detected, proceed with wave and acknowledge user's instructions warmly..."
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              {/* Physical Movement Protocol Configuration */}
              {(hasHeadMovement || hasHandMovement) && (
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4 text-left">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
                    <Bot className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Mechanical Movement Settings
                    </h4>
                  </div>

                  {/* Head Movement Configuration */}
                  {hasHeadMovement && (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Head Movement Trigger
                      </label>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Configure when the virtual neck joint alignment motors should initiate pitch and yaw articulation.
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'detecting', label: 'By detecting' },
                          { id: 'talking', label: 'By talking' },
                          { id: 'both', label: 'By both' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setHeadMovementMode(item.id)}
                            className={`py-2 px-3 rounded-xl border text-[10px] font-bold tracking-wide transition-all cursor-pointer text-center ${
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

                  {/* Hand Movement Configuration Checklist */}
                  {hasHandMovement && (
                    <div className={`space-y-3 pt-3 ${hasHeadMovement ? 'border-t border-slate-850' : ''}`}>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Hand Gesture Triggers Checklist
                      </label>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Configure the conditions and messages under which virtual hand wave/thumbs-up gestures are triggered.
                      </p>

                      <div className="space-y-3">
                        {/* Command hi */}
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              Command: "hi" (Hand Wave)
                            </span>
                          </div>
                          <div className="space-y-2 pt-1">
                            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                              <input
                                type="checkbox"
                                checked={handMovementHiDetect}
                                onChange={(e) => setHandMovementHiDetect(e.target.checked)}
                                className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                              />
                              <span>when person detects</span>
                            </label>
                            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                              <input
                                type="checkbox"
                                checked={handMovementHiSaysHi}
                                onChange={(e) => setHandMovementHiSaysHi(e.target.checked)}
                                className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                              />
                              <span>when person says hi</span>
                            </label>
                          </div>
                        </div>

                        {/* Command bye */}
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              Command: "bye" (Farewell Wave)
                            </span>
                          </div>
                          <div className="space-y-2 pt-1">
                            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                              <input
                                type="checkbox"
                                checked={handMovementByeChatEnds}
                                onChange={(e) => setHandMovementByeChatEnds(e.target.checked)}
                                className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                              />
                              <span>when chat ends</span>
                            </label>
                          </div>
                        </div>

                        {/* Command thumbs up */}
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              Command: "thumbs up"
                            </span>
                          </div>
                          <div className="space-y-2 pt-1">
                            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                              <input
                                type="checkbox"
                                checked={handMovementThumbsDetect}
                                onChange={(e) => setHandMovementThumbsDetect(e.target.checked)}
                                className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                              />
                              <span>when person detects</span>
                            </label>
                            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white transition-colors">
                              <input
                                type="checkbox"
                                checked={handMovementThumbsCorrect}
                                onChange={(e) => setHandMovementThumbsCorrect(e.target.checked)}
                                className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                              />
                              <span>on correct information</span>
                            </label>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Summary confirmation */}
              <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-1.5 font-mono text-[11px]">
                <h4 className="font-bold text-slate-300">Ready for compilation:</h4>
                <p className="text-slate-500">Name: <span className="text-slate-300 font-bold">{botName}</span></p>
                <p className="text-slate-500">Trigger key: <span className="text-indigo-300 font-bold">"{activationKeyword}"</span></p>
                <p className="text-slate-500">Doc database: <span className="text-slate-300">{kbPdfName || 'default_knowledge.pdf'}</span></p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="px-4 py-3 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Create & Deploy Chatbot</span>
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}
