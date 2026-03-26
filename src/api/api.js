// API service for Next.js API routes
// All API calls go to /api/* routes in the same Next.js app

import { dummyMembers } from '../data/dummyData';

const API_BASE_URL = typeof window !== 'undefined' ? '' : 'http://localhost:3000';
const TOKEN_STORAGE_KEY = 'it_token';

// Set to true when falling back to dummy data (for UI banner)
export let usingDemoData = false;

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const error = await response.json().catch(() => ({}));
      const msg = error.message || 'Unauthorized';
      const e = new Error(msg);
      e.code = response.status;
      if (typeof window !== 'undefined') {
        const path = window.location?.pathname || '/';
        const isAuthPage = path === '/' || path === '/register';
        if (!isAuthPage) {
          window.location.assign(`/?next=${encodeURIComponent(path)}`);
        }
      }
      throw e;
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

function getAuthHeaders() {
  if (typeof window === 'undefined') return {};
  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function authFetch(url, options = {}) {
  const headers = {
    ...(options.headers || {}),
    ...getAuthHeaders(),
  };
  return fetch(url, { ...options, headers });
}

export const api = {
  isDemoMode: () => usingDemoData,

  // Member endpoints - falls back to dummy data on API error
  getMembers: async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/members`);
      const data = await handleResponse(response);
      usingDemoData = false;
      return data;
    } catch (error) {
      if (error?.code === 401 || error?.code === 403) {
        throw error;
      }
      console.warn('API unavailable, using demo data:', error.message);
      usingDemoData = true;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('apiDemoMode'));
      }
      return [...dummyMembers];
    }
  },

  createMember: async (member) => {
    const response = await authFetch(`${API_BASE_URL}/api/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    return handleResponse(response);
  },

  updateMember: async (uniqueId, updates) => {
    const response = await authFetch(`${API_BASE_URL}/api/members/${uniqueId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  deleteMember: async (uniqueId) => {
    const response = await authFetch(`${API_BASE_URL}/api/members/${uniqueId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // Payment endpoints
  getPayments: async () => {
    const response = await authFetch(`${API_BASE_URL}/api/payments`);
    return handleResponse(response);
  },

  createPayment: async (payment) => {
    const response = await authFetch(`${API_BASE_URL}/api/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment),
    });
    return handleResponse(response);
  },

  getMemberPayments: async (uniqueId) => {
    const response = await authFetch(`${API_BASE_URL}/api/payments/${uniqueId}`);
    return handleResponse(response);
  },
};
