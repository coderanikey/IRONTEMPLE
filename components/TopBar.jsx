import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../src/auth/useAuth';

export default function TopBar() {
  const router = useRouter();
  const { user, loading, logout, refresh } = useAuth();

  useEffect(() => {
    // TopBar only appears on authenticated pages, so check session here.
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <img src="/Logo_gym.png" alt="IRON TEMPLE" className="topbar-logo" title="IRON TEMPLE Gym" />
        <div className="topbar-badge">IRON TEMPLE</div>
      </div>

      <div className="topbar-right">
        {loading ? (
          <span className="topbar-muted">Checking session…</span>
        ) : user ? (
          <>
            <span className="topbar-muted">{user.email}</span>
            {user.isAdmin && (
              <Link className="topbar-link" href="/admin/users">
                Manage Users
              </Link>
            )}
            <button
              className="btn btn-secondary"
              onClick={async () => {
                await logout();
                router.push('/');
              }}
              style={{ padding: '10px 16px' }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="topbar-link" href="/">
              Login
            </Link>
            <Link className="btn btn-primary" href="/register" style={{ textDecoration: 'none' }}>
              Create Account
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

