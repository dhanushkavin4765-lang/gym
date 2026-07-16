import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { CalendarCheck, Users, CalendarDays, Clock, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import GymLoader from '../components/GymLoader';

const Attendance = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({
    todayCount: 0,
    weeklyCount: 0,
    monthlyCount: 0,
    lastCheckIn: null
  });

  const fetchAttendanceData = async () => {
    try {
      setRefreshing(true);
      const [todayRes, allRes] = await Promise.all([
        API.get('/attendance/today'),
        API.get('/reports/export/attendance') // Raw array of check-ins
      ]);

      setLogs(todayRes.data);

      // Calculations for summary boxes
      const today = new Date();
      today.setHours(0,0,0,0);
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      let todayCount = todayRes.data.length;
      let weeklyCount = 0;
      let monthlyCount = 0;

      allRes.data.forEach(log => {
        const logDate = new Date(log['Check-In Date']);
        if (logDate >= sevenDaysAgo) {
          weeklyCount++;
        }
        if (logDate >= thirtyDaysAgo) {
          monthlyCount++;
        }
      });

      const lastCheckIn = allRes.data.length > 0 ? allRes.data[0] : null;

      setSummary({
        todayCount,
        weeklyCount,
        monthlyCount,
        lastCheckIn
      });

    } catch (err) {
      console.error('Error fetching attendance logs:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <GymLoader text="LOADING CHECK-IN HISTORY..." color="var(--gold-primary)" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="gold-text" style={{ fontSize: '1.75rem', fontWeight: 600 }}>ATTENDANCE LOGS</h1>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>Monitor check-in frequency and track today's entry times.</p>
        </div>
        <button
          onClick={fetchAttendanceData}
          disabled={refreshing}
          className="outline-btn"
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Summary grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Today's checkins */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #3b82f6' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>TODAY'S VISITORS</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '6px', fontFamily: 'Space Grotesk' }}>{summary.todayCount}</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-gray)', marginTop: '4px' }}>Unique member entries today</p>
        </div>

        {/* Weekly visits */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--gold-primary)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>LAST 7 DAYS</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '6px', fontFamily: 'Space Grotesk' }}>{summary.weeklyCount}</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-gray)', marginTop: '4px' }}>Total entries past week</p>
        </div>

        {/* Monthly visits */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--status-active)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>LAST 30 DAYS</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '6px', fontFamily: 'Space Grotesk' }}>{summary.monthlyCount}</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-gray)', marginTop: '4px' }}>Total entries past month</p>
        </div>

        {/* Last checkin name */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--status-warning)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>LATEST CHECK-IN</span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {summary.lastCheckIn ? summary.lastCheckIn['Member Name'] : 'N/A'}
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-gray)', marginTop: '4px' }}>
            {summary.lastCheckIn ? `${summary.lastCheckIn['Check-In Date']} at ${summary.lastCheckIn['Check-In Time']}` : 'No active history'}
          </p>
        </div>

      </div>

      {/* Today's visitors list */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }} className="gold-text">TODAY'S VISITOR ENTRIES</h3>
        
        {logs.length === 0 ? (
          <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', textAlign: 'center', padding: '30px 0' }}>
            No check-in entries logged today yet. Open the PIN check-in page for members to check-in.
          </p>
        ) : (
          <div className="premium-table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Member ID</th>
                  <th>Plan Subscribed</th>
                  <th>Check-In Time</th>
                  <th>Membership Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={log.member?.photo || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=80'}
                        alt=""
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ fontWeight: 500 }}>{log.member?.fullName || 'Deleted Member'}</span>
                    </td>
                    <td style={{ fontFamily: 'Space Grotesk' }}>{log.member?.memberId || 'N/A'}</td>
                    <td>{log.member?.plan?.name || 'N/A'}</td>
                    <td style={{ fontFamily: 'Space Grotesk', fontWeight: 500, color: 'var(--gold-primary)' }}>{log.checkInTime}</td>
                    <td>
                      <span className={`badge ${
                        log.member?.status === 'Active'
                          ? 'badge-active'
                          : log.member?.status === 'Expired'
                          ? 'badge-expired'
                          : 'badge-warning'
                      }`}>
                        {log.member?.status || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
};

export default Attendance;
