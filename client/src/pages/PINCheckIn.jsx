import React, { useState, useEffect, useContext, useRef } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import API from '../services/api';
import { Dumbbell, Delete, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PINCheckIn = () => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { allowed: boolean, member: Object, message: String, warning?: String, alreadyCheckedIn?: boolean }
  const [errorMsg, setErrorMsg] = useState('');
  const resetTimerRef = useRef(null);

  const { playSound } = useContext(NotificationContext);

  // Clear automatic resets when unmounting
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleKeyPress = (num) => {
    if (loading) return;
    
    // Clear previous checkin display if a new PIN starts typing
    if (result || errorMsg) {
      setResult(null);
      setErrorMsg('');
    }

    if (pin.length < 4) {
      setPin((prev) => prev + num);
    }
  };

  const handleBackspace = () => {
    if (loading || result) return;
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (loading || result) return;
    setPin('');
    setResult(null);
    setErrorMsg('');
  };

  // Run check-in once PIN reaches 4 digits
  useEffect(() => {
    if (pin.length === 4) {
      triggerCheckIn();
    }
  }, [pin]);

  const triggerCheckIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data } = await API.post('/attendance/check-in', { pin });
      setResult(data);
      
      if (data.allowed) {
        if (data.warning) {
          // Expiry warning within 7 days
          playSound('warning');
        } else {
          playSound('success');
        }
      }

      // Automatically reset screen after 5 seconds
      resetTimerRef.current = setTimeout(() => {
        handleClear();
      }, 5000);

    } catch (error) {
      playSound('error');
      if (error.response?.status === 403) {
        // Blocked - Expired
        setResult(error.response.data);
        resetTimerRef.current = setTimeout(() => {
          handleClear();
        }, 7000); // give more time to read block warning
      } else {
        setErrorMsg(error.response?.data?.message || 'Access Denied / Invalid PIN');
        setPin('');
        resetTimerRef.current = setTimeout(() => {
          setErrorMsg('');
        }, 4000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      
      {/* Background glow overlay */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: result?.allowed === false 
          ? 'radial-gradient(circle, rgba(239, 68, 68, 0.08) 0%, transparent 70%)'
          : result?.allowed === true
          ? 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, transparent 70%)',
        zIndex: 0,
        transition: 'background 0.5s ease'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '850px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '30px',
        zIndex: 10
      }}>

        {/* LEFT COLUMN: PIN KEYPAD INTERFACE */}
        <div className="glass-panel" style={{
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--gold-primary)', display: 'inline-block', marginBottom: '8px' }}>
              <Dumbbell size={28} />
            </div>
            <h2 className="gold-text" style={{ fontSize: '1.25rem', letterSpacing: '1px' }}>MEMBER QUICK CHECK-IN</h2>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.75rem' }}>Enter your 4-digit PIN to check-in and unlock gate.</p>
          </div>

          {/* Dots Indicator */}
          <div style={{ display: 'flex', gap: '20px', margin: '10px 0' }}>
            {[0, 1, 2, 3].map((idx) => (
              <motion.div
                key={idx}
                animate={{
                  scale: pin.length > idx ? 1.25 : 1,
                  backgroundColor: pin.length > idx ? 'var(--gold-primary)' : 'rgba(255,255,255,0.1)'
                }}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  boxShadow: pin.length > idx ? '0 0 10px var(--gold-primary)' : 'none'
                }}
              />
            ))}
          </div>

          {/* Numeric Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            width: '100%',
            maxWidth: '280px'
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <motion.button
                whileHover={{ scale: 1.08, borderColor: 'var(--gold-secondary)', boxShadow: '0 0 10px rgba(197, 160, 89, 0.2)' }}
                whileTap={{ scale: 0.92 }}
                key={num}
                onClick={() => handleKeyPress(num.toString())}
                className="outline-btn"
                style={{
                  height: '60px',
                  borderRadius: '12px',
                  fontSize: '1.4rem',
                  fontWeight: 600,
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.01)',
                  fontFamily: 'Space Grotesk',
                  cursor: 'pointer'
                }}
              >
                {num}
              </motion.button>
            ))}
            
            {/* Clear */}
            <motion.button
              whileHover={{ scale: 1.08, borderColor: 'var(--status-expired)', boxShadow: '0 0 10px rgba(239, 68, 68, 0.2)' }}
              whileTap={{ scale: 0.92 }}
              onClick={handleClear}
              className="outline-btn"
              style={{
                height: '60px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--status-expired)',
                borderColor: 'rgba(239, 68, 68, 0.2)',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              CLEAR
            </motion.button>

            {/* Zero */}
            <motion.button
              whileHover={{ scale: 1.08, borderColor: 'var(--gold-secondary)', boxShadow: '0 0 10px rgba(197, 160, 89, 0.2)' }}
              whileTap={{ scale: 0.92 }}
              key="0"
              onClick={() => handleKeyPress('0')}
              className="outline-btn"
              style={{
                height: '60px',
                borderRadius: '12px',
                fontSize: '1.4rem',
                fontWeight: 600,
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.01)',
                fontFamily: 'Space Grotesk',
                cursor: 'pointer'
              }}
            >
              0
            </motion.button>

            {/* Backspace */}
            <motion.button
              whileHover={{ scale: 1.08, borderColor: 'var(--text-gray)', boxShadow: '0 0 10px rgba(255, 255, 255, 0.05)' }}
              whileTap={{ scale: 0.92 }}
              onClick={handleBackspace}
              className="outline-btn"
              style={{
                height: '60px',
                borderRadius: '12px',
                justifyContent: 'center',
                color: 'var(--text-gray)',
                cursor: 'pointer'
              }}
            >
              <Delete size={20} />
            </motion.button>
          </div>

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-primary)', fontSize: '0.8rem' }}>
              <RefreshCw size={14} className="animate-spin" />
              <span>Verifying Profile...</span>
            </div>
          )}

          {errorMsg && (
            <motion.div
              initial={{ x: -10 }}
              animate={{ x: [10, -10, 10, -10, 0] }}
              style={{ color: 'var(--status-expired)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </motion.div>
          )}

        </div>

        {/* RIGHT COLUMN: ATTENDANCE DISPATCH DETAILS */}
        <div className="glass-panel" style={{
          padding: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          
          <AnimatePresence mode="wait">
            {!result ? (
              // Default standby screen
              <motion.div
                key="standby"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ textAlign: 'center', color: 'var(--text-gray)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
              >
                <Dumbbell size={45} style={{ opacity: 0.15 }} />
                <p style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>STANDBY FOR GATE ENTRY</p>
                <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>Gate: SECURE-01</span>
              </motion.div>
            ) : result.allowed === false ? (
              // EXPIRED / BLOCKED Screen
              <motion.div
                key="blocked"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}
              >
                <div style={{ color: 'var(--status-expired)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  {/* Custom gate lock barbell animation */}
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px', width: '200px' }}>
                    <motion.div
                      initial={{ y: -40, rotate: -8, opacity: 0 }}
                      animate={{ y: 0, rotate: [0, -6, 6, -6, 0], opacity: 1 }}
                      transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
                      style={{ display: 'flex', alignItems: 'center', color: 'var(--status-expired)' }}
                    >
                      <div style={{ width: '10px', height: '24px', background: 'var(--status-expired)', borderRadius: '2px', marginRight: '4px' }} />
                      <div style={{ width: '50px', height: '4px', background: 'var(--status-expired)' }} />
                      <div style={{ width: '10px', height: '24px', background: 'var(--status-expired)', borderRadius: '2px', marginLeft: '4px' }} />
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.25, 1] }}
                      transition={{ delay: 0.3, type: 'spring' }}
                      style={{
                        position: 'absolute',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '2px solid var(--status-expired)',
                        borderRadius: '50%',
                        width: '38px',
                        height: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
                      }}
                    >
                      <AlertCircle size={20} color="var(--status-expired)" />
                    </motion.div>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.5px' }}>GATE LOCKED</h3>
                </div>

                <img
                  src={result.member.photo || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=100'}
                  alt=""
                  style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--status-expired)' }}
                />

                <div>
                  <h4 style={{ fontSize: '1.1rem' }}>{result.member.fullName}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', fontFamily: 'Space Grotesk', marginTop: '2px' }}>ID: {result.member.memberId}</p>
                </div>

                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: 'var(--status-expired)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  maxWidth: '300px'
                }}>
                  {result.message}
                </div>

                <div style={{ borderTop: '1px solid rgba(239, 68, 68, 0.1)', paddingTop: '12px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '0.75rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-gray)' }}>EXPIRY DATE</span>
                    <p style={{ fontWeight: 600, color: 'var(--status-expired)', marginTop: '2px' }}>{new Date(result.member.expiryDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-gray)' }}>PENDING FEES</span>
                    <p style={{ fontWeight: 600, color: 'var(--status-expired)', marginTop: '2px' }}>${result.member.feesPending}</p>
                  </div>
                </div>

              </motion.div>
            ) : (
              // CHECK-IN SUCCESS Screen
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}
              >
                <div style={{ color: 'var(--status-active)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  {/* Custom check-in barbell success animation */}
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px', width: '200px' }}>
                    <motion.div
                      initial={{ scale: 0, y: -15 }}
                      animate={{ scale: [0, 1.15, 1], y: 0 }}
                      transition={{ duration: 0.6, type: 'spring' }}
                      style={{ display: 'flex', alignItems: 'center', color: 'var(--status-active)' }}
                    >
                      <motion.div animate={{ rotate: [0, 180] }} transition={{ duration: 0.8 }} style={{ width: '10px', height: '24px', background: 'var(--status-active)', borderRadius: '2px', marginRight: '4px' }} />
                      <div style={{ width: '50px', height: '4px', background: 'var(--text-white)' }} />
                      <motion.div animate={{ rotate: [0, -180] }} transition={{ duration: 0.8 }} style={{ width: '10px', height: '24px', background: 'var(--status-active)', borderRadius: '2px', marginLeft: '4px' }} />
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.25, 1] }}
                      transition={{ delay: 0.4, type: 'spring' }}
                      style={{
                        position: 'absolute',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '2px solid var(--status-active)',
                        borderRadius: '50%',
                        width: '38px',
                        height: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
                      }}
                    >
                      <CheckCircle size={20} color="var(--status-active)" />
                    </motion.div>
                  </div>
                  
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.5px' }}>GATE UNLOCKED</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>
                    {result.alreadyCheckedIn ? 'Attendance Checked In Today!' : 'Welcome back! Check-in registered.'}
                  </span>
                </div>

                <img
                  src={result.member.photo || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=100'}
                  alt=""
                  style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--status-active)' }}
                />

                <div>
                  <h4 style={{ fontSize: '1.1rem' }}>{result.member.fullName}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', fontFamily: 'Space Grotesk' }}>ID: {result.member.memberId}</p>
                </div>

                {/* Warnings / Notifications for remaining days */}
                {result.warning && (
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    color: 'var(--status-warning)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    maxWidth: '300px'
                  }}>
                    ⚠️ {result.warning}
                  </div>
                )}

                <div style={{
                  borderTop: '1px solid rgba(16, 185, 129, 0.15)',
                  paddingTop: '12px',
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  fontSize: '0.75rem',
                  gap: '8px'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-gray)' }}>PLAN TYPE</span>
                    <p style={{ fontWeight: 500, marginTop: '2px' }}>{result.member.planName}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-gray)' }}>EXPIRY</span>
                    <p style={{ fontWeight: 500, marginTop: '2px' }}>{new Date(result.member.expiryDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-gray)' }}>REMAINING</span>
                    <p style={{
                      fontWeight: 'bold',
                      color: result.member.remainingDays <= 7 ? 'var(--status-warning)' : 'var(--status-active)',
                      marginTop: '2px'
                    }}>
                      {result.member.remainingDays} Days
                    </p>
                  </div>
                </div>

                <div style={{ fontSize: '0.7rem', color: 'var(--text-gray)', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px', width: '100%' }}>
                  Check-in Time: <span style={{ color: 'var(--gold-primary)', fontFamily: 'Space Grotesk' }}>{result.member.checkInTime}</span>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

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

export default PINCheckIn;
