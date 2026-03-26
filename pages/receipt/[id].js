import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import TopBar from '../../components/TopBar';

export default function ReceiptPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/payments/by-id/${id}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Failed to load receipt');
        setPayment(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <div className="container">
      <TopBar />

      <div className="hero-header" style={{ marginBottom: 18 }}>
        <h1 className="hero-title">Receipt</h1>
        <p className="hero-subtitle">Download / print</p>
      </div>

      <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
        {loading ? (
          <div className="empty-state">
            <h3>Loading…</h3>
            <p>Fetching receipt</p>
          </div>
        ) : error ? (
          <div className="form-error">{error}</div>
        ) : payment ? (
          <>
            <div className="payment-summary">
              <p style={{ marginBottom: 8 }}>
                Member: <strong>{payment.memberName}</strong>
              </p>
              <p style={{ marginBottom: 8 }}>
                Member ID: <strong>{payment.uniqueId}</strong>
              </p>
              <p style={{ marginBottom: 8 }}>
                Amount: <strong>₹{payment.amount}</strong>
              </p>
              <p style={{ marginBottom: 8 }}>
                Months: <strong>{payment.months}</strong>
              </p>
              <p style={{ marginBottom: 8 }}>
                Method: <strong>{String(payment.paymentMethod || 'cash').toUpperCase()}</strong>
              </p>
              <p style={{ marginBottom: 0 }}>
                Valid till: <strong>{payment.nextDueDate ? new Date(payment.nextDueDate).toISOString().slice(0, 10) : '—'}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16, flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => router.push('/')}>Back</button>
              <button className="btn btn-primary" onClick={() => window.print()}>Download / Print</button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

