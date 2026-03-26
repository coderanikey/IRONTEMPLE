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
  const { id } = req.query;

  if (req.method === 'DELETE') {
    if (String(id) === String(session.userId)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', ['DELETE']);
  return res.status(405).json({ message: `Method ${req.method} not allowed` });
}

