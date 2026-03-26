import { useEffect, useMemo, useState } from 'react';
import { api } from '../src/api/api';
import { useToast } from '../src/ui/toast';

function isoDateOnly(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export default function EditMemberModal({ member, onClose, onSaved }) {
  const { push: toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const initial = useMemo(
    () => ({
      name: member?.name || '',
      phone: member?.phone || member?.mobileNumber || '',
      email: member?.email || '',
      address: member?.address || '',
      monthlyFee: String(member?.monthlyFee ?? 1000),
      joinDate: isoDateOnly(member?.joinDate),
      nextDueDate: isoDateOnly(member?.nextDueDate),
      isActive: Boolean(member?.isActive),
      isDiscontinued: Boolean(member?.isDiscontinued),
    }),
    [member]
  );

  const [form, setForm] = useState(initial);

  useEffect(() => {
    setForm(initial);
    setError('');
  }, [initial]);

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
      const updated = await api.updateMember(member.uniqueId, payload);
      toast({ type: 'success', title: 'Member updated', message: updated.name });
      onSaved?.(updated);
      onClose();
    } catch (err) {
      const msg = err?.message || 'Update failed';
      setError(msg);
      toast({ type: 'error', title: 'Update failed', message: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal modal-fullscreen" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content modal-content-wide modal-content-fullscreen" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header modal-header-tight">
          <div style={{ minWidth: 0 }}>
            <h2 style={{ marginBottom: 6 }}>Edit Member</h2>
            <div className="modal-subhead">
              <div className="modal-subhead-title">{member.name}</div>
              <div className="modal-subhead-meta">
                Member ID: <strong>{member.uniqueId}</strong>
              </div>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} type="button" aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
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
              <input
                id="joinDate"
                type="date"
                value={form.joinDate}
                onChange={(e) => setField('joinDate', e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="nextDueDate">Next Due Date</label>
              <input
                id="nextDueDate"
                type="date"
                value={form.nextDueDate}
                onChange={(e) => setField('nextDueDate', e.target.value)}
              />
            </div>
            </div>

            <div className="modal-toggle-row">
              <label className="modal-toggle">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setField('isActive', e.target.checked)} />
                <span>Active</span>
              </label>
              <label className="modal-toggle">
                <input
                  type="checkbox"
                  checked={form.isDiscontinued}
                  onChange={(e) => setField('isDiscontinued', e.target.checked)}
                />
                <span>Discontinued</span>
              </label>
            </div>

            {error ? <div className="form-error" style={{ marginTop: 16 }}>{error}</div> : null}

            <div className="modal-actions modal-actions-sticky">
              <button className="btn btn-secondary" type="button" onClick={onClose} disabled={saving}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

