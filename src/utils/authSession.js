const SESSION_KEY = 'logged_in_user';

export function getStoredSession() {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));

  if (user.role === 'admin') {
    localStorage.setItem('admin_logged_in', 'true');
    localStorage.removeItem('current_user');
    return;
  }

  localStorage.removeItem('admin_logged_in');
  localStorage.setItem('current_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('admin_logged_in');
  localStorage.removeItem('current_user');
}

export function getRedirectPath(role) {
  return role === 'admin' ? '/admin/dashboard' : '/';
}

const OTP_VERIFIED_KEY = 'otp_verified_email';

export function setOtpVerifiedEmail(email) {
  localStorage.setItem(OTP_VERIFIED_KEY, email.trim().toLowerCase());
}

export function getOtpVerifiedEmail() {
  return localStorage.getItem(OTP_VERIFIED_KEY);
}

export function clearOtpVerifiedEmail() {
  localStorage.removeItem(OTP_VERIFIED_KEY);
}

