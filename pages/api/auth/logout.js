import { clearAuthCookie, setCorsHeaders, handleCorsPreFlight } from '../../../lib/auth';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (handleCorsPreFlight(req, res)) {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  clearAuthCookie(res);
  return res.status(200).json({ ok: true });
}

