import connectDB from '../../../lib/mongodb';
import Payment from '../../../models/Payment';
import Member from '../../../models/Member';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req, res) {
  const session = requireAuth(req);
  if (!session?.userId) return res.status(401).json({ message: 'Unauthorized' });

  await connectDB();

  if (req.method === 'GET') {
    try {
      const payments = await Payment.find().sort({ createdAt: -1 });
      return res.status(200).json(payments);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { uniqueId, amount, months, paymentDate, nextDueDate, paymentMethod = 'cash' } = req.body;

      // Verify member exists
      const member = await Member.findOne({ uniqueId });
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }

      // Keep only the latest payment record (remove old ones)
      await Payment.deleteMany({ uniqueId });

      // Create payment record
      const payment = new Payment({
        uniqueId,
        memberName: member.name,
        amount,
        months,
        paymentMethod,
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

      return res.status(201).json(payment);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: `Method ${req.method} not allowed` });
}
