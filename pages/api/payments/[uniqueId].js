import connectDB from '../../../lib/mongodb';
import Payment from '../../../models/Payment';
import { requireAuth, setCorsHeaders, handleCorsPreFlight } from '../../../lib/auth';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (handleCorsPreFlight(req, res)) {
    return res.status(200).end();
  }

  const session = requireAuth(req);
  if (!session?.userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    await connectDB();
  } catch (error) {
    const status = Number(error?.publicStatus || 503);
    return res.status(status).json({
      message: error?.publicMessage || 'Database unavailable',
      hint: error?.publicHint || 'Check MongoDB Atlas Network Access (IP allowlist) and connection string.',
    });
  }
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
