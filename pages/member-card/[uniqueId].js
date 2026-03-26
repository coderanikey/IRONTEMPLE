import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import TopBar from '../../components/TopBar';

export default function MemberCardPage() {
  const router = useRouter();
  const { uniqueId } = router.query;
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!uniqueId) return;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/members/${uniqueId}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Failed to load member');
        setMember(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [uniqueId]);

  return (
    <div className="container">
      <TopBar />

      <div className="hero-header" style={{ marginBottom: 18 }}>
        <h1 className="hero-title">Member ID Card</h1>
        <p className="hero-subtitle">Download / print</p>
      </div>

      <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
        {loading ? (
          <div className="empty-state">
            <h3>Loading…</h3>
            <p>Fetching member</p>
          </div>
        ) : error ? (
          <div className="form-error">{error}</div>
        ) : member ? (
          <>
            <div className="idcard">
              <div className="idcard-top">
                <div>
                  <div className="idcard-title">IRON TEMPLE</div>
                  <div className="idcard-sub">Membership Card</div>
                </div>
                <div className="idcard-chip" />
              </div>

              <div className="idcard-body">
                <div className="idrow">
                  <span className="idlabel">Name</span>
                  <span className="idvalue">{member.name}</span>
                </div>
                <div className="idrow">
                  <span className="idlabel">Member ID</span>
                  <span className="idvalue">{member.uniqueId}</span>
                </div>
                <div className="idrow">
                  <span className="idlabel">Phone</span>
                  <span className="idvalue">{member.phone || member.mobileNumber || '—'}</span>
                </div>
                <div className="idrow">
                  <span className="idlabel">Address</span>
                  <span className="idvalue">{member.address || '—'}</span>
                </div>
                <div className="idrow">
                  <span className="idlabel">Admission</span>
                  <span className="idvalue">{member.joinDate ? new Date(member.joinDate).toISOString().slice(0, 10) : '—'}</span>
                </div>
                <div className="idrow">
                  <span className="idlabel">Valid till</span>
                  <span className="idvalue">{member.nextDueDate ? new Date(member.nextDueDate).toISOString().slice(0, 10) : '—'}</span>
                </div>
              </div>
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

