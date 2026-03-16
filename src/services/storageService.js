// Local storage service for member and payment data
// This will be replaced with MongoDB API later

const STORAGE_KEYS = {
  MEMBERS: 'gym_members',
  PAYMENTS: 'gym_payments',
  INITIALIZED: 'gym_initialized',
};

// Initialize dummy data
const initializeDummyData = () => {
  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);

  const dummyMembers = [
    {
      uniqueId: '123456789012',
      idType: 'aadhar',
      aadharNumber: '123456789012',
      mobileNumber: '',
      name: 'Rajesh Kumar',
      phone: '9876543210',
      email: 'rajesh.kumar@email.com',
      address: '123 MG Road, Bangalore',
      monthlyFee: 1500,
      joinDate: '2024-01-15',
      lastPaymentDate: lastMonth.toISOString(),
      nextDueDate: currentMonth.toISOString(),
      isActive: true,
      isDiscontinued: false,
      createdAt: '2024-01-15T10:00:00.000Z',
    },
    {
      uniqueId: '234567890123',
      idType: 'aadhar',
      aadharNumber: '234567890123',
      mobileNumber: '',
      name: 'Priya Sharma',
      phone: '9876543211',
      email: 'priya.sharma@email.com',
      address: '456 Park Street, Mumbai',
      monthlyFee: 2000,
      joinDate: '2024-02-20',
      lastPaymentDate: twoMonthsAgo.toISOString(),
      nextDueDate: lastMonth.toISOString(),
      isActive: true,
      isDiscontinued: false,
      createdAt: '2024-02-20T10:00:00.000Z',
    },
    {
      uniqueId: '345678901234',
      idType: 'aadhar',
      aadharNumber: '345678901234',
      mobileNumber: '',
      name: 'Amit Patel',
      phone: '9876543212',
      email: 'amit.patel@email.com',
      address: '789 Sector 5, Delhi',
      monthlyFee: 1200,
      joinDate: '2024-03-10',
      lastPaymentDate: threeMonthsAgo.toISOString(),
      nextDueDate: twoMonthsAgo.toISOString(),
      isActive: true,
      isDiscontinued: false,
      createdAt: '2024-03-10T10:00:00.000Z',
    },
    {
      uniqueId: '456789012345',
      idType: 'aadhar',
      aadharNumber: '456789012345',
      mobileNumber: '',
      name: 'Sneha Reddy',
      phone: '9876543213',
      email: 'sneha.reddy@email.com',
      address: '321 Banjara Hills, Hyderabad',
      monthlyFee: 1800,
      joinDate: '2024-04-05',
      lastPaymentDate: lastMonth.toISOString(),
      nextDueDate: nextMonth.toISOString(),
      isActive: true,
      isDiscontinued: false,
      createdAt: '2024-04-05T10:00:00.000Z',
    },
    {
      uniqueId: '567890123456',
      idType: 'aadhar',
      aadharNumber: '567890123456',
      mobileNumber: '',
      name: 'Vikram Singh',
      phone: '9876543214',
      email: 'vikram.singh@email.com',
      address: '654 MG Road, Pune',
      monthlyFee: 1600,
      joinDate: '2024-05-12',
      lastPaymentDate: lastMonth.toISOString(),
      nextDueDate: currentMonth.toISOString(),
      isActive: true,
      isDiscontinued: false,
      createdAt: '2024-05-12T10:00:00.000Z',
    },
    {
      uniqueId: '678901234567',
      idType: 'mobile',
      aadharNumber: '',
      mobileNumber: '6789012345',
      name: 'Anjali Mehta',
      phone: '9876543215',
      email: 'anjali.mehta@email.com',
      address: '987 Koramangala, Bangalore',
      monthlyFee: 1400,
      joinDate: '2024-06-18',
      lastPaymentDate: twoMonthsAgo.toISOString(),
      nextDueDate: lastMonth.toISOString(),
      isActive: true,
      isDiscontinued: false,
      createdAt: '2024-06-18T10:00:00.000Z',
    },
    {
      uniqueId: '789012345678',
      idType: 'aadhar',
      aadharNumber: '789012345678',
      mobileNumber: '',
      name: 'Rahul Verma',
      phone: '9876543216',
      email: 'rahul.verma@email.com',
      address: '147 Andheri West, Mumbai',
      monthlyFee: 1700,
      joinDate: '2024-07-22',
      lastPaymentDate: lastMonth.toISOString(),
      nextDueDate: nextMonth.toISOString(),
      isActive: true,
      isDiscontinued: false,
      createdAt: '2024-07-22T10:00:00.000Z',
    },
    {
      uniqueId: '890123456789',
      idType: 'aadhar',
      aadharNumber: '890123456789',
      mobileNumber: '',
      name: 'Kavita Nair',
      phone: '9876543217',
      email: 'kavita.nair@email.com',
      address: '258 Vasant Kunj, Delhi',
      monthlyFee: 1900,
      joinDate: '2024-08-30',
      lastPaymentDate: lastMonth.toISOString(),
      nextDueDate: currentMonth.toISOString(),
      isActive: true,
      isDiscontinued: false,
      createdAt: '2024-08-30T10:00:00.000Z',
    },
    {
      uniqueId: '901234567890',
      idType: 'mobile',
      aadharNumber: '',
      mobileNumber: '9012345678',
      name: 'Mohit Agarwal',
      phone: '9876543218',
      email: 'mohit.agarwal@email.com',
      address: '369 Hitech City, Hyderabad',
      monthlyFee: 1300,
      joinDate: '2024-09-14',
      lastPaymentDate: threeMonthsAgo.toISOString(),
      nextDueDate: twoMonthsAgo.toISOString(),
      isActive: true,
      isDiscontinued: false,
      createdAt: '2024-09-14T10:00:00.000Z',
    },
    {
      uniqueId: '012345678901',
      idType: 'aadhar',
      aadharNumber: '012345678901',
      mobileNumber: '',
      name: 'Deepak Joshi',
      phone: '9876543219',
      email: 'deepak.joshi@email.com',
      address: '741 Koregaon Park, Pune',
      monthlyFee: 1500,
      joinDate: '2024-10-08',
      lastPaymentDate: lastMonth.toISOString(),
      nextDueDate: currentMonth.toISOString(),
      isActive: false,
      isDiscontinued: true,
      discontinuedDate: lastMonth.toISOString(),
      createdAt: '2024-10-08T10:00:00.000Z',
    },
  ];

  const dummyPayments = [
    {
      id: '1',
      uniqueId: '123456789012',
      memberName: 'Rajesh Kumar',
      amount: 1500,
      months: 1,
      paymentDate: lastMonth.toISOString(),
      nextDueDate: currentMonth.toISOString(),
      date: lastMonth.toISOString(),
    },
    {
      id: '2',
      uniqueId: '234567890123',
      memberName: 'Priya Sharma',
      amount: 2000,
      months: 1,
      paymentDate: twoMonthsAgo.toISOString(),
      nextDueDate: lastMonth.toISOString(),
      date: twoMonthsAgo.toISOString(),
    },
    {
      id: '3',
      uniqueId: '456789012345',
      memberName: 'Sneha Reddy',
      amount: 1800,
      months: 1,
      paymentDate: lastMonth.toISOString(),
      nextDueDate: nextMonth.toISOString(),
      date: lastMonth.toISOString(),
    },
  ];

  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(dummyMembers));
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(dummyPayments));
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
};

export const storageService = {
  // Initialize dummy data if not already initialized
  initialize: () => {
    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!initialized) {
      initializeDummyData();
    }
  },

  // Member operations
  getMembers: () => {
    const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return data ? JSON.parse(data) : [];
  },

  saveMember: (member) => {
    const members = storageService.getMembers();
    // Check if member with same ID already exists
    const existingIndex = members.findIndex(m => m.uniqueId === member.uniqueId);
    if (existingIndex >= 0) {
      members[existingIndex] = member;
    } else {
      members.push(member);
    }
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    return member;
  },

  updateMember: (uniqueId, updates) => {
    const members = storageService.getMembers();
    const index = members.findIndex(m => m.uniqueId === uniqueId);
    if (index >= 0) {
      members[index] = { ...members[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
      return members[index];
    }
    return null;
  },

  deleteMember: (uniqueId) => {
    const members = storageService.getMembers();
    const filtered = members.filter(m => m.uniqueId !== uniqueId);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(filtered));
  },

  // Payment operations
  getPayments: () => {
    const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return data ? JSON.parse(data) : [];
  },

  savePayment: (payment) => {
    const payments = storageService.getPayments();
    payments.push({
      ...payment,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    return payment;
  },

  getMemberPayments: (uniqueId) => {
    const payments = storageService.getPayments();
    return payments.filter(p => p.uniqueId === uniqueId);
  },
};
