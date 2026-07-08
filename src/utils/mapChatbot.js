import { API_ORIGIN } from '../api/config';

export function resolveAssetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

export function mapChatbotFromApi(chatbot) {
  const pdfs = chatbot.knowledgeBasePdfs || [];

  return {
    id: chatbot._id,
    name: chatbot.name,
    onboardingImage: resolveAssetUrl(chatbot.onboardingImage),
    knowledgeBasePdf: pdfs.map((p) => p.name).join(', '),
    knowledgeBasePdfs: pdfs.map((p) => ({
      name: p.name,
      size: p.size,
      url: resolveAssetUrl(p.url),
      extractedImages: p.extractedImages || [],
    })),
    activationKey: chatbot.activationKey,
    specificInstructions: chatbot.specificInstructions,
    scanCardRequired: chatbot.scanCardRequired,
    headMovementMode: chatbot.headMovementMode,
    handMovements: chatbot.handMovements,
    createdBy: chatbot.createdBy?._id || chatbot.createdBy,
    createdAt: chatbot.createdAt
      ? new Date(chatbot.createdAt).toISOString().split('T')[0]
      : '',
    isActive: chatbot.isActive !== false,
  };
}
