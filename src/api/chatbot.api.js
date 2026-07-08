import { apiRequest } from './client';

export function createChatbotApi(formData) {
  return apiRequest('/chatbot/create', {
    method: 'POST',
    body: formData,
  });
}

export function getMyChatbotsApi() {
  return apiRequest('/chatbot/my');
}

export function deleteChatbotApi(id) {
  return apiRequest(`/chatbot/delete/${id}`, {
    method: 'DELETE',
  });
}
