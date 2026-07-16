import Member from '../models/Member.js';
import Attendance from '../models/Attendance.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';

// @desc    Get dashboard numbers and chart coordinates
// @route   GET /api/reports/dashboard
// @access  Private
export const getDashboardData = async (req, res) => {
  try {
    // 1. Gather numerical metrics
    const totalMembers = await Member.countDocuments({});
    const activeMembers = await Member.countDocuments({ status: 'Active' });
    const expiredMembers = await Member.countDocuments({ status: 'Expired' });
    const expiringMembers = await Member.countDocuments({ status: 'Expiring Soon' });

    // Today's attendance
    const todayDateStr = new Date().toLocaleDateString('en-CA');
    const todayAttendance = await Attendance.countDocuments({ date: todayDateStr });

    // Present & Absent & Attendance Rate Calculations
    const activeAndExpiringCount = await Member.countDocuments({ status: { $in: ['Active', 'Expiring Soon'] } });
    const presentToday = todayAttendance; // unique checkins per day
    const absentToday = Math.max(0, activeAndExpiringCount - presentToday);
    const attendanceRate = activeAndExpiringCount > 0 ? Math.round((presentToday / activeAndExpiringCount) * 100) : 0;
    const totalCheckinsToday = todayAttendance;

    // Revenue metrics
    const today = new Date();
    today.setHours(0,0,0,0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const payments = await Payment.find({});
    let monthlyRevenue = 0;
    payments.forEach(p => {
      if (new Date(p.paymentDate) >= firstDayOfMonth) {
        monthlyRevenue += p.amountPaid;
      }
    });

    // Sum pending payments
    const pendingAggregation = await Member.aggregate([
      { $group: { _id: null, totalPending: { $sum: '$feesPending' } } }
    ]);
    const pendingPayments = pendingAggregation.length > 0 ? pendingAggregation[0].totalPending : 0;

    // Unread notifications
    const unreadNotificationsCount = await Notification.countDocuments({ readStatus: false });

    // 2. Fetch data for Income Chart (grouped by month of current year)
    const currentYear = today.getFullYear();
    const monthlyIncomeData = Array.from({ length: 12 }, (_, idx) => ({
      month: new Date(currentYear, idx).toLocaleString('default', { month: 'short' }),
      income: 0
    }));

    payments.forEach(p => {
      const pDate = new Date(p.paymentDate);
      if (pDate.getFullYear() === currentYear) {
        const mIndex = pDate.getMonth();
        monthlyIncomeData[mIndex].income += p.amountPaid;
      }
    });

    // 3. Fetch Member Growth (new members joined per month)
    const memberGrowthData = Array.from({ length: 12 }, (_, idx) => ({
      month: new Date(currentYear, idx).toLocaleString('default', { month: 'short' }),
      registrations: 0
    }));

    const members = await Member.find({});
    members.forEach(m => {
      const jDate = new Date(m.joiningDate);
      if (jDate.getFullYear() === currentYear) {
        const mIndex = jDate.getMonth();
        memberGrowthData[mIndex].registrations += 1;
      }
    });

    // 4. Attendance analytics (last 7 active days counts)
    const attendanceLogs = await Attendance.find({});
    const attendanceCounts = {};
    attendanceLogs.forEach(log => {
      attendanceCounts[log.date] = (attendanceCounts[log.date] || 0) + 1;
    });

    const attendanceChartData = Object.keys(attendanceCounts).map(date => ({
      date,
      count: attendanceCounts[date]
    })).sort((a,b) => new Date(a.date) - new Date(b.date)).slice(-7);

    // 5. Workout popularity analytics (All-time or last 30 days)
    const workoutCounts = {};
    attendanceLogs.forEach(log => {
      const w = log.workout || 'None';
      if (w !== 'None') {
        workoutCounts[w] = (workoutCounts[w] || 0) + 1;
      }
    });
    const workoutAnalytics = Object.keys(workoutCounts).map(name => ({
      name,
      value: workoutCounts[name]
    }));

    // 6. Most Active Members
    const activeAgg = await Attendance.aggregate([
      { $group: { _id: '$member', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const mostActiveMembers = [];
    for (const item of activeAgg) {
      const m = await Member.findById(item._id).populate('plan');
      if (m) {
        mostActiveMembers.push({
          fullName: m.fullName,
          memberId: m.memberId,
          pin: m.pin,
          planName: m.plan?.name || 'N/A',
          visits: item.count
        });
      }
    }

    res.json({
      metrics: {
        totalMembers,
        activeMembers,
        expiredMembers,
        expiringMembers,
        todayAttendance,
        presentToday,
        absentToday,
        attendanceRate,
        totalCheckinsToday,
        monthlyRevenue,
        pendingPayments,
        unreadNotificationsCount
      },
      charts: {
        monthlyIncome: monthlyIncomeData,
        memberGrowth: memberGrowthData,
        attendanceAnalytics: attendanceChartData,
        workoutAnalytics,
        mostActiveMembers
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate tabular data for various exports/reports
// @route   GET /api/reports/export/:type
// @access  Private
export const getReportData = async (req, res) => {
  const { type } = req.params;

  try {
    if (type === 'attendance') {
      const data = await Attendance.find({})
        .populate('member')
        .sort({ date: -1, checkInTime: -1 });

      const report = data.map(log => ({
        'Member Name': log.member?.fullName || 'N/A',
        'Member ID': log.member?.memberId || 'N/A',
        'PIN': log.member?.pin || 'N/A',
        'Check-In Date': log.date,
        'Check-In Time': log.checkInTime,
        'Workout Performed': log.workout || 'None',
        'Custom Details': log.customWorkout || '',
        'Attendance Status': 'Present'
      }));

      return res.json(report);
    }

    if (type === 'income') {
      const data = await Payment.find({})
        .populate('member')
        .populate('plan')
        .sort({ paymentDate: -1 });

      const report = data.map(p => ({
        'Receipt No': p.receiptNumber,
        'Member Name': p.member?.fullName || 'N/A',
        'Member ID': p.member?.memberId || 'N/A',
        'Plan Subscribed': p.plan?.name || 'N/A',
        'Amount Paid ($)': p.amountPaid,
        'Amount Pending ($)': p.amountPending,
        'Payment Date': new Date(p.paymentDate).toLocaleDateString(),
        'Payment Method': p.paymentMethod
      }));

      return res.json(report);
    }

    if (type === 'expired') {
      const data = await Member.find({ status: 'Expired' }).populate('plan');
      
      const report = data.map(m => ({
        'Member Name': m.fullName,
        'Member ID': m.memberId,
        'PIN': m.pin,
        'Mobile Number': m.mobile,
        'Expiry Date': new Date(m.expiryDate).toLocaleDateString(),
        'Pending Amount ($)': m.feesPending
      }));

      return res.json(report);
    }

    if (type === 'payments') {
      const data = await Member.find({}).populate('plan');
      
      const report = data.map(m => ({
        'Member Name': m.fullName,
        'Member ID': m.memberId,
        'Plan Subscribed': m.plan?.name || 'N/A',
        'Total Fees ($)': m.feesTotal,
        'Fees Paid ($)': m.feesPaid,
        'Fees Pending ($)': m.feesPending,
        'Payment Status': m.paymentStatus,
        'Membership Status': m.status
      }));

      return res.json(report);
    }

    res.status(400).json({ message: 'Invalid report type requested' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
