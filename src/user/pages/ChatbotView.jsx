import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Bot, ArrowLeft, Send, Sparkles, FileText, Key, Shield,
  Settings, Zap, AlertCircle, RefreshCw, X, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../context/UserContext';

export default function ChatbotView() {
  const { chatbotId } = useParams();
  const navigate = useNavigate();
  const { chatbots } = useUser();

  // Find target chatbot
  const chatbot = chatbots?.find(c => c.id === chatbotId);

  const [activeScreen, setActiveScreen] = useState('onboarding'); // 'onboarding' | 'chat'
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Gesture animation overlay state
  const [activeGesture, setActiveGesture] = useState(null); // null | { type: string, reason: string }

  // Card scan states
  const [showCardScanner, setShowCardScanner] = useState(false);
  const [isCardScanned, setIsCardScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('idle'); // 'idle' | 'scanning' | 'success' | 'error'

  const messagesEndRef = useRef(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!chatbot) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center max-w-md w-full shadow-2xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-extrabold text-white mb-2">Chatbot Not Found</h2>
          <p className="text-xs text-slate-400 mb-6">
            The chatbot you are looking for does not exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to User Hub</span>
          </button>
        </div>
      </div>
    );
  }

  // Prepopulate welcome message
  const startChat = () => {
    if (chatbot.scanCardRequired && !isCardScanned) {
      setShowCardScanner(true);
      setScanStatus('idle');
      return;
    }
    setActiveScreen('chat');
    if (messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([
          {
            id: 'welcome',
            sender: 'bot',
            text: `System Synced! Hello, I am **${chatbot.name}**. I have been fully initialized with your knowledge base document **"${chatbot.knowledgeBasePdf || 'No PDF'}"**.\n\n${chatbot.specificInstructions ? `My operating instructions: *"${chatbot.specificInstructions}"*\n\n` : ''}You can chat with me freely! My gesture activation key is **"${chatbot.activationKey || 'None'}"** — type it to trigger my mechanical movement protocol!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsgText = inputMessage.trim();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: userMsgText,
      timestamp
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate response delay
    setTimeout(() => {
      let botResponseText = '';
      const lowerUserMsg = userMsgText.toLowerCase();
      const actKey = (chatbot.activationKey || '').toLowerCase().trim();

      // Check triggers
      const triggerDetected = actKey && lowerUserMsg.includes(actKey);
      const userSaidHi = lowerUserMsg.includes('hi') || lowerUserMsg.includes('hello') || lowerUserMsg.includes('hey');
      const userSaidBye = lowerUserMsg.includes('bye') || lowerUserMsg.includes('goodbye') || lowerUserMsg.includes('exit');

      let gestureTriggered = null;
      let gestureReason = '';

      if (triggerDetected) {
        // Standard activation key fallback
        const supportsHand = !!chatbot.handMovements;
        const supportsHead = !!chatbot.headMovementMode;
        gestureTriggered = supportsHand ? 'hand_hi' : (supportsHead ? 'head' : null);
        gestureReason = `Activation keyword detected: "${chatbot.activationKey}"`;
      } else if (userSaidHi && chatbot.handMovements?.hi?.saysHi) {
        gestureTriggered = 'hand_hi';
        gestureReason = `Person greeted with "hi" (config-driven)`;
      } else if (userSaidBye && chatbot.handMovements?.bye?.chatEnds) {
        gestureTriggered = 'hand_bye';
        gestureReason = `Chat ends / Farewell detected (config-driven)`;
      }

      if (gestureTriggered) {
        setActiveGesture({ type: gestureTriggered, reason: gestureReason });
        // Auto dismiss after 3.5 seconds
        setTimeout(() => {
          setActiveGesture(null);
        }, 3500);

        botResponseText = `🤖 **[SYSTEM GESTURE ACTIVATED: ${gestureTriggered.toUpperCase()}]**\n\n*Currently executing mechanical joint alignment.* As configured by my creator, I am performing the physical animation sequence!\n\n**Reason:** ${gestureReason}`;
        if (chatbot.specificInstructions) {
          botResponseText += `\n\n*Specific Instructions:* "${chatbot.specificInstructions}"`;
        }
      } else {
        // Check if head movement trigger is by talking
        const isHeadTalking = chatbot.headMovementMode === 'talking' || chatbot.headMovementMode === 'both';
        if (isHeadTalking) {
          // Trigger subtle head nod overlay when responding to normal messages
          setActiveGesture({ type: 'head', reason: 'Articulation triggered by talking mode (config-driven)' });
          setTimeout(() => {
            setActiveGesture(null);
          }, 3000);
        }

        // Standard conversational responses
        const responseTemplates = [
          `Regarding your question, I searched the indexes of my loaded training core **"${chatbot.knowledgeBasePdf}"** and applied your custom guidelines. How can I assist further?`,
          `According to the directives specified in my knowledge parameters, we are in full diagnostic mode. You can trigger my gestures using keyword **"${chatbot.activationKey}"**!`,
          `Interesting query. As **${chatbot.name}**, I assist you using the loaded knowledge resources. Can you give me more details about your configuration?`,
          `I am analyzing your request. Let me know if you want me to compile a structured summary from **"${chatbot.knowledgeBasePdf}"**.`
        ];

        if (chatbot.specificInstructions) {
          responseTemplates.push(`Under my override directives (*"${chatbot.specificInstructions}"*), I have noted your input. Let's make sure our system is perfectly optimized according to these instructions.`);
        }

        botResponseText = responseTemplates[Math.floor(Math.random() * responseTemplates.length)];
      }

      setMessages(prev => [...prev, {
        id: `msg_resp_${Date.now()}`,
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div id="immersive-chatbot-shell" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">

      {/* Visual background decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Screen 1: Sci-Fi Onboarding Splash Screen */}
      <AnimatePresence mode="wait">
        {activeScreen === 'onboarding' && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 z-10"
          >
            <div className="max-w-2xl w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col items-center">
              {/* Corner tech borders */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-indigo-500/40 rounded-tl-3xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-indigo-500/40 rounded-tr-3xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-indigo-500/40 rounded-bl-3xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-indigo-500/40 rounded-br-3xl" />

              <button
                onClick={() => navigate('/')}
                className="absolute top-4 left-4 p-2 bg-slate-950 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white border border-slate-800/80 transition-all flex items-center gap-1.5 text-xs cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit Hub</span>
              </button>

              {/* Glowing Onboarding Avatar */}
              <div className="relative mt-4 mb-6">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full blur-md opacity-70 animate-pulse" />
                <img
                  src={chatbot.onboardingImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'}
                  alt={chatbot.name}
                  referrerPolicy="no-referrer"
                  className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-slate-900 shadow-2xl"
                />
                <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-slate-900 shadow-md flex items-center justify-center">
                  <Zap className="w-4 h-4 fill-emerald-100 text-emerald-950 animate-bounce" />
                </div>
              </div>

              {/* Bot Info Headings */}
              <div className="text-center space-y-2 max-w-md">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold tracking-widest uppercase rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  Bot Core Online
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {chatbot.name}
                </h1>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Custom AI Assistant compiled and registered successfully. This terminal provides a full-width viewport control channel.
                </p>
              </div>

              {/* Chatbot Config Spec Sheet */}
              <div className="w-full mt-8 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    Knowledge Core
                  </span>
                  <span className="text-slate-200 text-right truncate max-w-[200px]" title={chatbot.knowledgeBasePdf}>
                    {chatbot.knowledgeBasePdf || 'None'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-400" />
                    Activation Trigger
                  </span>
                  <span className="text-indigo-300 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                    "{chatbot.activationKey}"
                  </span>
                </div>
                <div className="flex justify-between items-start border-b border-slate-900 pb-2.5">
                  <span className="text-slate-500 flex items-center gap-1.5 pt-0.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    Gesture Privilege
                  </span>
                  <span className="text-slate-200 text-right">
                    {chatbot.headMovementMode && chatbot.handMovements ? 'Both Movements Active' : chatbot.handMovements ? 'Hand Movement Active' : chatbot.headMovementMode ? 'Head Movement Active' : 'No Movement Active'}
                  </span>
                </div>
                {chatbot.scanCardRequired && (
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-rose-400" />
                      Card Lock Status
                    </span>
                    <span className={isCardScanned ? "text-emerald-400 font-bold flex items-center gap-1.5" : "text-amber-400 font-bold flex items-center gap-1.5"}>
                      <span className={`w-2 h-2 rounded-full ${isCardScanned ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                      {isCardScanned ? 'Access Granted' : 'Scan Card Required'}
                    </span>
                  </div>
                )}
                {chatbot.specificInstructions && (
                  <div className="pt-1.5">
                    <span className="text-slate-500 flex items-center gap-1.5 mb-1">
                      <Settings className="w-3.5 h-3.5 text-indigo-400" />
                      Override Directives
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-h-[80px] overflow-y-auto italic">
                      "{chatbot.specificInstructions}"
                    </p>
                  </div>
                )}
              </div>

              {/* Start Session Button */}
              <button
                onClick={startChat}
                className="w-full mt-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Sparkles className="w-4 h-4 text-indigo-200 animate-spin" />
                <span>Synchronize & Launch Assistant</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Screen 2: High-Fidelity Fullscreen Chat Workspace */}
        {activeScreen === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex h-screen w-full relative z-10 overflow-hidden"
          >
            {/* Gesture Animation Fullscreen Overlay */}
            <AnimatePresence>
              {activeGesture && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: 20 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="max-w-md w-full bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-8 shadow-2xl shadow-indigo-500/25 flex flex-col items-center"
                  >
                    {/* Glowing outer rings */}
                    <div className="relative mb-6">
                      <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
                      <div className="w-24 h-24 rounded-full bg-indigo-950/60 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 relative">
                        <Bot className="w-12 h-12" />

                        {/* CSS animated circles */}
                        <div className="absolute inset-0 border-2 border-indigo-400 rounded-full animate-ping opacity-30" />
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold tracking-widest uppercase rounded-full mb-3">
                      Virtual Joint Articulation Active
                    </span>

                    {/* Trigger reason description if present */}
                    {activeGesture.reason && (
                      <p className="text-[10px] text-slate-500 font-mono mb-2 uppercase tracking-wider">
                        Triggered: {activeGesture.reason}
                      </p>
                    )}

                    <h3 className="text-xl font-black text-white tracking-tight">
                      {activeGesture.type === 'head' && 'Head Nod Articulation'}
                      {activeGesture.type === 'hand_hi' && 'Hand Wave Waveform ("hi")'}
                      {activeGesture.type === 'hand_bye' && 'Farewell Wave ("bye")'}
                      {activeGesture.type === 'hand_thumbsUp' && 'Thumbs Up Gesture'}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed mt-2 max-w-sm">
                      {activeGesture.type === 'head' && 'Simulating mechanical neck articulation. Pitch and yaw values are rotating dynamically to affirm incoming request.'}
                      {activeGesture.type === 'hand_hi' && 'Simulating physical multi-joint hand wave greeting sequence currently running at 100% frequency.'}
                      {activeGesture.type === 'hand_bye' && 'Simulating farewell waving protocol. Executing slow oscillation loop on the main wrist motor.'}
                      {activeGesture.type === 'hand_thumbsUp' && 'Forming standard positive reinforcement hand gesture to validate request correctness.'}
                    </p>

                    {/* Animated Joint Indicator (Wireframe Mockup) */}
                    <div className="w-full h-28 mt-6 bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />

                      {activeGesture.type === 'head' ? (
                        /* Nodding Head Graphic Animation */
                        <div className="flex flex-col items-center">
                          <motion.div
                            animate={{ y: [0, -8, 4, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                            className="w-10 h-10 bg-indigo-500/10 border-2 border-indigo-400 rounded-2xl flex items-center justify-center text-indigo-400 shadow-md"
                          >
                            <span className="text-[10px] font-bold">NOD</span>
                          </motion.div>
                          <div className="w-12 h-1 bg-indigo-950 mt-1 border border-indigo-800 rounded-full" />
                        </div>
                      ) : activeGesture.type === 'hand_thumbsUp' ? (
                        /* Thumbs Up Graphic Animation */
                        <div className="flex gap-1 items-end h-12">
                          <motion.div
                            animate={{ scale: [1, 1.15, 0.95, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="origin-bottom"
                          >
                            <svg className="w-12 h-12 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                          </motion.div>
                        </div>
                      ) : (
                        /* Waving Hand Graphic Animation (both hi and bye) */
                        <div className="flex gap-1 items-end h-12">
                          <motion.div
                            animate={{ rotate: [0, 20, -20, 20, 0] }}
                            transition={{ repeat: Infinity, duration: activeGesture.type === 'hand_bye' ? 2.0 : 1.2 }}
                            className="origin-bottom"
                          >
                            <svg className="w-10 h-10 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5" />
                              <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6" />
                              <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                              <path d="M6 14V11a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6c0 4.4 3.6 8 8 8h3c2.2 0 4-1.8 4-4v-4" />
                            </svg>
                          </motion.div>
                        </div>
                      )}

                      {/* Sparkly dynamic labels */}
                      <span className="absolute bottom-1 right-2 text-[8px] font-mono text-emerald-400 tracking-widest uppercase">
                        Active ● 60FPS
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveGesture(null)}
                      className="mt-6 px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-[10px] font-bold text-slate-400 hover:text-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Skip Articulation</span>
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* A. Collapsable Specs Sidebar (Desktop) */}
            <aside className="hidden md:flex w-72 bg-slate-900 border-r border-slate-800 flex-col shrink-0">
              <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                <img
                  src={chatbot.onboardingImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'}
                  alt={chatbot.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-indigo-500/30"
                />
                <div className="overflow-hidden">
                  <h3 className="text-sm font-bold text-white truncate">{chatbot.name}</h3>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Core Online
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 space-y-6 overflow-y-auto">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Configuration</span>

                  {/* Knowledge base doc */}
                  <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="overflow-hidden">
                      <span className="text-[11px] font-bold text-slate-300 block truncate" title={chatbot.knowledgeBasePdf}>
                        {chatbot.knowledgeBasePdf || 'No PDF'}
                      </span>
                      <span className="text-[9px] text-slate-500 block font-mono">Training Core PDF</span>
                    </div>
                  </div>

                  {/* Activation keyword */}
                  <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-start gap-2.5">
                    <Key className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-bold text-indigo-300 block bg-indigo-500/10 px-1.5 py-0.5 rounded-md border border-indigo-500/10 w-fit">
                        "{chatbot.activationKey}"
                      </span>
                      <span className="text-[9px] text-slate-500 block font-mono mt-1">Activation Trigger Word</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mechanical Specs</span>
                  <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Access level</span>
                      <span className="text-white font-bold font-mono">
                        {chatbot.headMovementMode && chatbot.handMovements ? 'Both Mov.' : chatbot.handMovements ? 'Hand Mov.' : chatbot.headMovementMode ? 'Head Mov.' : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Status</span>
                      <span className="text-emerald-400 font-bold font-mono">Calibrated</span>
                    </div>
                  </div>
                </div>

                {chatbot.specificInstructions && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Behavior Rules</span>
                    <div className="p-3 bg-slate-950/50 border border-slate-800/60 rounded-xl italic text-[11px] text-slate-400 leading-relaxed max-h-[140px] overflow-y-auto">
                      "{chatbot.specificInstructions}"
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950 text-center text-[10px] text-slate-600 font-mono">
                Session ID: {chatbot.id.substring(0, 10)}
              </div>
            </aside>

            {/* B. Main Chat Pane */}
            <section className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">

              {/* Top Header */}
              <header className="h-16 border-b border-slate-800 px-6 bg-slate-900/60 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveScreen('onboarding')}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer md:hidden"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="md:hidden">
                    <img
                      src={chatbot.onboardingImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'}
                      alt={chatbot.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white leading-none flex items-center gap-2">
                      {chatbot.name}
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse hidden md:inline-block" />
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono hidden md:block">
                      System training core active: {chatbot.knowledgeBasePdf}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono md:hidden">
                      Trigger: "{chatbot.activationKey}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Proximity Simulator Button */}
                  <button
                    onClick={() => {
                      const headDetects = chatbot.headMovementMode === 'detecting' || chatbot.headMovementMode === 'both';
                      const handHiDetects = chatbot.handMovements?.hi?.detects === true;
                      const handThumbsDetects = chatbot.handMovements?.thumbsUp?.detects === true;

                      let matchedType = null;
                      let matchedReason = '';

                      if (headDetects && handHiDetects) {
                        matchedType = 'hand_hi';
                        matchedReason = 'Person detected (Motors: Head & Hand Wave active)';
                      } else if (handHiDetects) {
                        matchedType = 'hand_hi';
                        matchedReason = 'Person detected (Motors: Hand Wave active)';
                      } else if (handThumbsDetects) {
                        matchedType = 'hand_thumbsUp';
                        matchedReason = 'Person detected (Motors: Thumbs Up active)';
                      } else if (headDetects) {
                        matchedType = 'head';
                        matchedReason = 'Person detected (Motors: Head Neck active)';
                      }

                      if (matchedType) {
                        setActiveGesture({ type: matchedType, reason: matchedReason });
                        setTimeout(() => {
                          setActiveGesture(null);
                        }, 3500);

                        setMessages(prev => [...prev, {
                          id: `system_detect_${Date.now()}`,
                          sender: 'bot',
                          text: `📡 **[PROXIMITY SYSTEM ALERT: PERSON DETECTED]**\n\nProximity sensors have detected a person in front of the terminal! Triggering configured physical behaviors:\n\n- **Head Neck Articulation:** ${headDetects ? 'ENABLED (Motors active)' : 'DISABLED'}\n- **Hand Wave Greetings ("hi"):** ${handHiDetects ? 'ENABLED (Motors active)' : 'DISABLED'}\n- **Hand Thumbs Up Gesture:** ${handThumbsDetects ? 'ENABLED (Motors active)' : 'DISABLED'}\n\n*Running joints calibration sequence now.*`,
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }]);
                      } else {
                        setMessages(prev => [...prev, {
                          id: `system_detect_none_${Date.now()}`,
                          sender: 'bot',
                          text: `📡 **[PROXIMITY SYSTEM NOTICE]**\n\nSensors detected a person, but this chatbot has **no head or hand gestures** mapped to "when person detects" in its Movement Protocol. Update chatbot configurations in Step 3 of the builder.`,
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }]);
                      }
                    }}
                    className="px-3.5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold text-indigo-300 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                    title="Simulate hardware proximity sensor triggered"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="hidden md:inline">Simulate Person Detected</span>
                    <span className="md:hidden">Simulate Detect</span>
                  </button>

                  <button
                    onClick={() => {
                      const byeEnabled = chatbot.handMovements?.bye?.chatEnds === true;
                      if (byeEnabled) {
                        setActiveGesture({ type: 'hand_bye', reason: 'Session closing (Farewell waving)' });
                        setTimeout(() => {
                          setActiveGesture(null);
                          navigate('/');
                        }, 3500);
                      } else {
                        navigate('/');
                      }
                    }}
                    className="px-3.5 py-2 bg-slate-950 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-500/30 text-xs font-bold text-slate-300 hover:text-rose-400 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4 text-rose-500" />
                    <span className="hidden sm:inline">Close Session</span>
                  </button>
                </div>
              </header>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">

                {/* Embedded system header */}
                <div className="mx-auto max-w-md text-center py-4 px-3 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200">Session Securely Enrolled</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                    Communication is sandboxed. Key triggers will trigger simulated physical gestures immediately on-screen.
                  </p>
                </div>

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                  >
                    {/* Bot Avatar */}
                    {msg.sender === 'bot' && (
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-800 shrink-0">
                        <img
                          src={chatbot.onboardingImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'}
                          alt={chatbot.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3.5 text-xs leading-relaxed ${msg.sender === 'user'
                          ? 'bg-gradient-to-tr from-indigo-600/90 to-indigo-700/90 text-white rounded-tr-none border border-indigo-500/20'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                        }`}
                    >
                      <p>{msg.text}</p>
                      {msg.sender === 'bot' && !msg.id.startsWith('system_') && msg.id !== 'welcome' && (
                        <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-950 text-[10px] text-slate-500">
                          <span>Was this accurate?</span>
                          <button
                            onClick={() => {
                              const thumbsEnabled = chatbot.handMovements?.thumbsUp?.correctInfo === true;
                              if (thumbsEnabled) {
                                setActiveGesture({ type: 'hand_thumbsUp', reason: 'Correct information feedback clicked!' });
                                setTimeout(() => {
                                  setActiveGesture(null);
                                }, 3500);

                                setMessages(prev => [...prev, {
                                  id: `system_thumbs_${Date.now()}`,
                                  sender: 'bot',
                                  text: `👍 **[CORRECT INFO FEEDBACK TRIGGERED]**\n\nRecognized positive user validation. Activating virtual **Thumbs Up** gesture servos as configured!`,
                                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                }]);
                              } else {
                                setMessages(prev => [...prev, {
                                  id: `system_thumbs_none_${Date.now()}`,
                                  sender: 'bot',
                                  text: `🤖 **[SYSTEM GESTURE BLOCKED]**\n\nYour click was received! However, this chatbot has not mapped **Thumbs Up** commands to "on correct information". Enable this checkbox in Step 3 of the creator wizard to see this animation.`,
                                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                }]);
                              }
                            }}
                            className="flex items-center gap-1.5 px-2 py-1 bg-slate-950 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 rounded border border-slate-850 hover:border-slate-800 transition-colors cursor-pointer"
                            title="Mark as correct information"
                          >
                            <span>Mark Correct</span>
                            <span className="text-xs">👍</span>
                          </button>
                        </div>
                      )}
                      <span className="block text-[9px] text-slate-500 font-mono mt-1 text-right">
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* User Avatar Initials */}
                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700">
                        ME
                      </div>
                    )}
                  </div>
                ))}

                {/* Animated typing indicator */}
                {isTyping && (
                  <div className="flex items-start gap-3.5 justify-start">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-800 shrink-0">
                      <img
                        src={chatbot.onboardingImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'}
                        alt={chatbot.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3.5 text-xs text-slate-400 flex items-center gap-1.5">
                      <span>Analyzing instruction vector</span>
                      <span className="flex gap-1 items-center mt-1">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Control Box */}
              <footer className="p-4 bg-slate-900/30 border-t border-slate-850 shrink-0 z-20">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
                  <input
                    type="text"
                    disabled={isTyping}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Type a message... (try typing "${chatbot.activationKey}" to articulate gesture!)`}
                    className="flex-1 px-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs text-white placeholder-slate-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isTyping || !inputMessage.trim()}
                    className="px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
                <p className="text-center text-[10px] text-slate-500 font-mono mt-2.5">
                  Powered by custom chatbot parameters. Built on BotApp.
                </p>
              </footer>

            </section>

          </motion.div>
        )}
      </AnimatePresence>

      {/* NFC/RFID Card Scanning Simulator Overlay Modal */}
      <AnimatePresence>
        {showCardScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.93, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 15 }}
              className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center space-y-6"
            >
              {/* Sci-Fi scanner grids */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-indigo-500 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-indigo-500 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-indigo-500 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-indigo-500 rounded-br-2xl" />

              <div className="space-y-1.5">
                <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-mono font-bold tracking-wider uppercase rounded">
                  Security Protocol Active
                </span>
                <h3 className="text-lg font-black text-white">NFC/RFID Card Access Required</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm mx-auto">
                  To open a secure channel with **{chatbot.name}**, please scan your authentication card.
                </p>
              </div>

              {/* Holographic Interactive Card Reader Area */}
              <div className="relative py-8 flex flex-col items-center justify-center bg-slate-950/60 border border-slate-850 rounded-2xl overflow-hidden">
                {/* Background scanning lasers */}
                {scanStatus === 'scanning' && (
                  <div className="absolute inset-x-0 h-0.5 bg-indigo-500 opacity-80 shadow-md shadow-indigo-500 top-0 animate-pulse" style={{
                    animation: 'scanLine 1.5s ease-in-out infinite'
                  }} />
                )}

                <style>{`
                  @keyframes scanLine {
                    0% { top: 0%; opacity: 0.2; }
                    50% { top: 100%; opacity: 1; }
                    100% { top: 0%; opacity: 0.2; }
                  }
                `}</style>

                {/* Simulated Access Card Badge */}
                <motion.div
                  animate={scanStatus === 'scanning' ? {
                    y: [0, -10, 0],
                    rotateX: [0, 15, 0],
                    scale: [1, 1.05, 1]
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className={`w-52 h-32 rounded-xl border p-3.5 flex flex-col justify-between text-left shadow-xl transition-all ${scanStatus === 'success'
                      ? 'bg-emerald-950/20 border-emerald-500/50 shadow-emerald-950/10'
                      : scanStatus === 'scanning'
                        ? 'bg-indigo-950/40 border-indigo-500/60 shadow-indigo-500/10'
                        : 'bg-slate-900 border-slate-700/80 shadow-black/40'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-300 font-mono tracking-wider">SECURE ACCESS</h4>
                      <span className="text-[8px] text-slate-500 font-mono">UID: F7B8-90A1-4CDE</span>
                    </div>
                    <div className="w-7 h-7 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Shield className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Card Smart-Chip */}
                  <div className="w-7 h-5 bg-amber-500/30 border border-amber-500/40 rounded-sm self-start my-1.5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-amber-400/10" />
                    <div className="h-full w-[1px] bg-amber-500/20 mx-auto" />
                  </div>

                  <div className="flex justify-between items-end font-mono">
                    <div>
                      <p className="text-[9px] text-white font-bold">Authorized User</p>
                      <span className="text-[7px] text-slate-500">LEVEL 4 SECURITY</span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-800/80 flex items-center justify-center text-[10px] text-slate-400">
                      ⚡
                    </div>
                  </div>
                </motion.div>

                {/* Radar scanner feedback text */}
                <div className="mt-5 space-y-1">
                  {scanStatus === 'idle' && (
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 justify-center">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                      Ready to Scan
                    </p>
                  )}
                  {scanStatus === 'scanning' && (
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1.5 justify-center">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                      Decrypting Transponder RFID...
                    </p>
                  )}
                  {scanStatus === 'success' && (
                    <p className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5 justify-center">
                      <span>✓ Authorization Verified</span>
                    </p>
                  )}
                </div>
              </div>

              {/* User interaction CTA */}
              <div className="space-y-3">
                {scanStatus === 'idle' && (
                  <button
                    type="button"
                    onClick={() => {
                      setScanStatus('scanning');
                      // Wait 2 seconds then succeed
                      setTimeout(() => {
                        setScanStatus('success');
                        setTimeout(() => {
                          setIsCardScanned(true);
                          setShowCardScanner(false);
                          // Proceed directly to chat screen
                          setActiveScreen('chat');
                          if (messages.length === 0) {
                            setIsTyping(true);
                            setTimeout(() => {
                              setMessages([
                                {
                                  id: 'welcome',
                                  sender: 'bot',
                                  text: `System Synced! Hello, I am **${chatbot.name}**. I have been fully initialized with your knowledge base document **"${chatbot.knowledgeBasePdf || 'No PDF'}"**.\n\n${chatbot.specificInstructions ? `My operating instructions: *"${chatbot.specificInstructions}"*\n\n` : ''}You can chat with me freely! My gesture activation key is **"${chatbot.activationKey || 'None'}"** — type it to trigger my mechanical movement protocol!`,
                                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                }
                              ]);
                              setIsTyping(false);
                            }, 1000);
                          }
                        }, 1200);
                      }, 2000);
                    }}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Shield className="w-4 h-4 text-indigo-200 animate-pulse" />
                    <span>TAP CARD TO SCAN (SIMULATOR)</span>
                  </button>
                )}

                {scanStatus === 'scanning' && (
                  <button
                    type="button"
                    disabled
                    className="w-full py-3.5 bg-indigo-950/40 border border-indigo-500/30 text-indigo-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                    <span>READING SECURE ID PROXIMITY...</span>
                  </button>
                )}

                {scanStatus === 'success' && (
                  <button
                    type="button"
                    disabled
                    className="w-full py-3.5 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <span>ACCESS GRANTED • SYNCHRONIZING</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowCardScanner(false)}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancel & Go Back
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
