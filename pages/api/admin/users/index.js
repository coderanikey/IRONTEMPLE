import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { requireAuth, setCorsHeaders, handleCorsPreFlight } from '../../../../lib/auth';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (handleCorsPreFlight(req, res)) {
    return res.status(200).end();
  }

  const session = requireAuth(req);
  if (!session?.userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!session?.isAdmin) return res.status(403).json({ message: 'Forbidden' });

  try {
    await connectDB();
  } catch (error) {
    const status = Number(error?.publicStatus || 503);
    return res.status(status).json({
      message: error?.publicMessage || 'Database unavailable',
      hint: error?.publicHint || 'Check MongoDB Atlas Network Access (IP allowlist) and connection string.',
    });
  }

  if (req.method === 'GET') {
    const users = await User.find().select('email isAdmin createdAt').sort({ createdAt: -1 });
    return res.status(200).json(
      users.map((u) => ({
        id: u._id.toString(),
        email: u.email,
        isAdmin: u.isAdmin,
        createdAt: u.createdAt,
      }))
    );
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ message: `Method ${req.method} not allowed` });
}

