import { apiRequest } from './client';

/**
 * Submit confirmed lead details (after card scan or voice confirmation).
 */
export async function submitLeadApi(payload) {
  return apiRequest('/leads', {
    method: 'POST',
    body: payload,
  });
}

/**
 * Fetch leads for one chatbot (authenticated).
 */
export async function getChatbotLeadsApi(chatbotId) {
  return apiRequest(`/leads/chatbot/${chatbotId}`);
}
