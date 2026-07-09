/**
 * ChatbotView — session auto-connects; one tap enables microphone (browser requirement).
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicChatbotApi } from '../../api/chatbot.api';
import { resolveAssetUrl } from '../../utils/mapChatbot';
import { useGeminiLive } from '../../voice/hooks/useGeminiLive';
import ImageSlideshow from '../../voice/components/ImageSlideshow';
import LeadFormOverlay from '../../voice/components/LeadFormOverlay';
import CardScanner from '../../voice/components/CardScanner';

export default function ChatbotView() {
  const { chatbotId } = useParams();

  const [chatbot, setChatbot] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  const {
    sessionStarted,
    isActivated,
    isListening,
    isSpeaking,
    stage,
    error,
    slides,
    currentSlideIndex,
    leadForm,
    showLeadForm,
    showCamera,
    leadSaved,
    activationKey,
    activePdfName,
    needsMicTap,
    enableVoice,
    closeCamera,
  } = useGeminiLive(chatbotId);

  const showOnboarding = slides.length === 0 && !showLeadForm;

  useEffect(() => {
    if (!chatbotId) return;

    let cancelled = false;

    (async () => {
      try {
        const response = await getPublicChatbotApi(chatbotId);
        if (cancelled) return;

        const bot = response.data;
        setChatbot({
          id: bot._id,
          name: bot.name,
          onboardingImage: resolveAssetUrl(bot.onboardingImage),
        });
      } catch (err) {
        if (cancelled) return;
        setLoadError(err.message || 'Chatbot not found');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chatbotId]);

  if (loadError || !chatbot) {
    return <div className="fixed inset-0 bg-black" aria-hidden="true" />;
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none">
      {showOnboarding && (
        <img
          src={chatbot.onboardingImage}
          alt=""
          draggable={false}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-contain transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      <ImageSlideshow
        slides={slides}
        currentIndex={currentSlideIndex}
      />

      <LeadFormOverlay data={leadForm} visible={showLeadForm} />

      <CardScanner active={showCamera} onClose={closeCamera} />

      {leadSaved && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] px-5 py-2.5 rounded-xl bg-emerald-600/95 text-white text-sm shadow-lg">
          Details saved. Next person can speak now.
        </div>
      )}

      {stage === 'connecting' && (
        <div className="absolute bottom-8 left-0 right-0 z-40 text-center pointer-events-none px-4">
          <p className="text-white/70 text-sm">Connecting to voice assistant…</p>
        </div>
      )}

      {needsMicTap && sessionStarted && !isListening && (
        <button
          type="button"
          onClick={enableVoice}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl bg-white/15 border border-white/30 text-white text-base font-medium backdrop-blur-md shadow-xl hover:bg-white/25 transition-colors"
        >
          Tap to start talking
        </button>
      )}

      {isListening && !isActivated && (
        <div className="absolute top-6 left-0 right-0 z-40 text-center pointer-events-none px-4">
          <p className="text-amber-300/90 text-sm">
            Say hello, &quot;{activationKey || chatbot.name}&quot;, or &quot;{chatbot.name}&quot;
          </p>
        </div>
      )}

      {stage === 'connecting' && (
        <div className="absolute inset-0 z-20 pointer-events-none ring-[3px] ring-inset ring-slate-600/30" />
      )}
      {isListening && (
        <div className="absolute inset-0 z-20 pointer-events-none ring-[6px] ring-inset ring-rose-500/50 animate-pulse" />
      )}
      {isSpeaking && (
        <div className="absolute inset-0 z-20 pointer-events-none ring-[4px] ring-inset ring-emerald-400/35" />
      )}

      {error && (
        <div className="absolute bottom-4 left-4 right-4 z-50 text-center text-rose-400 text-sm pointer-events-none">
          {error}
        </div>
      )}
    </div>
  );
}
