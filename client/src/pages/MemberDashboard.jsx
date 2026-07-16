import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Dumbbell, Calendar, LogOut, CheckCircle, AlertOctagon, User, Clock, ShieldCheck, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import GymLoader from '../components/GymLoader';

const MemberDashboard = () => {
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check-In Form details
  const [selectedWorkout, setSelectedWorkout] = useState('Chest');
  const [customWorkoutDetails, setCustomWorkoutDetails] = useState('');
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [todayWorkoutLog, setTodayWorkoutLog] = useState('');
  const [checkInMsg, setCheckInMsg] = useState({ text: '', type: '' });
  const [checkInLoading, setCheckInLoading] = useState(false);

  const workoutOptions = [
    'Chest',
    'Back',
    'Legs',
    'Shoulder',
    'Biceps',
    'Triceps',
    'Cardio',
    'Full Body',
    'Custom Workout'
  ];

  // Fetch Member Info & Check-in History
  const fetchMemberDashboard = async () => {
    try {
      const memberData = JSON.parse(localStorage.getItem('gym_member_user'));
      if (!memberData) {
        navigate('/member-login');
        return;
      }

      // 1. Fetch latest member details by ID from admin endpoints (or public endpoints)
      // Since members might need auth, our Axios API instance attaches the member JWT token
      const { data: mbr } = await API.get(`/members/${memberData._id}`);
      setMember(mbr);

      // 2. Fetch attendance logs for this member
      const { data: attHistory } = await API.get(`/attendance/member/${memberData._id}`);
      setHistory(attHistory);

      // 3. Verify if checked in today
      const todayStr = new Date().toLocaleDateString('en-CA');
      const todayLog = attHistory.find(log => log.date === todayStr);
      if (todayLog) {
        setCheckedInToday(true);
        setTodayWorkoutLog(todayLog.workout);
      }
    } catch (error) {
      console.error('Error fetching member records:', error.message);
      // If unauthorized, logout
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('gym_member_token');
    localStorage.removeItem('gym_member_user');
    navigate('/member-login');
  };

  const getRemainingDays = (expiryDate) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const exp = new Date(expiryDate);
    exp.setHours(0,0,0,0);
    
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 0 ? 0 : diffDays;
  };

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    setCheckInMsg({ text: '', type: '' });
    setCheckInLoading(true);

    if (member.status === 'Expired') {
      setCheckInMsg({
        text: 'Your membership has expired. Please renew your membership.',
        type: 'error'
      });
      setCheckInLoading(false);
      return;
    }

    try {
      const { data } = await API.post('/attendance/check-in', {
        memberId: member.memberId,
        pin: member.pin,
        workout: selectedWorkout,
        customWorkout: selectedWorkout === 'Custom Workout' ? customWorkoutDetails : ''
      });

      if (data.allowed) {
        setCheckedInToday(true);
        setTodayWorkoutLog(selectedWorkout);
        setCheckInMsg({
          text: 'Attendance marked successfully.',
          type: 'success'
        });
        
        // Reload history
        const { data: newHistory } = await API.get(`/attendance/member/${member._id}`);
        setHistory(newHistory);
      }
    } catch (error) {
      setCheckInMsg({
        text: error.response?.data?.message || 'Check-in failed. Please try again.',
        type: 'error'
      });
    } finally {
      setCheckInLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-deep)'
      }}>
        <GymLoader text="SYNCING HEALTH RECORD..." color="#10b981" />
      </div>
    );
  }

  const remDays = member ? getRemainingDays(member.expiryDate) : 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-deep)',
      backgroundImage: 'radial-gradient(circle at 5% 5%, rgba(16, 185, 129, 0.04) 0%, transparent 40%)',
      padding: '24px 20px',
      color: 'var(--text-white)'
    }}>
      
      {/* Header bar */}
      <div className="glass-panel" style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px',
        border: '1px solid rgba(16, 185, 129, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#10b981', color: 'var(--text-dark)', padding: '6px', borderRadius: '6px' }}>
            <Dumbbell size={20} />
          </div>
          <span className="gold-text" style={{ fontSize: '1.2rem', letterSpacing: '1px' }}>MEMBER PORTAL</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-gray)' }}>
            Welcome, <strong>{member?.fullName}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="outline-btn"
            style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--status-expired)' }}
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </div>

      {/* Main grids */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '30px'
      }}>
        
        {/* LEFT COLUMN: MEMBERSHIP CARD & ATTENDANCE FORM */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Membership Status card */}
          <div className="glass-panel" style={{ padding: '24px', borderLeft: `4px solid ${member?.status === 'Expired' ? 'var(--status-expired)' : member?.status === 'Expiring Soon' ? 'var(--status-warning)' : '#10b981'}` }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>MEMBERSHIP PACKAGE: {member?.plan?.name}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                  {remDays} {remDays === 1 ? 'Day' : 'Days'} Left
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '4px' }}>
                  Expires: <strong>{new Date(member?.expiryDate).toLocaleDateString()}</strong>
                </p>
              </div>

              <span className={`badge ${
                member?.status === 'Active'
                  ? 'badge-active'
                  : member?.status === 'Expired'
                  ? 'badge-expired'
                  : 'badge-warning'
              }`} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                {member?.status}
              </span>
            </div>

            {member?.status === 'Expired' && (
              <div style={{ display: 'flex', gap: '8px', color: 'var(--status-expired)', fontSize: '0.75rem', marginTop: '16px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '10px', borderRadius: '8px' }}>
                <AlertOctagon size={16} />
                <span>Your membership has expired. Please contact the front desk to renew.</span>
              </div>
            )}
          </div>

          {/* Today's Check-in Option Card */}
          <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '16px' }} className="gold-text">TODAY'S WORKOUT CHECK-IN</h3>

            {checkedInToday ? (
              // Already Checked-In View
              <div style={{
                textAlign: 'center',
                padding: '20px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                color: '#10b981'
              }}>
                <CheckCircle size={50} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Attendance marked successfully.</h4>
                <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>
                  Today's target workout: <strong>{todayWorkoutLog}</strong>
                </p>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-gray)' }}>You have completed your daily check-in registry.</span>
              </div>
            ) : (
              // Check-In Form
              <form onSubmit={handleCheckInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>CHOOSE TODAY'S TARGET WORKOUT</label>
                  <select
                    value={selectedWorkout}
                    onChange={(e) => setSelectedWorkout(e.target.value)}
                    disabled={member?.status === 'Expired'}
                    className="premium-input"
                  >
                    {workoutOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {selectedWorkout === 'Custom Workout' && (
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>ENTER WORKOUT ROUTINE DETAILS</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kettlebell circuits + Abs"
                      value={customWorkoutDetails}
                      onChange={(e) => setCustomWorkoutDetails(e.target.value)}
                      className="premium-input"
                    />
                  </div>
                )}

                {checkInMsg.text && (
                  <div style={{
                    background: checkInMsg.type === 'success' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: `1px solid ${checkInMsg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                    color: checkInMsg.type === 'success' ? 'var(--status-active)' : 'var(--status-expired)',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    textAlign: 'center'
                  }}>
                    {checkInMsg.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={checkInLoading || member?.status === 'Expired'}
                  className="gold-btn"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'var(--text-white)'
                  }}
                >
                  {checkInLoading ? 'Submitting...' : 'Press Check In'}
                </button>

              </form>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: ATTENDANCE HISTORY */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={18} style={{ color: '#10b981' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>ATTENDANCE JOURNAL</h3>
          </div>

          {history.length === 0 ? (
            <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', textAlign: 'center', padding: '40px 0' }}>
              Your check-in journal is empty. Check-in above to start logging visits.
            </p>
          ) : (
            <div className="premium-table-container" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check-In Time</th>
                    <th>Workout Performed</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((log) => (
                    <tr key={log._id}>
                      <td>{new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td style={{ fontFamily: 'Space Grotesk' }}>{log.checkInTime}</td>
                      <td>
                        <span style={{ fontWeight: 500, color: log.workout !== 'None' ? 'var(--gold-primary)' : 'var(--text-gray)' }}>
                          {log.workout}
                        </span>
                        {log.customWorkout && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)', display: 'block', fontStyle: 'italic' }}>
                            ({log.customWorkout})
                          </span>
                        )}
                      </td>
                      <td><span className="badge badge-active" style={{ fontSize: '0.7rem' }}>Present</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default MemberDashboard;
