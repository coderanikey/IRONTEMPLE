import { useState } from 'react';
import Link from 'next/link';

export default function CheckValidityPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const onCheck = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    const p = phone.trim();
    if (!/^\d{10}$/.test(p)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/public/validity?phone=${encodeURIComponent(p)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Check failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="hero-header">
        <h1 className="hero-title">Check Membership</h1>
        <p className="hero-subtitle">Free validity check (phone number)</p>
      </div>

      <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
        <h2>Validity</h2>
        <form onSubmit={onCheck}>
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit phone"
            maxLength={10}
            pattern="[0-9]{10}"
            required
          />

          {error ? <div className="form-error">{error}</div> : null}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Checking…' : 'Check'}
          </button>
        </form>

        {result ? (
          <div className="payment-summary">
            {result.found === false ? (
              <>
                <p style={{ marginBottom: 8 }}>
                  <strong>Details not found</strong>
                </p>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  No member is registered with this phone number.
                </p>
              </>
            ) : (
              <>
                <p style={{ marginBottom: 8 }}>
                  Member: <strong>{result.memberName}</strong>
                </p>
                <p style={{ marginBottom: 8 }}>
                  Status:{' '}
                  {result.isValid ? (
                    <span className="badge badge-success">Valid</span>
                  ) : (
                    <span className="badge badge-danger">Expired</span>
                  )}
                </p>
                <p style={{ margin: 0 }}>
                  Valid till: <strong>{result.validTill || '—'}</strong>
                </p>
              </>
            )}
          </div>
        ) : null}

        <div style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: 14 }}>
          Go to <Link href="/">Login</Link> or <Link href="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}

