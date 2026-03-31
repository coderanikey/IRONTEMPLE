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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      setCurrentPage(1);
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
      router.replace('/');
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

  const totalPages = Math.ceil(users.length / itemsPerPage) || 1;
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedUsers = users.slice(startIdx, endIdx);

  return (
    <div className="container">
      <TopBar />

      <div className="hero-header" style={{ marginBottom: 18 }}>
        <h1 className="hero-title">Manage Users</h1>
        <p className="hero-subtitle">Admin only</p>
      </div>

      <div className="card">
        <div className="adminusers-header">
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
          <>
            {/* Mobile view */}
            <div className="adminusers-mobile">
              {paginatedUsers.map((u) => (
                <div key={u.id} className="adminusers-card">
                  <div className="adminusers-card-top">
                    <div className="adminusers-email">{u.email}</div>
                    <div>
                      {u.isAdmin ? (
                        <span className="badge badge-success">Admin</span>
                      ) : (
                        <span className="badge badge-warning">User</span>
                      )}
                    </div>
                  </div>
                  <div className="adminusers-meta">
                    <div className="adminusers-k">Created</div>
                    <div className="adminusers-v">{u.createdAt ? new Date(u.createdAt).toLocaleString() : '—'}</div>
                  </div>
                  <div className="adminusers-actions">
                    <button className="btn btn-danger" onClick={() => deleteUser(u.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop/tablet view */}
            <table className="adminusers-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Admin</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((u) => (
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
          </>
        )}

        {users.length > itemsPerPage && (
          <div className="memberlist-pagination">
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`btn ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCurrentPage(page)}
                style={{ minWidth: '40px', padding: '10px' }}
              >
                {page}
              </button>
            ))}
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

