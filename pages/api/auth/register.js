import bcrypt from 'bcryptjs';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import { setAuthCookie, signAuthToken, setCorsHeaders, handleCorsPreFlight } from '../../../lib/auth';

// HARD-CODED (as requested)
const INVITE_KEY = 'Aniket Parkash';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (handleCorsPreFlight(req, res)) {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    try {
      await connectDB();
    } catch (error) {
      const status = Number(error?.publicStatus || 503);
      return res.status(status).json({
        message: error?.publicMessage || 'Database unavailable',
        hint: error?.publicHint || 'Check MongoDB Atlas Network Access (IP allowlist) and connection string.',
      });
    }
    const { email, password, inviteKey } = req.body || {};

    const rawInviteKey = String(inviteKey || '').trim();
    if (!rawInviteKey) {
      return res.status(400).json({ message: 'Invite key is required' });
    }

    // Hardcoded invite key check
    if (rawInviteKey !== INVITE_KEY) {
      return res.status(403).json({ message: 'Invalid invite key' });
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
    const isAdmin = userCount === 0;

    const passwordHash = await bcrypt.hash(rawPassword, 12);
    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      isAdmin,
    });

    const token = signAuthToken({
      userId: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin,
    });
    setAuthCookie(res, token);

    return res.status(201).json({
      user: { id: user._id.toString(), email: user.email, isAdmin: user.isAdmin },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
}


