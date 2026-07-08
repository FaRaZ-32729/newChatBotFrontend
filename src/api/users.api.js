import { apiRequest } from './client';

export function getAllManagersApi() {
  return apiRequest('/users/managers');
}

export function updateManagerApi(managerId, payload) {
  return apiRequest(`/users/update/${managerId}`, {
    method: 'PUT',
    body: payload,
  });
}

export function deleteManagerApi(managerId) {
  return apiRequest(`/users/delete/${managerId}`, {
    method: 'DELETE',
  });
}

export function getUsersByManagerApi(managerId) {
  return apiRequest(`/users/by/${managerId}/`);
}

// Admin manager detail page: profile + chatbots + users in one shot
export function getManagerDetailsApi(managerId) {
  return apiRequest(`/users/manager-details/${managerId}`);
}

export function deleteClientUserApi(userId) {
  return apiRequest(`/users/client/${userId}`, {
    method: 'DELETE',
  });
}
