import { useState, useEffect } from 'react';
import { paymentService } from '../src/services/paymentService';
import { api } from '../src/api/api';
import { format } from 'date-fns';
import PaymentModal from './PaymentModal';

const PendingPayments = ({ onPaymentProcessed }) => {
  const [pendingMembers, setPendingMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    const pending = await paymentService.getPendingMembers();
    setPendingMembers(pending);
    setCurrentPage(1);
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
        alert(api.isDemoMode() ? 'Demo mode: Connect MongoDB in .env.local to save changes.' : 'Failed to discontinue member: ' + error.message);
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

  // Pagination logic
  const totalPages = Math.ceil(pendingMembers.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedMembers = pendingMembers.slice(startIdx, endIdx);

  return (
    <>
      <div className="card">
        <h2>Pending Payments - {format(new Date(), 'MMMM yyyy')} ({pendingMembers.length})</h2>
        <p className="card-description">
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
            {paginatedMembers.map((member) => (
              <tr key={member.uniqueId}>
                <td>{member.uniqueId}</td>
                <td>{member.name}</td>
                <td>{member.phone || 'N/A'}</td>
                <td>{format(new Date(member.nextDueDate), 'dd MMM yyyy')}</td>
                <td>{getStatusBadge(member.daysOverdue)}</td>
                <td>₹{member.monthlyFee || 1000}</td>
                <td>
                  <div className="action-row">
                    <button
                      className="btn btn-success"
                      onClick={() => handlePayClick(member)}
                    >
                      Pay Now
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDiscontinue(member.uniqueId)}
                    >
                      Discontinue
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
