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
