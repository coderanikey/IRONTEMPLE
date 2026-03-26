import bcrypt from 'bcryptjs';
import connectDB from '../../../lib/mongodb';
import AppConfig from '../../../models/AppConfig';
import { requireAuth, setCorsHeaders, handleCorsPreFlight } from '../../../lib/auth';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (handleCorsPreFlight(req, res)) {
    return res.status(200).end();
  }

  const session = requireAuth(req);
  if (!session?.userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!session?.isAdmin) return res.status(403).json({ message: 'Forbidden' });

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  // Invite key is hardcoded (per request). Keep endpoint but make it explicit.
  return res.status(410).json({
    message: 'Invite key is hardcoded in the codebase. Change it in source and redeploy.',
  });

  const newKey = String(req.body?.inviteKey || '').trim();
  if (!newKey || newKey.length < 4) {
    return res.status(400).json({ message: 'Invite key must be at least 4 characters' });
  }

  await connectDB();
  const inviteKeyHash = await bcrypt.hash(newKey, 12);
  await AppConfig.findOneAndUpdate(
    { key: 'main' },
    { key: 'main', inviteKeyHash },
    { upsert: true, new: true }
  );

  return res.status(200).json({ ok: true });
}

