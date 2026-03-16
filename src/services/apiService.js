// API service that automatically falls back to local storage
import { api } from '../api/api.js';
import { storageService as localStorage } from './storageService.js';

const USE_API = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'http://localhost:3001';

// Helper to handle API calls with fallback
const apiCall = async (apiFn, localFn, ...args) => {
  if (USE_API) {
    try {
      return await apiFn(...args);
    } catch (error) {
      console.warn('API call failed, falling back to local storage:', error.message);
      return localFn(...args);
    }
  }
  return localFn(...args);
};

export const apiService = {
  // Member operations
  getMembers: async () => {
    return apiCall(
      () => api.getMembers(),
      () => localStorage.getMembers()
    );
  },

  saveMember: async (member) => {
    return apiCall(
      () => api.createMember(member),
      () => localStorage.saveMember(member)
    );
  },

  updateMember: async (uniqueId, updates) => {
    return apiCall(
      () => api.updateMember(uniqueId, updates),
      () => localStorage.updateMember(uniqueId, updates)
    );
  },

  deleteMember: async (uniqueId) => {
    return apiCall(
      () => api.deleteMember(uniqueId),
      () => localStorage.deleteMember(uniqueId)
    );
  },

  // Payment operations
  getPayments: async () => {
    return apiCall(
      () => api.getPayments(),
      () => localStorage.getPayments()
    );
  },

  savePayment: async (payment) => {
    return apiCall(
      () => api.createPayment(payment),
      () => localStorage.savePayment(payment)
    );
  },

  getMemberPayments: async (uniqueId) => {
    return apiCall(
      () => api.getMemberPayments(uniqueId),
      () => localStorage.getMemberPayments(uniqueId)
    );
  },
};
