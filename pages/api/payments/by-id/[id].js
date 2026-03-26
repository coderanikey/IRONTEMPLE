import connectDB from '../../../../lib/mongodb';
import Payment from '../../../../models/Payment';
import { requireAuth, setCorsHeaders, handleCorsPreFlight } from '../../../../lib/auth';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (handleCorsPreFlight(req, res)) {
    return res.status(200).end();
  }

  const session = requireAuth(req);
  if (!session?.userId) return res.status(401).json({ message: 'Unauthorized' });

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  await connectDB();
  const { id } = req.query;
  const payment = await Payment.findById(id);
  if (!payment) return res.status(404).json({ message: 'Receipt not found' });
  return res.status(200).json(payment);
}

