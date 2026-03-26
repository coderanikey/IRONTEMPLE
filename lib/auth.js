import jwt from 'jsonwebtoken';

const TOKEN_COOKIE_NAME = 'it_token';
const DEFAULT_DEV_SECRET = 'iron-temple-dev-secret-change-this';

function requireJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV !== 'production') return DEFAULT_DEV_SECRET;
  throw new Error(
    'Missing JWT_SECRET. Set it in Vercel Project Settings → Environment Variables.'
  );
}

export function signAuthToken(payload) {
  return jwt.sign(payload, requireJwtSecret(), { expiresIn: '7d' });
}

export function verifyAuthToken(token) {
  return jwt.verify(token, requireJwtSecret());
}

export function getAuthTokenFromReq(req) {
  return req?.cookies?.[TOKEN_COOKIE_NAME] || null;
}

export function setAuthCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production';
  const parts = [
    `${TOKEN_COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${60 * 60 * 24 * 7}`,
  ];
  if (secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function clearAuthCookie(res) {
  const secure = process.env.NODE_ENV === 'production';
  const parts = [
    `${TOKEN_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function requireAuth(req) {
  const token = getAuthTokenFromReq(req);
  if (!token) return null;
  try {
    return verifyAuthToken(token);
  } catch {
    return null;
  }
}

export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function handleCorsPreFlight(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return true;
  }
  return false;
}

