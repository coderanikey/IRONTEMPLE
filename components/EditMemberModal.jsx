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
            <h2 className="m-0 text-[20px] sm:text-[24px] font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-amber-600 bg-clip-text text-transparent">
              Edit Member
            </h2>
            <div className="mt-2 text-[13px] sm:text-[14px] text-slate-700">
              <div className="font-semibold truncate">{member.name}</div>
              <div className="text-slate-500">
                Member ID: <span className="font-semibold text-slate-700">{member.uniqueId}</span>
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

        <form onSubmit={onSubmit} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label htmlFor="name">Full Name *</label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                required
                className="!mb-0"
              />
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
                className="!mb-0"
              />
            </div>

            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                className="!mb-0"
              />
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
                className="!mb-0"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                className="!mb-0"
              />
            </div>

            <div>
              <label htmlFor="joinDate">Admission Date *</label>
              <input
                id="joinDate"
                type="date"
                value={form.joinDate}
                onChange={(e) => setField('joinDate', e.target.value)}
                required
                className="!mb-0"
              />
            </div>
            <div>
              <label htmlFor="nextDueDate">Next Due Date</label>
              <input
                id="nextDueDate"
                type="date"
                value={form.nextDueDate}
                onChange={(e) => setField('nextDueDate', e.target.value)}
                className="!mb-0"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 text-[14px] text-slate-700 font-semibold">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setField('isActive', e.target.checked)}
              />
              <span>Active</span>
            </label>
            <label className="inline-flex items-center gap-2 text-[14px] text-slate-700 font-semibold">
              <input
                type="checkbox"
                checked={form.isDiscontinued}
                onChange={(e) => setField('isDiscontinued', e.target.checked)}
              />
              <span>Discontinued</span>
            </label>
          </div>

          {error ? <div className="form-error mt-4">{error}</div> : null}

          <div className="mt-5 flex flex-col-reverse sm:flex-row gap-3 justify-end">
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
  );
}

