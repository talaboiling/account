// Thin fetch wrapper for the backend API. All paths are relative — in
// development CRA's "proxy" setting forwards /api to the backend, and in
// production the backend itself serves the built frontend, so both cases
// resolve against the current origin with no CORS involved.
const TOKEN_KEY = 'accountproject.token';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* localStorage unavailable (private mode, etc.) — session just won't persist */ }
}

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload = body;
  if (body !== undefined && !isForm) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const res = await fetch(`/api${path}`, { method, headers, body: payload });
  let data = null;
  try { data = await res.json(); } catch { /* no/invalid JSON body */ }

  if (!res.ok) throw new Error(data?.error || `Ошибка запроса (${res.status})`);
  return data;
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: data => request('/auth/register', { method: 'POST', body: data }),
  verifyEmail: (email, code) => request('/auth/verify-email', { method: 'POST', body: { email, code } }),
  me: () => request('/auth/me'),

  getPrograms: () => request('/programs'),
  getUsers: () => request('/users'),
  createUser: data => request('/users', { method: 'POST', body: data }),

  getApplications: () => request('/applications'),
  submitApplication: (programId, formData) => request('/applications', { method: 'POST', body: { programId, formData } }),
  acceptApplication: (id, note) => request(`/applications/${id}/accept`, { method: 'POST', body: { note } }),
  rejectApplication: (id, note) => request(`/applications/${id}/reject`, { method: 'POST', body: { note } }),
  attachDraftContract: (id, filename) => request(`/applications/${id}/draft-contract`, { method: 'POST', body: { filename } }),
  uploadSignedContract: (id, filename) => request(`/applications/${id}/signed-contract`, { method: 'POST', body: { filename } }),
  confirmSamplesReceived: id => request(`/applications/${id}/samples-received`, { method: 'POST', body: {} }),
  uploadProtocol: (id, filename) => request(`/applications/${id}/protocol`, { method: 'POST', body: { filename } }),
  setProcessingStatus: (id, note) => request(`/applications/${id}/processing`, { method: 'POST', body: { note } }),
  uploadFinalDocuments: (id, docs) => request(`/applications/${id}/final-documents`, { method: 'POST', body: docs }),

  getTours: () => request('/tours'),
  startTour: (id, managerId, taskNote) => request(`/tours/${id}/start`, { method: 'POST', body: { managerId, taskNote } }),
  updateTourWorkStatus: (id, workStatus, note) => request(`/tours/${id}/work-status`, { method: 'POST', body: { workStatus, note } }),
  notifyTourSamplesSent: (id, note) => request(`/tours/${id}/samples-sent`, { method: 'POST', body: { note } }),

  getNotifications: () => request('/notifications'),
  getAllNotifications: () => request('/notifications/all'),
  markNotificationRead: id => request(`/notifications/${id}/read`, { method: 'POST', body: {} }),
  markAllRead: () => request('/notifications/read-all', { method: 'POST', body: {} }),

  uploadFile: file => {
    const form = new FormData();
    form.append('file', file);
    return request('/uploads', { method: 'POST', body: form, isForm: true });
  },
};
