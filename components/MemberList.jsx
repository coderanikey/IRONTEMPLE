import { useEffect, useState } from 'react';
import { api } from '../src/api/api';
import { format } from 'date-fns';
import { useRouter } from 'next/router';

const MemberList = ({ refreshTrigger }) => {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadMembers();
  }, [refreshTrigger]);

  const loadMembers = async () => {
    try {
      const allMembers = await api.getMembers();
      setMembers(allMembers);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const handleDeactivate = async (uniqueId) => {
    if (window.confirm('Are you sure you want to deactivate this member? They will stop receiving payment notifications.')) {
      try {
        await api.updateMember(uniqueId, { isActive: false });
        loadMembers();
      } catch (error) {
        alert(api.isDemoMode() ? 'Demo mode: Connect MongoDB in .env.local to save changes.' : 'Failed to deactivate member: ' + error.message);
      }
    }
  };

  const handleActivate = async (uniqueId) => {
    try {
      await api.updateMember(uniqueId, { isActive: true });
      loadMembers();
      } catch (error) {
        alert(api.isDemoMode() ? 'Demo mode: Connect MongoDB in .env.local to save changes.' : 'Failed to activate member: ' + error.message);
      }
  };

  const handleDelete = async (uniqueId) => {
    if (window.confirm('Are you sure you want to permanently delete this member? This action cannot be undone.')) {
      try {
        await api.deleteMember(uniqueId);
        loadMembers();
      } catch (error) {
        alert(api.isDemoMode() ? 'Demo mode: Connect MongoDB in .env.local to save changes.' : 'Failed to delete member: ' + error.message);
      }
    }
  };

  const filteredMembers = members.filter(member => {
    if (filter === 'active') return member.isActive;
    if (filter === 'inactive') return !member.isActive;
    return true;
  });

  const q = query.trim().toLowerCase();
  const visibleMembers = filteredMembers.filter((m) => {
    if (!q) return true;
    const name = String(m.name || '').toLowerCase();
    const phone = String(m.phone || '').toLowerCase();
    return name.includes(q) || phone.includes(q);
  });

  // Pagination logic
  const totalPages = Math.ceil(visibleMembers.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedMembers = visibleMembers.slice(startIdx, endIdx);

  const goEdit = (uniqueId) => {
    router.push(`/members/${encodeURIComponent(uniqueId)}/edit`);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>All Members ({visibleMembers.length})</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name or phone…"
            style={{ width: 260, marginBottom: 0 }}
          />
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: 'auto', padding: '12px 14px', marginBottom: 0 }}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {visibleMembers.length === 0 ? (
        <div className="empty-state">
          <h3>No Members Found</h3>
          <p>{query ? 'Try a different search.' : 'Add your first member using the Member Admission form.'}</p>
        </div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Unique ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Join Date</th>
                <th>Monthly Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.map((member) => (
                <tr
                  key={member.uniqueId}
                  style={{ cursor: 'pointer' }}
                  onClick={() => goEdit(member.uniqueId)}
                  title="Click to edit member"
                >
                  <td>{member.uniqueId}</td>
                  <td>{member.name}</td>
                  <td>{member.phone || 'N/A'}</td>
                  <td>{member.email || 'N/A'}</td>
                  <td>{format(new Date(member.joinDate), 'dd MMM yyyy')}</td>
                  <td>₹{member.monthlyFee || 1000}</td>
                  <td>
                    {member.isActive ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-danger">Inactive</span>
                    )}
                  </td>
                  <td>
                    <div className="action-row">
                      <button
                        className="btn btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.assign(`/member-card/${member.uniqueId}`);
                        }}
                      >
                        ID Card
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          goEdit(member.uniqueId);
                        }}
                      >
                        Edit
                      </button>
                      {member.isActive ? (
                        <button
                          className="btn btn-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeactivate(member.uniqueId);
                          }}
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          className="btn btn-success"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivate(member.uniqueId);
                          }}
                        >
                          Activate
                        </button>
                      )}
                      <button
                        className="btn btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(member.uniqueId);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MemberList;
