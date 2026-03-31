import bcrypt from 'bcryptjs';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import { setCorsHeaders, handleCorsPreFlight } from '../../../lib/auth';

// HARD-CODED (same as registration)
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

    const { email, inviteKey, newPassword } = req.body || {};

    // Validate input
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const rawInviteKey = String(inviteKey || '').trim();
    const rawPassword = String(newPassword || '');

    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    if (!rawInviteKey) {
      return res.status(400).json({ message: 'Invite key is required' });
    }

    if (!rawPassword || rawPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Verify invite key matches (same as registration)
    if (rawInviteKey !== INVITE_KEY) {
      return res.status(403).json({ message: 'Invalid invite key' });
    }

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(rawPassword, 12);

    // Update user password
    user.passwordHash = passwordHash;
    await user.save();

    return res.status(200).json({
      message: 'Password reset successful',
      email: user.email
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ message: 'Reset failed', error: error.message });
  }
}
