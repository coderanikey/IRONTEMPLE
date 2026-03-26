import connectDB from '../../../lib/mongodb';
import Member from '../../../models/Member';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const phone = String(req.query.phone || '').trim();
  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ message: 'Phone must be 10 digits' });
  }

  await connectDB();

  const member = await Member.findOne({
    $or: [{ phone }, { mobileNumber: phone }],
  }).select('name isActive isDiscontinued nextDueDate');

  if (!member) {
    return res.status(200).json({ found: false });
  }

  const validTill = member.nextDueDate ? new Date(member.nextDueDate) : null;
  const now = new Date();
  const isValid =
    Boolean(member.isActive) &&
    !Boolean(member.isDiscontinued) &&
    validTill &&
    validTill >= now;

  return res.status(200).json({
    found: true,
    memberName: member.name,
    isValid,
    validTill: validTill ? validTill.toISOString().slice(0, 10) : null,
  });
}

