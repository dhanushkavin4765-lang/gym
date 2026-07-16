import React, { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import { NotificationContext } from '../context/NotificationContext';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  CalendarCheck2,
  DollarSign,
  AlertOctagon,
  Bell,
  RefreshCw,
  Activity,
  Dumbbell
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import GymLoader from '../components/GymLoader';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { notifications } = useContext(NotificationContext);

  // Filter check-in notifications for the live dashboard feed
  const checkInNotifs = notifications.filter(n => n.title === '🟢 New Attendance');

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const { data } = await API.get('/reports/dashboard');
      setMetrics(data.metrics);
      setCharts(data.charts);
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Poll metrics every 5 seconds for real-time updates without refreshing
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <GymLoader text="RETRIEVING ATHLETIC INSIGHTS..." color="var(--gold-primary)" />
      </div>
    );
  }

  // 8 Dynamic Stats Cards matching all requirements
  const statCards = [
    { title: 'Total Members', value: metrics?.totalMembers || 0, icon: Users, color: 'var(--gold-primary)' },
    { title: 'Active Members', value: metrics?.activeMembers || 0, icon: UserCheck, color: '#10b981' },
    { title: 'Members Expiring Soon', value: metrics?.expiringMembers || 0, icon: Clock, color: 'var(--status-warning)' },
    { title: 'Present Today', value: metrics?.presentToday || 0, icon: CalendarCheck2, color: '#10b981' },
    { title: 'Absent Today', value: metrics?.absentToday || 0, icon: UserX, color: 'var(--status-expired)' },
    { title: 'Attendance Rate', value: `${metrics?.attendanceRate || 0}%`, icon: Activity, color: '#3b82f6' },
    { title: 'Monthly Revenue', value: `$${metrics?.monthlyRevenue || 0}`, icon: DollarSign, color: '#10b981' },
    { title: 'Pending Payments', value: `$${metrics?.pendingPayments || 0}`, icon: AlertOctagon, color: 'var(--status-warning)' }
  ];

  const PIE_COLORS = ['#d4af37', '#c5a059', '#ffd700', '#daa520', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="gold-text" style={{ fontSize: '1.75rem', fontWeight: 600 }}>DASHBOARD OVERVIEW</h1>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>Real-time summaries of member activity, financials, and logs.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={refreshing}
          className="outline-btn"
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Grid of 8 stats cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}
      >
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -4 }}
            className="glass-panel"
            style={{
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Small glowing trace */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '100%',
              backgroundColor: card.color
            }} />

            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {card.title}
              </p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '8px', fontFamily: 'Space Grotesk' }}>
                {card.value}
              </h3>
            </div>

            <div style={{
              background: `rgba(255, 255, 255, 0.03)`,
              padding: '12px',
              borderRadius: '12px',
              color: card.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid rgba(197, 160, 89, 0.05)`
            }}>
              <card.icon size={24} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Panels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '24px',
        marginTop: '10px'
      }}>
        
        {/* Income Chart */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }} className="gold-text">MONTHLY INCOME ({new Date().getFullYear()})</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.monthlyIncome || []}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--gold-primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--gold-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(197, 160, 89, 0.05)" />
                <XAxis dataKey="month" stroke="var(--text-gray)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-gray)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-deep)',
                    borderColor: 'var(--border-glass)',
                    borderRadius: '8px',
                    color: 'var(--text-white)'
                  }}
                />
                <Area type="monotone" dataKey="income" stroke="var(--gold-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" name="Revenue ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member Growth Chart */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }} className="gold-text">MEMBER GROWTH HISTORY</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.memberGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(197, 160, 89, 0.05)" />
                <XAxis dataKey="month" stroke="var(--text-gray)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-gray)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-deep)',
                    borderColor: 'var(--border-glass)',
                    borderRadius: '8px',
                    color: 'var(--text-white)'
                  }}
                />
                <Bar dataKey="registrations" fill="var(--gold-secondary)" radius={[4, 4, 0, 0]} name="New Registrations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Analytics */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }} className="gold-text">DAILY ATTENDANCE LOG COUNT</h3>
          <div style={{ width: '100%', height: '260px' }}>
            {charts?.attendanceAnalytics && charts.attendanceAnalytics.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-gray)', fontSize: '0.85rem' }}>
                No check-in records logged yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts?.attendanceAnalytics || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(197, 160, 89, 0.05)" />
                  <XAxis dataKey="date" stroke="var(--text-gray)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-gray)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-deep)',
                      borderColor: 'var(--border-glass)',
                      borderRadius: '8px',
                      color: 'var(--text-white)'
                    }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} name="Check-ins" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Bottom panels: Live Feed, Workout popularities, Most Active */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        
        {/* Live Attendance Notifications Panel */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '350px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }} className="gold-text">
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }} />
            LIVE ATTENDANCE FEED
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
            {checkInNotifs.length === 0 ? (
              <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', textAlign: 'center', margin: 'auto' }}>
                Awaiting member check-ins...
              </p>
            ) : (
              checkInNotifs.map((notif) => (
                <div
                  key={notif._id}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.04)',
                    border: '1px solid rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>🟢 New Attendance</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-white)', whiteSpace: 'pre-line', lineHeight: '1.4' }}>{notif.message}</p>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-gray)', alignSelf: 'flex-end' }}>{new Date(notif.createdAt).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Workout Popularity Chart */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, alignSelf: 'flex-start' }} className="gold-text">WORKOUT ANALYTICS</h3>
          <div style={{ width: '100%', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {charts?.workoutAnalytics && charts.workoutAnalytics.length === 0 ? (
              <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>No workouts performed yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.workoutAnalytics || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(charts?.workoutAnalytics || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-deep)',
                      borderColor: 'var(--border-glass)',
                      borderRadius: '8px',
                      color: 'var(--text-white)'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Most Active Members Leaderboard */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }} className="gold-text">MOST ACTIVE MEMBERS</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1 }}>
            {charts?.mostActiveMembers && charts.mostActiveMembers.length === 0 ? (
              <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', textAlign: 'center', margin: 'auto' }}>
                No check-in history logged.
              </p>
            ) : (
              (charts?.mostActiveMembers || []).map((m, idx) => (
                <div
                  key={m.memberId}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(197, 160, 89, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--gold-secondary)', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {idx + 1}
                    </div>
                    <div>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: 600 }}>{m.fullName}</h5>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-gray)', fontFamily: 'Space Grotesk' }}>ID: {m.memberId}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold-primary)', fontFamily: 'Space Grotesk' }}>{m.visits}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-gray)', display: 'block' }}>Visits</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.5; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); opacity: 0.5; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>

    </div>
  );
};

export default Dashboard;
