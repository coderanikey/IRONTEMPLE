import connectDB from '../../../lib/mongodb';
import Payment from '../../../models/Payment';

export default async function handler(req, res) {
  await connectDB();
  const { uniqueId } = req.query;

  if (req.method === 'GET') {
    try {
      const payments = await Payment.find({ uniqueId }).sort({ createdAt: -1 });
      return res.status(200).json(payments);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ message: `Method ${req.method} not allowed` });
}
