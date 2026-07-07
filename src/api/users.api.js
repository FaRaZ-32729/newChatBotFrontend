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
