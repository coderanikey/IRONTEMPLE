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

  await connectDB();

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
      // Check if member with same uniqueId, aadhar, or mobile already exists
      const existingMember = await Member.findOne({
        $or: [
          { uniqueId: req.body.uniqueId },
          { aadharNumber: req.body.aadharNumber },
          { mobileNumber: req.body.mobileNumber }
        ]
      });

      if (existingMember) {
        return res.status(400).json({ 
          message: 'Member with this ID already exists',
          existingMember 
        });
      }

      const member = new Member(req.body);
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
