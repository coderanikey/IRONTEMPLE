import { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { format } from 'date-fns';
import PaymentModal from './PaymentModal';

const DiscontinuedMembers = ({ onMemberUpdated }) => {
  const [discontinuedMembers, setDiscontinuedMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadDiscontinuedMembers();
  }, []);

  const loadDiscontinuedMembers = () => {
    const allMembers = storageService.getMembers();
    const discontinued = allMembers.filter(m => m.isDiscontinued);
    setDiscontinuedMembers(discontinued);
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

  const handleDelete = (uniqueId) => {
    if (window.confirm('Are you sure you want to permanently delete this member? This action cannot be undone.')) {
      storageService.deleteMember(uniqueId);
      loadDiscontinuedMembers();
      onMemberUpdated && onMemberUpdated();
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

  return (
    <>
      <div className="card">
        <h2>Discontinued Members</h2>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>
          Members who have been discontinued. Click "Continue" to resume their membership with new payment.
        </p>
        <table>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {discontinuedMembers.map((member) => (
              <tr key={member.uniqueId}>
                <td>{member.uniqueId}</td>
                <td>{member.name}</td>
                <td>{member.phone || 'N/A'}</td>
                <td>{member.email || 'N/A'}</td>
                <td>{format(new Date(member.joinDate), 'dd MMM yyyy')}</td>
                <td>{member.lastPaymentDate ? format(new Date(member.lastPaymentDate), 'dd MMM yyyy') : 'N/A'}</td>
                <td>{member.discontinuedDate ? format(new Date(member.discontinuedDate), 'dd MMM yyyy') : 'N/A'}</td>
                <td>₹{member.monthlyFee || 1000}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-success"
                      onClick={() => handleContinue(member)}
                      style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                      Continue
                    </button>
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
