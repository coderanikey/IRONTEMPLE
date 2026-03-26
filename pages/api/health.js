import { setCorsHeaders, handleCorsPreFlight } from '../../lib/auth';

export default function handler(req, res) {
  setCorsHeaders(res);

  if (handleCorsPreFlight(req, res)) {
    return res.status(200).end();
  }

  res.status(200).json({ 
    status: 'ok', 
    message: 'IRON TEMPLE API is running',
    timestamp: new Date().toISOString()
  });
}
