import express from 'express';
import Payment from '../models/Payment.js';
import Member from '../models/Member.js';

const router = express.Router();

// Get all payments
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payments for a specific member
router.get('/member/:uniqueId', async (req, res) => {
  try {
    const payments = await Payment.find({ uniqueId: req.params.uniqueId })
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new payment
router.post('/', async (req, res) => {
  try {
    const { uniqueId, amount, months, paymentDate, nextDueDate } = req.body;

    // Verify member exists
    const member = await Member.findOne({ uniqueId });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Create payment record
    const payment = new Payment({
      uniqueId,
      memberName: member.name,
      amount,
      months,
      paymentDate: new Date(paymentDate),
      nextDueDate: new Date(nextDueDate)
    });

    await payment.save();

    // Update member's payment information
    member.lastPaymentDate = new Date(paymentDate);
    member.nextDueDate = new Date(nextDueDate);
    member.isActive = true;
    member.isDiscontinued = false;
    await member.save();

    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
