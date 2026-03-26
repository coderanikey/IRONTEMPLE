import { useState } from 'react';
import { paymentService } from '../src/services/paymentService';
import { api } from '../src/api/api';
import { useRouter } from 'next/router';
import { format, addMonths, startOfMonth } from 'date-fns';
import { preventZoom, restoreZoom } from './MobileOptimized';
import { useToast } from '../src/ui/toast';

const PaymentModal = ({ member, onClose, onPaymentComplete }) => {
  const router = useRouter();
  const { push: toast } = useToast();
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [amountPaid, setAmountPaid] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Generate 1-12 months options
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const calculateExpectedAmount = () => {
    return selectedMonths * (member.monthlyFee || 1000);
  };

  const calculateNewDueDate = () => {
    if (useCustomDate && customDate) {
      const startDate = startOfMonth(new Date(customDate));
      return addMonths(startDate, selectedMonths);
    }
    const baseDate = member.nextDueDate ? new Date(member.nextDueDate) : new Date();
    return addMonths(startOfMonth(baseDate), selectedMonths);
  };

  const handlePayment = async () => {
    if (!selectedMonths) {
      setError('Please select payment duration');
      return;
    }

    if (!amountPaid || parseFloat(amountPaid) <= 0) {
      setError('Please enter the amount paid');
      return;
    }

    if (useCustomDate && !customDate) {
      setError('Please select a custom start date');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const paymentDate = useCustomDate && customDate 
        ? startOfMonth(new Date(customDate)).toISOString()
        : new Date().toISOString();

      const payment = await paymentService.processPayment(
        member.uniqueId, 
        selectedMonths, 
        parseFloat(amountPaid),
        paymentDate,
        paymentMethod
      );
      
      setSuccess(`Payment of ₹${amountPaid} (${paymentMethod.toUpperCase()}) processed successfully!`);
      toast({ type: 'success', title: 'Payment success', message: `Receipt ready for ${member.name}` });
      
      setTimeout(() => {
        onPaymentComplete();
        if (payment?._id) {
          router.push(`/receipt/${payment._id}`);
        }
      }, 1500);
    } catch (err) {
      setError(api.isDemoMode() ? 'Demo mode: Connect MongoDB in .env.local to process payments.' : (err.message || 'Payment processing failed'));
      toast({ type: 'error', title: 'Payment failed', message: err.message || 'Payment processing failed' });
      setProcessing(false);
    }
  };

  return (
    <div className="modal" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content modal-content-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ minWidth: 0 }}>
            <h2>Process Payment</h2>
            <div className="member-info" style={{ marginTop: 10 }}>
              <h3 style={{ marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {member.name}
              </h3>
              <p style={{ margin: 0 }}>
                Unique ID: <strong>{member.uniqueId}</strong>
              </p>
              <p style={{ margin: 0 }}>
                Current Due Date:{' '}
                <strong>{format(new Date(member.nextDueDate || member.joinDate), 'dd MMM yyyy')}</strong>
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} type="button" aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-grid">
          <div>
            <label htmlFor="paymentMethod">Payment Method</label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
            </select>
          </div>

          <div>
            <label htmlFor="months">Payment Duration (Months) *</label>
            <select
              id="months"
              value={selectedMonths}
              onChange={(e) => {
                setSelectedMonths(parseInt(e.target.value));
                setError('');
              }}
            >
              {monthOptions.map((months) => (
                <option key={months} value={months}>
                  {months} {months === 1 ? 'Month' : 'Months'}
                </option>
              ))}
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="amount">Amount Paid (₹) *</label>
            <input
              type="text"
              id="amount"
              value={amountPaid}
              onChange={(e) => {
                setAmountPaid(e.target.value);
                setError('');
              }}
              onFocus={preventZoom}
              onBlur={restoreZoom}
              inputMode="decimal"
              placeholder={`Expected: ₹${calculateExpectedAmount()}`}
              required
            />
            <div className="helper-text">Expected: ₹{calculateExpectedAmount()}</div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="modal-toggle" style={{ alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={useCustomDate}
                onChange={(e) => {
                  setUseCustomDate(e.target.checked);
                  if (!e.target.checked) setCustomDate('');
                  setError('');
                }}
              />
              <span>Modify Payment Start Date (for members returning after long time)</span>
            </label>

            {useCustomDate && (
              <div style={{ marginTop: 12 }}>
                <label htmlFor="customDate">Select Start Date for Gym Month *</label>
                <input
                  type="date"
                  id="customDate"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    setError('');
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  required={useCustomDate}
                />
                <div className="helper-text">Gym month starts from 1st of selected month</div>
              </div>
            )}
          </div>
        </div>

        {selectedMonths ? (
          <div className="modal-summary">
            <p>
              Payment Date:{' '}
              <strong>
                {useCustomDate && customDate
                  ? format(startOfMonth(new Date(customDate)), 'dd MMM yyyy')
                  : format(new Date(), 'dd MMM yyyy')}
              </strong>
            </p>
            <p>
              New Due Date: <strong>{format(calculateNewDueDate(), 'dd MMM yyyy')}</strong>
            </p>
          </div>
        ) : null}

        {error ? <div className="form-error" style={{ marginTop: 16 }}>{error}</div> : null}
        {success ? <div className="form-success" style={{ marginTop: 16 }}>{success}</div> : null}

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={processing}>
            Cancel
          </button>
          <button className="btn btn-success" onClick={handlePayment} disabled={!amountPaid || processing}>
            {processing ? 'Processing…' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
