import { apiRequest } from './client';

export function createChatbotApi(formData) {
  return apiRequest('/chatbot/create', {
    method: 'POST',
    body: formData,
  });
}

export function updateChatbotApi(id, formData) {
  return apiRequest(`/chatbot/update/${id}`, {
    method: 'PUT',
    body: formData,
  });
}

export function getMyChatbotsApi() {
  return apiRequest('/chatbot/my');
}

/** Public chatbot info for shareable /chatbot/:id URL (no login) */
export function getPublicChatbotApi(id) {
  return apiRequest(`/chatbot/public/${id}`);
}

export function deleteChatbotApi(id) {
  return apiRequest(`/chatbot/delete/${id}`, {
    method: 'DELETE',
  });
}
