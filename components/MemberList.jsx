import { useState, useEffect } from 'react';
import { api } from '../src/api/api';
import { format } from 'date-fns';

const MemberList = ({ refreshTrigger }) => {
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState('all'); // all, active, inactive

  useEffect(() => {
    loadMembers();
  }, [refreshTrigger]);

  const loadMembers = async () => {
    try {
      const allMembers = await api.getMembers();
      setMembers(allMembers);
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
        alert(api.usingDemoData ? 'Demo mode: Connect MongoDB in .env.local to save changes.' : 'Failed to deactivate member: ' + error.message);
      }
    }
  };

  const handleActivate = async (uniqueId) => {
    try {
      await api.updateMember(uniqueId, { isActive: true });
      loadMembers();
      } catch (error) {
        alert(api.usingDemoData ? 'Demo mode: Connect MongoDB in .env.local to save changes.' : 'Failed to activate member: ' + error.message);
      }
  };

  const handleDelete = async (uniqueId) => {
    if (window.confirm('Are you sure you want to permanently delete this member? This action cannot be undone.')) {
      try {
        await api.deleteMember(uniqueId);
        loadMembers();
      } catch (error) {
        alert(api.usingDemoData ? 'Demo mode: Connect MongoDB in .env.local to save changes.' : 'Failed to delete member: ' + error.message);
      }
    }
  };

  const filteredMembers = members.filter(member => {
    if (filter === 'active') return member.isActive;
    if (filter === 'inactive') return !member.isActive;
    return true;
  });

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>All Members</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ width: 'auto', padding: '8px 16px' }}
        >
          <option value="all">All Members</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="empty-state">
          <h3>No Members Found</h3>
          <p>Add your first member using the Member Admission form.</p>
        </div>
      ) : (
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
            {filteredMembers.map((member) => (
              <tr key={member.uniqueId}>
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
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {member.isActive ? (
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeactivate(member.uniqueId)}
                        style={{ padding: '6px 12px', fontSize: '14px' }}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        className="btn btn-success"
                        onClick={() => handleActivate(member.uniqueId)}
                        style={{ padding: '6px 12px', fontSize: '14px' }}
                      >
                        Activate
                      </button>
                    )}
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(member.uniqueId)}
                      style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MemberList;
