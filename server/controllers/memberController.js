import Member from '../models/Member.js';
import Plan from '../models/Plan.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import { calculateStatusAndDays } from '../utils/membershipHelper.js';

// Auto-generate a unique 4-digit PIN
const generateUniquePIN = async () => {
  let pin;
  let isUnique = false;
  let attempts = 0;
  while (!isUnique && attempts < 100) {
    pin = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit pin between 1000 and 9999
    const existing = await Member.findOne({ pin });
    if (!existing) isUnique = true;
    attempts++;
  }
  return pin;
};

// Auto-generate a unique Member ID
const generateUniqueMemberId = async () => {
  let memberId;
  let isUnique = false;
  let attempts = 0;
  while (!isUnique && attempts < 100) {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digits
    memberId = `GYM-${randomNum}`;
    const existing = await Member.findOne({ memberId });
    if (!existing) isUnique = true;
    attempts++;
  }
  return memberId;
};

// @desc    Register a new member
// @route   POST /api/members
// @access  Private
export const registerMember = async (req, res) => {
  const {
    fullName,
    mobile,
    gender,
    age,
    address,
    height,
    weight,
    emergencyContact,
    planId,
    joiningDate,
    feesPaid,
    paymentMethod,
    photo
  } = req.body;

  try {
    // Fetch Plan Details
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Selected plan not found' });
    }

    const memberId = await generateUniqueMemberId();
    const pin = await generateUniquePIN();

    const joinDateObj = joiningDate ? new Date(joiningDate) : new Date();
    
    // Calculate Expiry Date
    const expiryDateObj = new Date(joinDateObj);
    expiryDateObj.setMonth(expiryDateObj.getMonth() + plan.durationMonths);

    // Calculate status and remaining days
    const { status, remainingDays } = calculateStatusAndDays(expiryDateObj);

    // Calculate pending fees
    const totalFees = plan.feeAmount;
    const paidFees = Number(feesPaid) || 0;
    const pendingFees = Math.max(0, totalFees - paidFees);
    
    let paymentStatus = 'Pending';
    if (paidFees >= totalFees) {
      paymentStatus = 'Paid';
    } else if (paidFees > 0) {
      paymentStatus = 'Partially Paid';
    }

    const member = new Member({
      memberId,
      pin,
      fullName,
      mobile,
      gender,
      age: Number(age),
      address,
      height: Number(height),
      weight: Number(weight),
      emergencyContact,
      plan: planId,
      joiningDate: joinDateObj,
      expiryDate: expiryDateObj,
      durationMonths: plan.durationMonths,
      feesTotal: totalFees,
      feesPaid: paidFees,
      feesPending: pendingFees,
      paymentStatus,
      photo,
      status,
      weightHistory: [{ weight: Number(weight), date: joinDateObj }]
    });

    const savedMember = await member.save();

    // If initial payment is made, log it
    if (paidFees > 0) {
      const receiptNumber = `REC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      await Payment.create({
        member: savedMember._id,
        plan: planId,
        amountPaid: paidFees,
        amountPending: pendingFees,
        paymentDate: joinDateObj,
        paymentMethod: paymentMethod || 'Cash',
        receiptNumber,
      });
    }

    // Check if notification is needed immediately (should not happen for brand new active members unless plan duration is 0 or backdated joining)
    if (status === 'Expired') {
      await Notification.create({
        type: 'Expired',
        member: savedMember._id,
        title: '🔴 Membership Expired',
        message: `Membership for ${savedMember.fullName} (ID: ${savedMember.memberId}) has expired on ${expiryDateObj.toLocaleDateString()}. Pending: $${pendingFees}.`
      });
    } else if (status === 'Expiring Soon') {
      await Notification.create({
        type: 'Expiring Soon',
        member: savedMember._id,
        title: '⚠️ Membership Expiring Soon',
        message: `Membership for ${savedMember.fullName} (ID: ${savedMember.memberId}) expires in ${remainingDays} days on ${expiryDateObj.toLocaleDateString()}.`
      });
    }

    res.status(201).json(savedMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all members (with simple query/filter support)
// @route   GET /api/members
// @access  Private
export const getMembers = async (req, res) => {
  try {
    const { status, plan } = req.query;
    let query = {};
    if (status) {
      query.status = status;
    }
    if (plan) {
      query.plan = plan;
    }

    const members = await Member.find(query).populate('plan');
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get member details by ID (including weight, payments and attendance)
// @route   GET /api/members/:id
// @access  Private
export const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).populate('plan');
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update member details
// @route   PUT /api/members/:id
// @access  Private
export const updateMember = async (req, res) => {
  const {
    fullName,
    mobile,
    gender,
    age,
    address,
    height,
    weight,
    emergencyContact,
    photo
  } = req.body;

  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.fullName = fullName || member.fullName;
    member.mobile = mobile || member.mobile;
    member.gender = gender || member.gender;
    member.age = age ? Number(age) : member.age;
    member.address = address || member.address;
    member.height = height ? Number(height) : member.height;
    member.emergencyContact = emergencyContact || member.emergencyContact;
    if (photo !== undefined) {
      member.photo = photo;
    }

    // Check if weight changed to update history
    if (weight && Number(weight) !== member.weight) {
      member.weight = Number(weight);
      member.weightHistory.push({
        weight: Number(weight),
        date: new Date()
      });
    }

    const updatedMember = await member.save();
    res.json(updatedMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Instant Search members (autocomplete)
// @route   GET /api/members/search
// @access  Private
export const searchMembers = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json([]);
  }

  try {
    // Search by MemberID, PIN, mobile, or Name (regex)
    const searchRegex = new RegExp(q, 'i');
    const members = await Member.find({
      $or: [
        { memberId: searchRegex },
        { pin: q },
        { mobile: searchRegex },
        { fullName: searchRegex }
      ]
    }).populate('plan');
    
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a member
// @route   DELETE /api/members/:id
// @access  Private
export const deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (member) {
      await member.deleteOne();
      res.json({ message: 'Member deleted successfully' });
    } else {
      res.status(404).json({ message: 'Member not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
