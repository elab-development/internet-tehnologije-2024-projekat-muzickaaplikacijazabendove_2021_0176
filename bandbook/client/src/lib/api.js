const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function isFormData(body) {
  return body instanceof FormData;
}

/**
 * Generic API caller with credentials included.
 * Automatically sets JSON headers unless body is FormData.
 */
export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const opts = {
    method,
    credentials: 'include',
    headers: isFormData(body)
      ? headers
      : { 'Content-Type': 'application/json', ...headers },
    body: isFormData(body) ? body : body ? JSON.stringify(body) : undefined,
  };

  const res = await fetch(`${API_BASE}${path}`, opts);
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = data?.error || `Request failed: ${res.status}`;
    throw new Error(message);
  }
  return data;
}
