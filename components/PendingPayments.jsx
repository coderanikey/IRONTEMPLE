import { useState, useEffect } from 'react';
import { paymentService } from '../src/services/paymentService';
import { api } from '../src/api/api';
import { format } from 'date-fns';
import PaymentModal from './PaymentModal';

const PendingPayments = ({ onPaymentProcessed }) => {
  const [pendingMembers, setPendingMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    const pending = await paymentService.getPendingMembers();
    setPendingMembers(pending);
  };

  const handlePayClick = (member) => {
    setSelectedMember(member);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    setSelectedMember(null);
    loadPendingPayments();
    onPaymentProcessed && onPaymentProcessed();
  };

  const handleDiscontinue = async (uniqueId) => {
    if (window.confirm('Are you sure you want to discontinue this member? They will be removed from pending payments.')) {
      try {
        await api.updateMember(uniqueId, { 
          isDiscontinued: true,
          isActive: false,
          discontinuedDate: new Date().toISOString()
        });
        loadPendingPayments();
        onPaymentProcessed && onPaymentProcessed();
      } catch (error) {
        alert('Failed to discontinue member: ' + error.message);
      }
    }
  };

  const getStatusBadge = (daysOverdue) => {
    if (daysOverdue <= 0) {
      return <span className="badge badge-warning">Due This Month</span>;
    } else if (daysOverdue <= 30) {
      return <span className="badge badge-warning">{daysOverdue} Days Overdue</span>;
    } else {
      return <span className="badge badge-danger">{daysOverdue} Days Overdue</span>;
    }
  };

  if (pendingMembers.length === 0) {
    return (
      <div className="card">
        <h2>Pending Payments</h2>
        <div className="empty-state">
          <h3>No Pending Payments</h3>
          <p>All members are up to date with their payments!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <h2>Pending Payments - {format(new Date(), 'MMMM yyyy')}</h2>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>
          Members with pending payments for this month
        </p>
        <table>
          <thead>
            <tr>
              <th>Unique ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Next Due Date</th>
              <th>Status</th>
              <th>Monthly Fee</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingMembers.map((member) => (
              <tr key={member.uniqueId}>
                <td>{member.uniqueId}</td>
                <td>{member.name}</td>
                <td>{member.phone || 'N/A'}</td>
                <td>{format(new Date(member.nextDueDate), 'dd MMM yyyy')}</td>
                <td>{getStatusBadge(member.daysOverdue)}</td>
                <td>₹{member.monthlyFee || 1000}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-success"
                      onClick={() => handlePayClick(member)}
                      style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                      Pay Now
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDiscontinue(member.uniqueId)}
                      style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                      Discontinue
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

export default PendingPayments;
