import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useToast } from '../src/ui/toast';

export default function RegisterPage() {
  const router = useRouter();
  const { push: toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteKey, setInviteKey] = useState('');
  const [showInviteKey, setShowInviteKey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // We intentionally do NOT call /api/auth/me here.

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, inviteKey }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      if (typeof window !== 'undefined' && data.token) {
        window.localStorage.setItem('it_token', data.token);
      }
      toast({ type: 'success', title: 'Account created', message: 'You are now logged in.' });
      const next = typeof router.query.next === 'string' ? router.query.next : '/dashboard';
      router.push(next);
    } catch (err) {
      setError(err.message);
      toast({ type: 'error', title: 'Registration failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="hero-header">
        <h1 className="hero-title">Create account</h1>
        <p className="hero-subtitle">Invite key required</p>
      </div>

      <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h2>Register</h2>
        <form onSubmit={onSubmit}>
          <label htmlFor="inviteKey">Unique Key (Invite Key) *</label>
          <div className="input-with-action">
            <input
              id="inviteKey"
              type={showInviteKey ? 'text' : 'password'}
              value={inviteKey}
              onChange={(e) => setInviteKey(e.target.value)}
              required
              placeholder="Enter the unique key"
              autoComplete="off"
            />
            <button
              type="button"
              className="input-action"
              aria-label={showInviteKey ? 'Hide invite key' : 'Show invite key'}
              onClick={() => setShowInviteKey((v) => !v)}
            >
              {showInviteKey ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 4l16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>

          <label htmlFor="email">Email *</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label htmlFor="password">Password *</label>
          <div className="input-with-action">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="input-action"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 4l16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>

          {error ? <div className="form-error">{error}</div> : null}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>

          <div style={{ marginTop: 14, color: 'var(--text-secondary)', fontSize: 14 }}>
            Already have an account? <Link href="/">Login</Link>
          </div>
          <div style={{ marginTop: 10, color: 'var(--text-secondary)', fontSize: 14 }}>
            Want to check validity? <Link href="/check">Check by phone</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

