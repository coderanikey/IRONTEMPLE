import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import TopBar from '../../../components/TopBar';
import { api } from '../../../src/api/api';
import { useToast } from '../../../src/ui/toast';

function isoDateOnly(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export default function EditMemberPage() {
  const router = useRouter();
  const { push: toast } = useToast();
  const uniqueId = typeof router.query.uniqueId === 'string' ? router.query.uniqueId : '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [member, setMember] = useState(null);

  const initial = useMemo(() => {
    return {
      name: member?.name || '',
      phone: member?.phone || member?.mobileNumber || '',
      email: member?.email || '',
      address: member?.address || '',
      monthlyFee: String(member?.monthlyFee ?? 1000),
      joinDate: isoDateOnly(member?.joinDate),
      nextDueDate: isoDateOnly(member?.nextDueDate),
      isActive: Boolean(member?.isActive),
      isDiscontinued: Boolean(member?.isDiscontinued),
    };
  }, [member]);

  const [form, setForm] = useState(initial);

  useEffect(() => setForm(initial), [initial]);

  useEffect(() => {
    if (!uniqueId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/members/${encodeURIComponent(uniqueId)}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Failed to load member');
        if (cancelled) return;
        setMember(data);
      } catch (err) {
        if (cancelled) return;
        setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uniqueId]);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const phone = String(form.phone || '').trim();
    if (!/^\d{10}$/.test(phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    const email = String(form.email || '').trim();
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Invalid email format');
      return;
    }

    const monthlyFee = Number(form.monthlyFee);
    if (!Number.isFinite(monthlyFee) || monthlyFee < 0) {
      setError('Monthly fee must be a valid number');
      return;
    }

    const joinDate = form.joinDate ? new Date(form.joinDate) : null;
    if (!joinDate || Number.isNaN(joinDate.getTime())) {
      setError('Admission date is required');
      return;
    }

    const nextDueDate = form.nextDueDate ? new Date(form.nextDueDate) : null;
    if (form.nextDueDate && (!nextDueDate || Number.isNaN(nextDueDate.getTime()))) {
      setError('Next due date is invalid');
      return;
    }

    const payload = {
      name: String(form.name || '').trim(),
      phone,
      mobileNumber: phone,
      email: email ? email.toLowerCase() : '',
      address: String(form.address || '').trim(),
      monthlyFee,
      joinDate: joinDate.toISOString(),
      nextDueDate: nextDueDate ? nextDueDate.toISOString() : null,
      isActive: Boolean(form.isActive),
      isDiscontinued: Boolean(form.isDiscontinued),
      discontinuedDate: form.isDiscontinued ? new Date().toISOString() : null,
    };

    setSaving(true);
    try {
      const updated = await api.updateMember(uniqueId, payload);
      toast({ type: 'success', title: 'Member updated', message: updated.name });
      router.push('/dashboard?tab=members');
    } catch (err) {
      const msg = err?.message || 'Update failed';
      setError(msg);
      toast({ type: 'error', title: 'Update failed', message: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <TopBar />

      <div className="hero-header" style={{ marginBottom: 18 }}>
        <h1 className="hero-title">Edit Member</h1>
        <p className="hero-subtitle">Update member details and save</p>
      </div>

      <div className="card" style={{ maxWidth: 980, margin: '0 auto' }}>
        {loading ? (
          <div className="empty-state">
            <h3>Loading…</h3>
            <p>Fetching member details</p>
          </div>
        ) : error ? (
          <div className="form-error">{error}</div>
        ) : (
          <>
            <div className="member-info" style={{ marginBottom: 18 }}>
              <h3 style={{ marginBottom: 6 }}>{member?.name}</h3>
              <p style={{ marginBottom: 0 }}>
                Member ID: <strong>{member?.uniqueId}</strong>
              </p>
            </div>

            <form onSubmit={onSubmit}>
              <div className="form-grid">
                <div>
                  <label htmlFor="name">Full Name *</label>
                  <input id="name" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
                </div>
                <div>
                  <label htmlFor="phone">Phone (10 digits) *</label>
                  <input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="monthlyFee">Monthly Fee (₹) *</label>
                  <input
                    id="monthlyFee"
                    type="text"
                    inputMode="decimal"
                    value={form.monthlyFee}
                    onChange={(e) => setField('monthlyFee', e.target.value)}
                    required
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="address">Address</label>
                  <input id="address" value={form.address} onChange={(e) => setField('address', e.target.value)} />
                </div>

                <div>
                  <label htmlFor="joinDate">Admission Date *</label>
                  <input id="joinDate" type="date" value={form.joinDate} onChange={(e) => setField('joinDate', e.target.value)} required />
                </div>
                <div>
                  <label htmlFor="nextDueDate">Next Due Date</label>
                  <input id="nextDueDate" type="date" value={form.nextDueDate} onChange={(e) => setField('nextDueDate', e.target.value)} />
                </div>
              </div>

              <div className="modal-toggle-row" style={{ marginTop: 4 }}>
                <label className="modal-toggle">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setField('isActive', e.target.checked)} />
                  <span>Active</span>
                </label>
                <label className="modal-toggle">
                  <input type="checkbox" checked={form.isDiscontinued} onChange={(e) => setField('isDiscontinued', e.target.checked)} />
                  <span>Discontinued</span>
                </label>
              </div>

              {error ? <div className="form-error" style={{ marginTop: 16 }}>{error}</div> : null}

              <div className="modal-actions">
                <button className="btn btn-secondary" type="button" onClick={() => router.push('/dashboard?tab=members')} disabled={saving}>
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

