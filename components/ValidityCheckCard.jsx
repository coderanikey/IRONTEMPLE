import { useState } from 'react';

export default function ValidityCheckCard({ showFooterLinks = false }) {
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
    <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
      <h2>Membership Validity</h2>
      <p className="card-description">Check validity by phone number</p>

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

      {showFooterLinks ? (
        <div style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: 14 }}>
          You can also use the public page at <a href="/check">/check</a>.
        </div>
      ) : null}
    </div>
  );
}

