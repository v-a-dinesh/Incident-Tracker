// Use environment variable if available, otherwise use relative path for local dev
const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(url, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  const response = await fetch(`${API_BASE}${url}`, config);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || data.errors?.join(', ') || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function getIncidents(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });
  return request(`/incidents?${query.toString()}`);
}

export function getIncident(id) {
  return request(`/incidents/${id}`);
}

export function createIncident(data) {
  return request('/incidents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateIncident(id, data) {
  return request(`/incidents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
