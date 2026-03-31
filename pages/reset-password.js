import { useState } from 'react';
import Link from 'next/link';
import { useToast } from '../src/ui/toast';

export default function ResetPasswordPage() {
  const { push: toast } = useToast();
  const [email, setEmail] = useState('');
  const [inviteKey, setInviteKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showInviteKey, setShowInviteKey] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      toast({ type: 'error', title: 'Error', message: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      toast({ type: 'error', title: 'Error', message: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          inviteKey,
          newPassword
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      setSuccess(true);
      setEmail('');
      setInviteKey('');
      setNewPassword('');
      setConfirmPassword('');
      toast({
        type: 'success',
        title: 'Success',
        message: 'Password reset successful! You can now login with your new password.'
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (err) {
      setError(err.message);
      toast({ type: 'error', title: 'Reset failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="hero-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
          <img src="/Logo_gym.png" alt="IRON TEMPLE" style={{ width: '64px', height: '64px', borderRadius: '8px' }} />
        </div>
        <h1 className="hero-title">Reset Password</h1>
        <p className="hero-subtitle">Enter your details to reset your password</p>
      </div>

      <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h2>Reset Your Password</h2>

        {success && (
          <div style={{
            padding: '16px',
            background: '#d1fae5',
            border: '1px solid #10b981',
            borderRadius: '8px',
            marginBottom: '16px',
            color: '#047857'
          }}>
            ✅ Password reset successful! Redirecting to login...
          </div>
        )}

        <form onSubmit={onSubmit}>
          <label htmlFor="email">Email Address *</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            required
            autoComplete="email"
          />

          <label htmlFor="inviteKey">
            Invite Key (Same code used for registration) *
          </label>
          <div className="input-with-action">
            <input
              id="inviteKey"
              type={showInviteKey ? 'text' : 'password'}
              value={inviteKey}
              onChange={(e) => setInviteKey(e.target.value)}
              placeholder="Enter the unique key"
              required
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

          <label htmlFor="newPassword">New Password *</label>
          <div className="input-with-action">
            <input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="input-action"
              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowNewPassword((v) => !v)}
            >
              {showNewPassword ? (
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

          <label htmlFor="confirmPassword">Confirm New Password *</label>
          <div className="input-with-action">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="input-action"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowConfirmPassword((v) => !v)}
            >
              {showConfirmPassword ? (
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

          {error && <div className="form-error">{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>

          <div style={{ marginTop: 16, padding: '14px', background: '#fef3c7', borderRadius: '8px', fontSize: 13, color: '#92400e' }}>
            <strong>⚠️ Important:</strong> You need to provide the same <strong>Invite Key</strong> that was used during registration to reset your password.
          </div>

          <div style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center' }}>
            Remember your password? <Link href="/">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
