import { useEffect, useState } from 'react';

const TOKEN_STORAGE_KEY = 'it_token';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_STORAGE_KEY) : null;
      const res = await fetch('/api/auth/me', token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data.user || null);
    } finally {
      setLoading(false);
    }
  };

  // NOTE: we intentionally do NOT auto-call /api/auth/me on mount.
  // Call refresh() only on pages/components that actually need session state.

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    setUser(null);
  };

  return { user, loading, refresh, logout };
}

