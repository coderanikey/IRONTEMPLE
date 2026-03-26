import bcrypt from 'bcryptjs';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import AppConfig from '../../../models/AppConfig';
import { setAuthCookie, signAuthToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    await connectDB();
    const { email, password, inviteKey } = req.body || {};

    const rawInviteKey = String(inviteKey || '').trim();
    if (!rawInviteKey) {
      return res.status(400).json({ message: 'Invite key is required' });
    }

    const normalizedEmail = String(email || '').trim().toLowerCase().replace(/\^/g, '');
    const rawPassword = String(password || '');

    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    if (!rawPassword || rawPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const userCount = await User.countDocuments();

    // Invite key comes from DB (Atlas). If not set yet, first registration initializes it.
    const cfg = await AppConfig.findOne({ key: 'main' });
    if (!cfg) {
      if (userCount !== 0) {
        return res.status(500).json({ message: 'Server misconfigured: invite key not initialized' });
      }
      const inviteKeyHash = await bcrypt.hash(rawInviteKey, 12);
      await AppConfig.create({ key: 'main', inviteKeyHash });
    } else {
      const ok = await bcrypt.compare(rawInviteKey, cfg.inviteKeyHash);
      if (!ok) {
        return res.status(403).json({ message: 'Invalid invite key' });
      }
    }

    const passwordHash = await bcrypt.hash(rawPassword, 12);

    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      isAdmin: userCount === 0, // first user becomes admin
    });

    const token = signAuthToken({
      userId: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin,
    });
    setAuthCookie(res, token);

    return res.status(201).json({
      user: { id: user._id.toString(), email: user.email, isAdmin: user.isAdmin },
    });
  } catch (err) {
    const msg = String(err?.message || 'Internal Server Error');
    if (msg.includes('ECONNREFUSED') || msg.toLowerCase().includes('serverselection')) {
      return res.status(500).json({
        message: 'Database connection failed. Set MONGODB_URI to your MongoDB Atlas URI or start local MongoDB on 27017.',
      });
    }
    return res.status(500).json({ message: msg });
  }
}

