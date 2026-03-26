import bcrypt from 'bcryptjs';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import { setAuthCookie, signAuthToken, setCorsHeaders, handleCorsPreFlight } from '../../../lib/auth';

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
    await connectDB();
    const { email, password, inviteKey } = req.body || {};

    const rawInviteKey = String(inviteKey || '').trim();
    if (!rawInviteKey) {
      return res.status(400).json({ message: 'Invite key is required' });
    }

    // Verify against hardcoded invite key
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
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Registration failed', error: error.message });
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

