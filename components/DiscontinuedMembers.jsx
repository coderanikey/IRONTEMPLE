import { useState, useEffect } from 'react';
import { api } from '../src/api/api';
import { format } from 'date-fns';
import PaymentModal from './PaymentModal';

const DiscontinuedMembers = ({ onMemberUpdated }) => {
  const [discontinuedMembers, setDiscontinuedMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadDiscontinuedMembers();
  }, []);

  const loadDiscontinuedMembers = async () => {
    try {
      const allMembers = await api.getMembers();
      const discontinued = allMembers.filter(m => m.isDiscontinued);
      setDiscontinuedMembers(discontinued);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading discontinued members:', error);
    }
  };

  const handleContinue = (member) => {
    setSelectedMember(member);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    setSelectedMember(null);
    loadDiscontinuedMembers();
    onMemberUpdated && onMemberUpdated();
  };

  const handleDelete = async (uniqueId) => {
    if (window.confirm('Are you sure you want to permanently delete this member? This action cannot be undone.')) {
      try {
        await api.deleteMember(uniqueId);
        loadDiscontinuedMembers();
        onMemberUpdated && onMemberUpdated();
      } catch (error) {
        alert(api.isDemoMode() ? 'Demo mode: Connect MongoDB in .env.local to save changes.' : 'Failed to delete member: ' + error.message);
      }
    }
  };

  if (discontinuedMembers.length === 0) {
    return (
      <div className="card">
        <h2>Discontinued Members</h2>
        <div className="empty-state">
          <h3>No Discontinued Members</h3>
          <p>Members who have been discontinued will appear here.</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(discontinuedMembers.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedMembers = discontinuedMembers.slice(startIdx, endIdx);

  return (
    <>
      <div className="card">
        <h2>Discontinued Members ({discontinuedMembers.length})</h2>
        <p className="card-description">
          Members who have been discontinued. Click "Continue" to resume their membership with new payment.
        </p>
        {/* Mobile view */}
        <div className="discontinued-mobile">
          {paginatedMembers.map((member) => (
            <div key={member.uniqueId} className="discontinued-card">
              <div className="discontinued-card-top">
                <div className="discontinued-card-title">
                  <div className="discontinued-card-name">{member.name}</div>
                  <div className="discontinued-card-sub">{member.uniqueId}</div>
                </div>
                <span className="badge badge-danger">Discontinued</span>
              </div>

              <div className="discontinued-card-grid">
                <div className="discontinued-kv">
                  <div className="discontinued-k">Phone</div>
                  <div className="discontinued-v">{member.phone || 'N/A'}</div>
                </div>
                <div className="discontinued-kv">
                  <div className="discontinued-k">Email</div>
                  <div className="discontinued-v">{member.email || 'N/A'}</div>
                </div>
                <div className="discontinued-kv">
                  <div className="discontinued-k">Admission</div>
                  <div className="discontinued-v">{format(new Date(member.joinDate), 'dd MMM yyyy')}</div>
                </div>
                <div className="discontinued-kv">
                  <div className="discontinued-k">Last Payment</div>
                  <div className="discontinued-v">
                    {member.lastPaymentDate ? format(new Date(member.lastPaymentDate), 'dd MMM yyyy') : 'N/A'}
                  </div>
                </div>
                <div className="discontinued-kv">
                  <div className="discontinued-k">Discontinued</div>
                  <div className="discontinued-v">
                    {member.discontinuedDate ? format(new Date(member.discontinuedDate), 'dd MMM yyyy') : 'N/A'}
                  </div>
                </div>
                <div className="discontinued-kv">
                  <div className="discontinued-k">Monthly Fee</div>
                  <div className="discontinued-v">₹{member.monthlyFee || 1000}</div>
                </div>
              </div>

              <div className="discontinued-card-actions action-row">
                <button className="btn btn-success" onClick={() => handleContinue(member)}>
                  Continue
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(member.uniqueId)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop/tablet view */}
        <table className="discontinued-table">
          <thead>
            <tr>
              <th>Unique ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Admission Date</th>
              <th>Last Payment Date</th>
              <th>Discontinued Date</th>
              <th>Monthly Fee</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMembers.map((member) => (
              <tr key={member.uniqueId}>
                <td>{member.uniqueId}</td>
                <td>{member.name}</td>
                <td>{member.phone || 'N/A'}</td>
                <td>{member.email || 'N/A'}</td>
                <td>{format(new Date(member.joinDate), 'dd MMM yyyy')}</td>
                <td>{member.lastPaymentDate ? format(new Date(member.lastPaymentDate), 'dd MMM yyyy') : 'N/A'}</td>
                <td>{member.discontinuedDate ? format(new Date(member.discontinuedDate), 'dd MMM yyyy') : 'N/A'}</td>
                <td>₹{member.monthlyFee || 1000}</td>
                <td className="actions-col">
                  <div className="action-row">
                    <button
                      className="btn btn-success"
                      onClick={() => handleContinue(member)}
                    >
                      Continue
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(member.uniqueId)}
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

      {showPaymentModal && selectedMember && (
        <PaymentModal
          member={selectedMember}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedMember(null);
          }}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </>
  );
};

export default DiscontinuedMembers;
