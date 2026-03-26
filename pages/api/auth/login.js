import bcrypt from 'bcryptjs';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import { setAuthCookie, signAuthToken, setCorsHeaders, handleCorsPreFlight } from '../../../lib/auth';

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
  } catch (error) {
    const status = Number(error?.publicStatus || 503);
    return res.status(status).json({
      message: error?.publicMessage || 'Database unavailable',
      hint: error?.publicHint || 'Check MongoDB Atlas Network Access (IP allowlist) and connection string.',
    });
  }

  const { email, password } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase().replace(/\^/g, '');
  const rawPassword = String(password || '');

  if (!normalizedEmail || !rawPassword) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(rawPassword, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signAuthToken({
    userId: user._id.toString(),
    email: user.email,
    isAdmin: user.isAdmin,
  });
  setAuthCookie(res, token);

  return res.status(200).json({
    user: { id: user._id.toString(), email: user.email, isAdmin: user.isAdmin },
  });
}

