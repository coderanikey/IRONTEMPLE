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
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-4 sm:p-6 border-b border-black/10">
          <div className="min-w-0">
            <h2 className="m-0 text-[20px] sm:text-[24px] font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-emerald-600 bg-clip-text text-transparent">
              Process Payment
            </h2>
            <div className="mt-2 text-[13px] sm:text-[14px] text-slate-700">
              <div className="font-semibold truncate">{member.name}</div>
              <div className="text-slate-500">
                ID: <span className="font-semibold text-slate-700">{member.uniqueId}</span>
              </div>
              <div className="text-slate-500">
                Due:{" "}
                <span className="font-semibold text-slate-700">
                  {format(new Date(member.nextDueDate || member.joinDate), 'dd MMM yyyy')}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-xl bg-slate-100 text-slate-900 hover:bg-slate-900 hover:text-white transition"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label htmlFor="paymentMethod">Payment Method</label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="!mb-0"
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
                className="!mb-0"
              >
                {monthOptions.map((months) => (
                  <option key={months} value={months}>
                    {months} {months === 1 ? 'Month' : 'Months'}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
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
                className="!mb-0"
              />
              <div className="mt-1 text-[12px] text-slate-500 font-semibold">
                Expected: ₹{calculateExpectedAmount()}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="inline-flex items-start gap-3 cursor-pointer text-[14px] text-slate-700 font-semibold">
                <input
                  className="mt-1"
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
                <div className="mt-3">
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
                    className="!mb-0"
                  />
                  <div className="mt-1 text-[12px] text-slate-500 font-semibold">
                    Gym month starts from 1st of selected month
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedMonths ? (
            <div className="mt-4 rounded-2xl border border-black/10 bg-slate-50 p-4 text-slate-800">
              <div className="text-[14px] font-semibold">
                Payment Date:{' '}
                <span className="font-extrabold">
                  {useCustomDate && customDate
                    ? format(startOfMonth(new Date(customDate)), 'dd MMM yyyy')
                    : format(new Date(), 'dd MMM yyyy')}
                </span>
              </div>
              <div className="mt-1 text-[14px] font-semibold">
                New Due Date:{' '}
                <span className="font-extrabold">{format(calculateNewDueDate(), 'dd MMM yyyy')}</span>
              </div>
            </div>
          ) : null}

          {error ? <div className="form-error mt-4">{error}</div> : null}
          {success ? <div className="form-success mt-4">{success}</div> : null}

          <div className="mt-5 flex flex-col-reverse sm:flex-row gap-3 justify-end">
            <button className="btn btn-secondary" onClick={onClose} disabled={processing}>
              Cancel
            </button>
            <button className="btn btn-success" onClick={handlePayment} disabled={!amountPaid || processing}>
              {processing ? 'Processing…' : 'Confirm Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
