import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  uniqueId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  idType: {
    type: String,
    enum: ['aadhar', 'mobile'],
    required: true
  },
  aadharNumber: {
    type: String,
    sparse: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        return !v || /^\d{12}$/.test(v);
      },
      message: 'Aadhar number must be exactly 12 digits'
    }
  },
  mobileNumber: {
    type: String,
    sparse: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        return !v || /^\d{10}$/.test(v);
      },
      message: 'Mobile number must be exactly 10 digits'
    }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^\S+@\S+\.\S+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  address: {
    type: String,
    trim: true
  },
  monthlyFee: {
    type: Number,
    required: true,
    default: 1000,
    min: 0
  },
  joinDate: {
    type: Date,
    required: true
  },
  lastPaymentDate: {
    type: Date
  },
  nextDueDate: {
    type: Date,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isDiscontinued: {
    type: Boolean,
    default: false,
    index: true
  },
  discontinuedDate: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for pending payments query
memberSchema.index({ isActive: 1, isDiscontinued: 1, nextDueDate: 1 });

// Virtual for payment history
memberSchema.virtual('payments', {
  ref: 'Payment',
  localField: 'uniqueId',
  foreignField: 'uniqueId'
});

const Member = mongoose.model('Member', memberSchema);

export default Member;
