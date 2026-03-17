// API service for Next.js API routes
// All API calls go to /api/* routes in the same Next.js app

import { dummyMembers } from '../data/dummyData';

const API_BASE_URL = typeof window !== 'undefined' ? '' : 'http://localhost:3000';

// Set to true when falling back to dummy data (for UI banner)
export let usingDemoData = false;

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

export const api = {
  // Member endpoints - falls back to dummy data on API error
  getMembers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/members`);
      const data = await handleResponse(response);
      usingDemoData = false;
      return data;
    } catch (error) {
      console.warn('API unavailable, using demo data:', error.message);
      usingDemoData = true;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('apiDemoMode'));
      }
      return [...dummyMembers];
    }
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
