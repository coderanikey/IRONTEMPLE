import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { requireAuth } from '../../../../lib/auth';

export default async function handler(req, res) {
  const session = requireAuth(req);
  if (!session?.userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!session?.isAdmin) return res.status(403).json({ message: 'Forbidden' });

  await connectDB();

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

