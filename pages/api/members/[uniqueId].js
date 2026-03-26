import connectDB from '../../../lib/mongodb';
import Member from '../../../models/Member';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req, res) {
  const session = requireAuth(req);
  if (!session?.userId) return res.status(401).json({ message: 'Unauthorized' });

  await connectDB();
  const { uniqueId } = req.query;

  if (req.method === 'GET') {
    try {
      const member = await Member.findOne({ uniqueId });
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }
      return res.status(200).json(member);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const member = await Member.findOneAndUpdate(
        { uniqueId },
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }

      return res.status(200).json(member);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ 
          message: 'Duplicate entry. Member with this information already exists.' 
        });
      }
      return res.status(400).json({ message: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const member = await Member.findOneAndDelete({ uniqueId });
      
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }

      return res.status(200).json({ message: 'Member deleted successfully', member });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).json({ message: `Method ${req.method} not allowed` });
}
