import { API_BASE_URL } from './config';
import { ApiError } from './client';

/**
 * Upload visiting-card image to Mindee OCR via backend.
 * @param {Blob|File} imageBlob
 */
export async function scanVisitingCardApi(imageBlob) {
  const form = new FormData();
  form.append('image', imageBlob, 'card.jpg');

  const response = await fetch(`${API_BASE_URL}/card-scan`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(data?.message || 'Card scan failed', response.status);
  }

  if (!data?.success) {
    throw new ApiError(data?.message || 'Card scan failed', response.status || 500);
  }

  return data.data;
}
