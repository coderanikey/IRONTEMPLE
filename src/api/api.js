// API service for Next.js API routes
// All API calls go to /api/* routes in the same Next.js app

const API_BASE_URL = typeof window !== 'undefined' ? '' : 'http://localhost:3000';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

export const api = {
  // Member endpoints
  getMembers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/members`);
    return handleResponse(response);
  },

  createMember: async (member) => {
    const response = await fetch(`${API_BASE_URL}/api/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    return handleResponse(response);
  },

  updateMember: async (uniqueId, updates) => {
    const response = await fetch(`${API_BASE_URL}/api/members/${uniqueId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  deleteMember: async (uniqueId) => {
    const response = await fetch(`${API_BASE_URL}/api/members/${uniqueId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // Payment endpoints
  getPayments: async () => {
    const response = await fetch(`${API_BASE_URL}/api/payments`);
    return handleResponse(response);
  },

  createPayment: async (payment) => {
    const response = await fetch(`${API_BASE_URL}/api/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment),
    });
    return handleResponse(response);
  },

  getMemberPayments: async (uniqueId) => {
    const response = await fetch(`${API_BASE_URL}/api/payments/${uniqueId}`);
    return handleResponse(response);
  },
};
