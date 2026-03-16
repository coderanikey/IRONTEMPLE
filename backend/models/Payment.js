import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  uniqueId: {
    type: String,
    required: true,
    index: true,
    ref: 'Member'
  },
  memberName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  months: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  paymentDate: {
    type: Date,
    required: true,
    index: true
  },
  nextDueDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index for member payments query
paymentSchema.index({ uniqueId: 1, createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
