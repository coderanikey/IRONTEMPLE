import { useState } from 'react';
import { api } from '../src/api/api';
import { addMonths } from 'date-fns';
import { preventZoom, restoreZoom } from './MobileOptimized';
import { useToast } from '../src/ui/toast';

const MemberAdmission = ({ onMemberAdded }) => {
  const { push: toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    aadharNumber: '',
    phone: '',
    email: '',
    address: '',
    monthlyFee: '',
    joinDate: new Date().toISOString().split('T')[0],
    paidMonths: '1',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setSuccess('');
  };

  const validateAadhar = (aadhar) => {
    return /^\d{12}$/.test(aadhar);
  };

  const validateMobile = (mobile) => {
    return /^\d{10}$/.test(mobile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    const phone = String(formData.phone || '').trim();
    console.log(phone,"djffhdjfdkjh")
    if (!validateMobile(phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    const aadhar = String(formData.aadharNumber || '').trim();
    if (aadhar && !validateAadhar(aadhar)) {
      setError('Aadhar number must be exactly 12 digits (or leave it blank)');
      return;
    }

    const months = Math.max(1, Math.min(12, parseInt(formData.paidMonths || '1', 10) || 1));
console.log(phone,"phon")
    try {
      // Create new member
      const newMember = {
        name: formData.name,
        aadharNumber: aadhar || '',
        mobileNumber: phone,
        phone,
        email: formData.email,
        address: formData.address,
        monthlyFee: parseFloat(formData.monthlyFee) || 1000,
        isActive: true,
        isDiscontinued: false,
        joinDate: formData.joinDate,
      };
console.log(newMember,"newMember");
      const savedMember = await api.createMember(newMember);

      // Calculate next due date by adding months to the join date (preserving the day)
      const joinDateObj = new Date(formData.joinDate);
      const nextDueDateObj = addMonths(joinDateObj, months);
      
      await api.createPayment({
        uniqueId: savedMember.uniqueId,
        amount: (parseFloat(formData.monthlyFee) || 1000) * months,
        months,
        paymentMethod: 'cash',
        paymentDate: joinDateObj.toISOString(),
        nextDueDate: nextDueDateObj.toISOString(),
      });

      setSuccess(`Member added successfully! Unique ID: ${savedMember.uniqueId}`);
      toast({ type: 'success', title: 'Member added', message: `${savedMember.name} created successfully` });
      onMemberAdded && onMemberAdded();
      resetForm();
    } catch (err) {
      if (api.isDemoMode()) {
        setError('Demo mode: Connect MongoDB in .env.local to save new members.');
      } else if (err.message.includes('already exists')) {
        setError(err.message);
      } else {
        setError('Failed to add member. Please try again.');
      }
      toast({ type: 'error', title: 'Member admission failed', message: err.message || 'Failed to add member' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      aadharNumber: '',
      phone: '',
      email: '',
      address: '',
      monthlyFee: '',
      joinDate: new Date().toISOString().split('T')[0],
      paidMonths: '1',
    });
  };

  return (
    <div className="card">
      <h2>Member Admission</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onFocus={preventZoom}
            onBlur={restoreZoom}
            required
            placeholder="Enter full name"
          />
        </div>

        <div>
          <label htmlFor="phone">Phone Number (10 digits) *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="Enter 10-digit phone number"
            maxLength={10}
            pattern="[0-9]{10}"
          />
        </div>

        <div>
          <label htmlFor="aadharNumber">Aadhar Number (optional)</label>
          <input
            type="text"
            id="aadharNumber"
            name="aadharNumber"
            value={formData.aadharNumber}
            onChange={handleChange}
            placeholder="12-digit Aadhar (optional)"
            maxLength={12}
            pattern="[0-9]{12}"
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
          />
        </div>

        <div>
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter address"
          />
        </div>

        <div>
          <label htmlFor="monthlyFee">Monthly Fee (₹)</label>
          <input
            type="text"
            id="monthlyFee"
            name="monthlyFee"
            value={formData.monthlyFee}
            onChange={handleChange}
            placeholder="Enter monthly fee (default: 1000)"
            inputMode="decimal"
          />
        </div>

        <div>
          <label htmlFor="joinDate">Admission Date *</label>
          <input
            type="date"
            id="joinDate"
            name="joinDate"
            value={formData.joinDate}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="paidMonths">Paid For (Months) *</label>
          <select
            id="paidMonths"
            name="paidMonths"
            value={formData.paidMonths}
            onChange={handleChange}
            required
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={String(m)}>
                {m} {m === 1 ? 'month' : 'months'}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="form-error">{error}</div>
        )}

        {success && (
          <div className="form-success">{success}</div>
        )}

        <button type="submit" className="btn btn-primary">
          Add Member
        </button>
      </form>
    </div>
  );
};

export default MemberAdmission;
