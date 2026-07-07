import { apiRequest } from './client';

export function loginApi(email, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function logoutApi() {
  return apiRequest('/auth/logout', {
    method: 'POST',
  });
}

export function createUserApi({ name, email, access }) {
  return apiRequest('/auth/create', {
    method: 'POST',
    body: { name, email, access: access ?? null },
  });
}

export function verifyOtpApi(email, otp) {
  return apiRequest('/auth/verify-otp', {
    method: 'POST',
    body: { email, otp },
  });
}

export function setPasswordApi(email, password) {
  return apiRequest('/auth/set-password', {
    method: 'POST',
    body: { email, password },
  });
}

export function regenerateOtpApi(email) {
  return apiRequest('/auth/regenerate-otp', {
    method: 'POST',
    body: { email },
  });
}

export function forgotPasswordApi(email) {
  return apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: { email },
  });
}
