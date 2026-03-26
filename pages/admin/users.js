import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import TopBar from '../../components/TopBar';

export default function AdminUsersPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');

  const loadMe = async () => {
    setLoadingMe(true);
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Unauthorized');
      setMe(data.user);
    } catch {
      setMe(null);
    } finally {
      setLoadingMe(false);
    }
  };

  const loadUsers = async () => {
    setError('');
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to load users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  useEffect(() => {
    if (loadingMe) return;
    if (!me) {
      router.replace('/login');
      return;
    }
    if (!me.isAdmin) {
      router.replace('/');
      return;
    }
    loadUsers();
  }, [loadingMe, me]);

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <TopBar />

      <div className="hero-header" style={{ marginBottom: 18 }}>
        <h1 className="hero-title">Manage Users</h1>
        <p className="hero-subtitle">Admin only</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <h2 style={{ marginBottom: 0 }}>Users</h2>
          <button className="btn btn-secondary" onClick={loadUsers} disabled={loadingUsers}>
            {loadingUsers ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {error ? <div className="form-error" style={{ marginTop: 16 }}>{error}</div> : null}

        {loadingUsers ? (
          <div className="empty-state">
            <h3>Loading…</h3>
            <p>Fetching users</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <h3>No users</h3>
            <p>Create the first user from the Register page.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Admin</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.isAdmin ? <span className="badge badge-success">Admin</span> : <span className="badge badge-warning">User</span>}</td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleString() : '—'}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => deleteUser(u.id)} style={{ padding: '8px 12px' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

