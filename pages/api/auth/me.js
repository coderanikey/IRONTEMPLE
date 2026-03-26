import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import { requireAuth, setCorsHeaders, handleCorsPreFlight } from '../../../lib/auth';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (handleCorsPreFlight(req, res)) {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const session = requireAuth(req);
  if (!session?.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await connectDB();
  const user = await User.findById(session.userId).select('email isAdmin');
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return res.status(200).json({
    user: { id: user._id.toString(), email: user.email, isAdmin: user.isAdmin },
  });
}

