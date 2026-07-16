import Attendance from '../models/Attendance.js';
import Member from '../models/Member.js';
import Notification from '../models/Notification.js';
import { calculateStatusAndDays } from '../utils/membershipHelper.js';

// @desc    Mark attendance via PIN Entry Screen
// @route   POST /api/attendance/check-in
// @access  Public/Private (Can be called from check-in device/terminal)
export const markAttendanceByPIN = async (req, res) => {
  const { pin, memberId, workout, customWorkout } = req.body;

  if (!pin && !memberId) {
    return res.status(400).json({ message: 'PIN or Member ID is required' });
  }

  try {
    // 1. Fetch member details
    let member;
    if (memberId) {
      member = await Member.findOne({ memberId }).populate('plan');
    } else {
      member = await Member.findOne({ pin }).populate('plan');
    }

    if (!member) {
      return res.status(404).json({ message: 'No member found matching credentials' });
    }

    // 2. Re-calculate status and remaining days in real-time
    const { status, remainingDays } = calculateStatusAndDays(member.expiryDate);
    
    // Update DB status if it changed
    if (member.status !== status) {
      member.status = status;
      await member.save();
    }

    // 3. Business logic: block attendance if membership has expired
    if (status === 'Expired') {
      return res.status(403).json({
        allowed: false,
        message: 'Membership Expired. Please Renew Your Membership.',
        member: {
          fullName: member.fullName,
          memberId: member.memberId,
          photo: member.photo,
          planName: member.plan.name,
          expiryDate: member.expiryDate,
          feesPending: member.feesPending,
          status: 'Expired',
          remainingDays: 0,
        }
      });
    }

    // 4. Generate check-in details (local timezone date & time)
    const now = new Date();
    // YYYY-MM-DD
    const todayDate = now.toLocaleDateString('en-CA'); 
    // HH:MM:SS
    const checkInTime = now.toTimeString().split(' ')[0]; 

    // 5. No duplicate check-ins for the same day
    const existingCheckIn = await Attendance.findOne({
      member: member._id,
      date: todayDate,
    });

    if (existingCheckIn) {
      // Already checked-in today, return member profile details but indicate no new record
      return res.json({
        allowed: true,
        alreadyCheckedIn: true,
        message: 'Already Checked In Today!',
        member: {
          fullName: member.fullName,
          memberId: member.memberId,
          photo: member.photo,
          planName: member.plan.name,
          joiningDate: member.joiningDate,
          expiryDate: member.expiryDate,
          feesPending: member.feesPending,
          feesPaid: member.feesPaid,
          status: member.status,
          remainingDays,
          checkInTime: existingCheckIn.checkInTime,
          checkInDate: existingCheckIn.date
        }
      });
    }

    // 6. Record attendance
    const attendance = new Attendance({
      member: member._id,
      date: todayDate,
      checkInTime,
      workout: workout || 'None',
      customWorkout: customWorkout || '',
    });
    await attendance.save();

    // Create Notification
    const formatTimeAMPM = (timeStr) => {
      const [h, m] = timeStr.split(':');
      const hours = parseInt(h);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours.toString().padStart(2, '0')}:${m} ${ampm}`;
    };

    const formattedTime = formatTimeAMPM(checkInTime);
    const dateParts = todayDate.split('-');
    const formattedDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    await Notification.create({
      type: 'General',
      member: member._id,
      title: '🟢 New Attendance',
      message: `Member Name: ${member.fullName}\nMember ID: ${member.memberId}\nWorkout: ${workout || 'None'}\nCheck-in Time: ${formattedTime}\nDate: ${formattedDate}`
    });

    // 7. Compose success response and warning string if expiring within 7 days
    let warningMessage = null;
    if (status === 'Expiring Soon') {
      warningMessage = `Membership expires in ${remainingDays} days. Please renew soon.`;
    }

    res.json({
      allowed: true,
      alreadyCheckedIn: false,
      message: 'Check-in Successful! Welcome back.',
      warning: warningMessage,
      member: {
        fullName: member.fullName,
        memberId: member.memberId,
        photo: member.photo,
        planName: member.plan.name,
        joiningDate: member.joiningDate,
        expiryDate: member.expiryDate,
        feesPending: member.feesPending,
        feesPaid: member.feesPaid,
        status: member.status,
        remainingDays,
        checkInTime,
        checkInDate: todayDate
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's attendance log
// @route   GET /api/attendance/today
// @access  Private
export const getTodayAttendance = async (req, res) => {
  try {
    const todayDate = new Date().toLocaleDateString('en-CA');
    const logs = await Attendance.find({ date: todayDate })
      .populate({
        path: 'member',
        populate: { path: 'plan' }
      })
      .sort({ checkInTime: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get member's attendance logs
// @route   GET /api/attendance/member/:memberId
// @access  Private
export const getMemberAttendance = async (req, res) => {
  try {
    const member = await Member.findById(req.params.memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const logs = await Attendance.find({ member: member._id }).sort({ date: -1, checkInTime: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get monthly/weekly aggregates for charts
// @route   GET /api/attendance/analytics
// @access  Private
export const getAttendanceAnalytics = async (req, res) => {
  try {
    // Return last 7 days of attendance counts
    const logs = await Attendance.find({});
    
    // Group by date
    const dateCounts = {};
    logs.forEach(log => {
      dateCounts[log.date] = (dateCounts[log.date] || 0) + 1;
    });

    // Format for Recharts
    const analytics = Object.keys(dateCounts).map(date => ({
      date,
      count: dateCounts[date],
    })).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-15); // limit to last 15 days

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
