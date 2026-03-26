import jwt from 'jsonwebtoken';

const TOKEN_COOKIE_NAME = 'it_token';
// HARD-CODED (as requested)
const JWT_SECRET = 'change_me_to_a_long_random_secret';

export function signAuthToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAuthToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function getAuthTokenFromReq(req) {
  const cookieToken = req?.cookies?.[TOKEN_COOKIE_NAME] || null;
  if (cookieToken) return cookieToken;

  const authHeader = req?.headers?.authorization || req?.headers?.Authorization || '';
  const m = String(authHeader).match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
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

