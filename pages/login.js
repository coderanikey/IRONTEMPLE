import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useToast } from '../src/ui/toast';
import { useAuth } from '../src/auth/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { push: toast } = useToast();
  const { user, loading: loadingMe } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loadingMe) return;
    if (user) {
      const next = typeof router.query.next === 'string' ? router.query.next : '/';
      router.replace(next);
    }
  }, [loadingMe, user, router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Login failed');
      toast({ type: 'success', title: 'Login success', message: 'Welcome back!' });
      const next = typeof router.query.next === 'string' ? router.query.next : '/';
      router.push(next);
    } catch (err) {
      setError(err.message);
      toast({ type: 'error', title: 'Login failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="hero-header">
        <h1 className="hero-title">Welcome back</h1>
        <p className="hero-subtitle">Login to manage members and payments</p>
      </div>

      <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h2>Login</h2>
        {loadingMe ? (
          <div className="empty-state">
            <h3>Loading…</h3>
            <p>Checking session</p>
          </div>
        ) : null}
        <form onSubmit={onSubmit}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {error ? <div className="form-error">{error}</div> : null}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>

          <div style={{ marginTop: 14, color: 'var(--text-secondary)', fontSize: 14 }}>
            New here? <Link href="/register">Create account</Link>
          </div>
          <div style={{ marginTop: 10, color: 'var(--text-secondary)', fontSize: 14 }}>
            Want to check validity? <Link href="/check">Check by phone</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

