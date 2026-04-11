import connectDB from '../../../lib/mongodb';
import Member from '../../../models/Member';
import { requireAuth, setCorsHeaders, handleCorsPreFlight } from '../../../lib/auth';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (handleCorsPreFlight(req, res)) {
    return res.status(200).end();
  }

  const session = requireAuth(req);
  if (!session?.userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    await connectDB();
  } catch (error) {
    const status = Number(error?.publicStatus || 503);
    return res.status(status).json({
      message: error?.publicMessage || 'Database unavailable',
      hint: error?.publicHint || 'Check MongoDB Atlas Network Access (IP allowlist) and connection string.',
    });
  }

  if (req.method === 'GET') {
    try {
      const members = await Member.find().sort({ createdAt: -1 });
      return res.status(200).json(members);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const phoneRaw = String(body.mobileNumber || body.phone || '').trim();
      const phone = phoneRaw.replace(/\D/g, '');

      // Unique ID must be the phone number (10 digits)
      if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
      }

      // Clean up aadharNumber - convert empty string to undefined (so sparse index works properly)
      const aadharRaw = String(body.aadharNumber || '').trim();
      if (aadharRaw && !/^\d{12}$/.test(aadharRaw)) {
        return res.status(400).json({ message: 'Aadhar number must be exactly 12 digits' });
      }

      body.uniqueId = phone;
      body.idType = 'mobile';
      body.mobileNumber = phone;
      body.phone = body.phone || phone;
      body.aadharNumber = aadharRaw || undefined; // Set to undefined instead of empty string

      // Check if member with same phone number already exists
      const existingMember = await Member.findOne({
        mobileNumber: phone
      });

      if (existingMember) {
        return res.status(400).json({ 
          message: `Member with phone number ${phone} already exists. Existing member: ${existingMember.name} (ID: ${existingMember.uniqueId})`,
          code: 'DUPLICATE_PHONE',
          existingMember: {
            uniqueId: existingMember.uniqueId,
            name: existingMember.name,
            phone: existingMember.mobileNumber,
            email: existingMember.email
          }
        });
      }

      const member = new Member(body);
      await member.save();
      return res.status(201).json(member);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ 
          message: 'Duplicate entry. Member with this information already exists.' 
        });
      }
      return res.status(400).json({ message: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: `Method ${req.method} not allowed` });
}
