/**
 * ChatbotView — opens ready with mic on; End Chat during conversation.
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicChatbotApi } from '../../api/chatbot.api';
import { resolveAssetUrl } from '../../utils/mapChatbot';
import { useGeminiLive } from '../../voice/hooks/useGeminiLive';
import ImageSlideshow from '../../voice/components/ImageSlideshow';
import LeadFormOverlay from '../../voice/components/LeadFormOverlay';
import CardScanner from '../../voice/components/CardScanner';
import SpeakerAngle from '../../voice/components/SpeakerAngle';

export default function ChatbotView() {
  const { chatbotId } = useParams();

  const [chatbot, setChatbot] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  const {
    isActivated,
    canShowEndChat,
    isListening,
    isSpeaking,
    stage,
    error,
    slides,
    currentSlideIndex,
    carouselHoldMs,
    autoAdvanceSlides,
    leadForm,
    showLeadForm,
    showCamera,
    leadSaved,
    leadSubmitting,
    leadFormEditable,
    activationKey,
    endChat,
    closeCamera,
    handleCardScanned,
    openCameraForRescan,
    confirmLeadForm,
    cancelLeadForm,
  } = useGeminiLive(chatbotId);

  const showOnboarding = slides.length === 0 && !showLeadForm && !showCamera;
  const showEndChat =
    isActivated && canShowEndChat && !showCamera && !showLeadForm && !leadSaved;

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
          activationKey: bot.activationKey || '',
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
        holdMs={carouselHoldMs}
        autoAdvance={autoAdvanceSlides}
      />

      <LeadFormOverlay
        data={leadForm}
        visible={showLeadForm}
        editable={leadFormEditable}
        submitting={leadSubmitting}
        onConfirm={confirmLeadForm}
        onRescan={leadFormEditable ? openCameraForRescan : undefined}
        onCancel={leadFormEditable ? cancelLeadForm : undefined}
      />

      <CardScanner
        active={showCamera}
        onClose={closeCamera}
        onScanned={handleCardScanned}
      />

      {/* Active conversation → track speaking face angle → MQTT */}
      <SpeakerAngle isActive={isActivated && !showCamera} />

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

      {showEndChat && (
        <button
          type="button"
          onClick={endChat}
          className="absolute top-5 right-5 z-50 px-5 py-2.5 rounded-xl bg-rose-600/90 border border-rose-400/40 text-white text-sm font-medium backdrop-blur-md shadow-xl hover:bg-rose-500 transition-colors"
        >
          End Chat
        </button>
      )}

      {isListening && !isActivated && !showCamera && (
        <div className="absolute top-6 left-0 right-0 z-40 text-center pointer-events-none px-4">
          <p className="text-amber-300/90 text-sm">
            Say &quot;{(activationKey || chatbot.activationKey || '').trim() || 'your activation phrase'}&quot; to start
          </p>
        </div>
      )}

      {stage === 'connecting' && (
        <div className="absolute inset-0 z-20 pointer-events-none ring-[3px] ring-inset ring-slate-600/30" />
      )}
      {isListening && !showCamera && !showLeadForm && (
        <div className="absolute inset-0 z-20 pointer-events-none ring-[6px] ring-inset ring-rose-500/50 animate-pulse" />
      )}
      {isSpeaking && !showCamera && !showLeadForm && (
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
