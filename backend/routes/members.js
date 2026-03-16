import express from 'express';
import Member from '../models/Member.js';

const router = express.Router();

// Get all members
router.get('/', async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get member by uniqueId
router.get('/:uniqueId', async (req, res) => {
  try {
    const member = await Member.findOne({ uniqueId: req.params.uniqueId });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new member
router.post('/', async (req, res) => {
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
    res.status(201).json(member);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate entry. Member with this information already exists.' 
      });
    }
    res.status(400).json({ message: error.message });
  }
});

// Update member
router.put('/:uniqueId', async (req, res) => {
  try {
    const member = await Member.findOneAndUpdate(
      { uniqueId: req.params.uniqueId },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate entry. Member with this information already exists.' 
      });
    }
    res.status(400).json({ message: error.message });
  }
});

// Delete member
router.delete('/:uniqueId', async (req, res) => {
  try {
    const member = await Member.findOneAndDelete({ uniqueId: req.params.uniqueId });
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({ message: 'Member deleted successfully', member });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
