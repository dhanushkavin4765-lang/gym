import Payment from '../models/Payment.js';
import Member from '../models/Member.js';
import Plan from '../models/Plan.js';
import Notification from '../models/Notification.js';
import { calculateStatusAndDays } from '../utils/membershipHelper.js';

// @desc    Record a new payment or process renewal
// @route   POST /api/payments
// @access  Private
export const createPayment = async (req, res) => {
  const { memberId, amountPaid, paymentMethod, type, planId } = req.body;

  try {
    const member = await Member.findById(memberId).populate('plan');
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const paidVal = Number(amountPaid) || 0;
    const receiptNumber = `REC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    if (type === 'renewal') {
      // 1. Membership Renewal logic (updating plan / extending expiry date)
      const targetPlanId = planId || member.plan._id;
      const plan = await Plan.findById(targetPlanId);
      if (!plan) {
        return res.status(404).json({ message: 'Selected plan not found' });
      }

      // If member is already active, extend from the current expiry. Otherwise, start renewal from today.
      const now = new Date();
      const currentExpiry = new Date(member.expiryDate);
      let newStartDate = now;
      
      if (currentExpiry > now && member.status !== 'Expired') {
        newStartDate = currentExpiry; // Add onto existing time
      }

      const newExpiryDate = new Date(newStartDate);
      newExpiryDate.setMonth(newExpiryDate.getMonth() + plan.durationMonths);

      // Reset values for the new cycle
      const totalFees = plan.feeAmount;
      const pendingFees = Math.max(0, totalFees - paidVal);

      let newPaymentStatus = 'Pending';
      if (paidVal >= totalFees) {
        newPaymentStatus = 'Paid';
      } else if (paidVal > 0) {
        newPaymentStatus = 'Partially Paid';
      }

      // Recalculate status
      const { status: newStatus } = calculateStatusAndDays(newExpiryDate);

      // Update Member details
      member.plan = plan._id;
      member.joiningDate = newStartDate;
      member.expiryDate = newExpiryDate;
      member.durationMonths = plan.durationMonths;
      member.feesTotal = totalFees;
      member.feesPaid = paidVal;
      member.feesPending = pendingFees;
      member.paymentStatus = newPaymentStatus;
      member.status = newStatus;

      await member.save();

      // Create Payment log
      const payment = await Payment.create({
        member: member._id,
        plan: plan._id,
        amountPaid: paidVal,
        amountPending: pendingFees,
        paymentMethod: paymentMethod || 'Cash',
        receiptNumber,
      });

      // Clear any previous "Expired" notifications for this member
      await Notification.deleteMany({ member: member._id, type: { $in: ['Expired', 'Expiring Soon'] } });

      return res.status(201).json({
        message: 'Membership renewed successfully!',
        payment,
        member
      });

    } else {
      // 2. Standard Payment (paying outstanding fees on current cycle)
      const newPaid = member.feesPaid + paidVal;
      const totalFees = member.feesTotal;
      const pendingFees = Math.max(0, totalFees - newPaid);

      let newPaymentStatus = 'Pending';
      if (newPaid >= totalFees) {
        newPaymentStatus = 'Paid';
      } else if (newPaid > 0) {
        newPaymentStatus = 'Partially Paid';
      }

      member.feesPaid = newPaid;
      member.feesPending = pendingFees;
      member.paymentStatus = newPaymentStatus;

      await member.save();

      // Create Payment log
      const payment = await Payment.create({
        member: member._id,
        plan: member.plan._id,
        amountPaid: paidVal,
        amountPending: pendingFees,
        paymentMethod: paymentMethod || 'Cash',
        receiptNumber,
      });

      return res.status(201).json({
        message: 'Payment recorded successfully!',
        payment,
        member
      });
    }

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate('member')
      .populate('plan')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payments for specific member
// @route   GET /api/payments/member/:memberId
// @access  Private
export const getMemberPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ member: req.params.memberId })
      .populate('plan')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get invoice / payment receipt details
// @route   GET /api/payments/receipt/:receiptNumber
// @access  Private
export const getReceiptDetails = async (req, res) => {
  try {
    const payment = await Payment.findOne({ receiptNumber: req.params.receiptNumber })
      .populate({
        path: 'member',
        populate: { path: 'plan' }
      })
      .populate('plan');

    if (!payment) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get collection metrics (Monthly, Today's, Total)
// @route   GET /api/payments/metrics
// @access  Private
export const getCollectionMetrics = async (req, res) => {
  try {
    const allPayments = await Payment.find({});
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    let todayCollection = 0;
    let monthlyCollection = 0;
    let totalRevenue = 0;

    allPayments.forEach(p => {
      const pDate = new Date(p.paymentDate);
      totalRevenue += p.amountPaid;
      
      if (pDate >= today) {
        todayCollection += p.amountPaid;
      }
      
      if (pDate >= startOfMonth) {
        monthlyCollection += p.amountPaid;
      }
    });

    res.json({
      todayCollection,
      monthlyCollection,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
