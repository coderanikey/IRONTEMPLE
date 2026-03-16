import { useState } from 'react';
import { storageService } from '../services/storageService';

const MemberAdmission = ({ onMemberAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    idType: 'aadhar', // 'aadhar' or 'mobile'
    aadharNumber: '',
    mobileNumber: '',
    phone: '',
    email: '',
    address: '',
    monthlyFee: '',
    joinDate: new Date().toISOString().split('T')[0],
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const generateUniqueId = () => {
    // Generate unique ID based on timestamp and random number
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return timestamp.slice(-8) + random;
  };

  const validateAadhar = (aadhar) => {
    return /^\d{12}$/.test(aadhar);
  };

  const validateMobile = (mobile) => {
    return /^\d{10}$/.test(mobile);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    let uniqueId = '';
    let validationError = '';

    if (formData.idType === 'aadhar') {
      if (!formData.aadharNumber.trim()) {
        setError('Aadhar number is required');
        return;
      }
      if (!validateAadhar(formData.aadharNumber)) {
        setError('Aadhar number must be exactly 12 digits');
        return;
      }
      uniqueId = formData.aadharNumber;
    } else {
      if (!formData.mobileNumber.trim()) {
        setError('Mobile number is required');
        return;
      }
      if (!validateMobile(formData.mobileNumber)) {
        setError('Mobile number must be exactly 10 digits');
        return;
      }
      // Generate unique ID for mobile-based registration
      uniqueId = generateUniqueId();
    }

    // Check if member with same ID already exists
    const existingMembers = storageService.getMembers();
    const existingMember = existingMembers.find(m => 
      m.uniqueId === uniqueId || 
      (formData.idType === 'aadhar' && m.aadharNumber === formData.aadharNumber) ||
      (formData.idType === 'mobile' && m.mobileNumber === formData.mobileNumber)
    );
    
    if (existingMember && existingMember.isDiscontinued) {
      // Reactivate discontinued member
      const reactivatedMember = storageService.updateMember(existingMember.uniqueId, {
        name: formData.name,
        phone: formData.phone || formData.mobileNumber,
        email: formData.email,
        address: formData.address,
        monthlyFee: parseFloat(formData.monthlyFee) || 1000,
        isActive: true,
        isDiscontinued: false,
        joinDate: formData.joinDate,
      });
      setSuccess(`Member reactivated successfully! Unique ID: ${reactivatedMember.uniqueId}`);
      onMemberAdded && onMemberAdded();
      resetForm();
      return;
    }

    if (existingMember) {
      setError(`Member with this ${formData.idType === 'aadhar' ? 'Aadhar' : 'Mobile'} number already exists`);
      return;
    }

    // Create new member
    const newMember = {
      name: formData.name,
      uniqueId: uniqueId,
      idType: formData.idType,
      aadharNumber: formData.idType === 'aadhar' ? formData.aadharNumber : '',
      mobileNumber: formData.idType === 'mobile' ? formData.mobileNumber : '',
      phone: formData.phone || formData.mobileNumber,
      email: formData.email,
      address: formData.address,
      monthlyFee: parseFloat(formData.monthlyFee) || 1000,
      isActive: true,
      isDiscontinued: false,
      joinDate: formData.joinDate,
      createdAt: new Date().toISOString(),
    };

    storageService.saveMember(newMember);
    setSuccess(`Member added successfully! Unique ID: ${newMember.uniqueId}`);
    onMemberAdded && onMemberAdded();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      idType: 'aadhar',
      aadharNumber: '',
      mobileNumber: '',
      phone: '',
      email: '',
      address: '',
      monthlyFee: '',
      joinDate: new Date().toISOString().split('T')[0],
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
            required
            placeholder="Enter full name"
          />
        </div>

        <div>
          <label htmlFor="idType">Identification Type *</label>
          <select
            id="idType"
            name="idType"
            value={formData.idType}
            onChange={handleChange}
            required
          >
            <option value="aadhar">Aadhar Number</option>
            <option value="mobile">Mobile Number</option>
          </select>
        </div>

        {formData.idType === 'aadhar' ? (
          <div>
            <label htmlFor="aadharNumber">Aadhar Number (12 digits) *</label>
            <input
              type="text"
              id="aadharNumber"
              name="aadharNumber"
              value={formData.aadharNumber}
              onChange={handleChange}
              required
              placeholder="Enter 12-digit Aadhar number"
              maxLength={12}
              pattern="[0-9]{12}"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="mobileNumber">Mobile Number (10 digits) *</label>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              pattern="[0-9]{10}"
            />
          </div>
        )}

        <div>
          <label htmlFor="phone">Alternate Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter alternate phone number (optional)"
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
            type="number"
            id="monthlyFee"
            name="monthlyFee"
            value={formData.monthlyFee}
            onChange={handleChange}
            placeholder="Enter monthly fee (default: 1000)"
            min="0"
            step="100"
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

        {error && (
          <div style={{ color: '#ef4444', marginBottom: '12px', padding: '10px', background: '#fee2e2', borderRadius: '6px' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ color: '#059669', marginBottom: '12px', padding: '10px', background: '#d1fae5', borderRadius: '6px' }}>
            {success}
          </div>
        )}

        <button type="submit" className="btn btn-primary">
          Add Member
        </button>
      </form>
    </div>
  );
};

export default MemberAdmission;
