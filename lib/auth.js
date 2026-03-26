import jwt from 'jsonwebtoken';

const TOKEN_COOKIE_NAME = 'it_token';
const DEFAULT_JWT_SECRET = 'iron-temple-dev-secret-change-this';

function requireJwtSecret() {
  return process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
}

export function signAuthToken(payload) {
  const secret = requireJwtSecret();
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyAuthToken(token) {
  const secret = requireJwtSecret();
  return jwt.verify(token, secret);
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

