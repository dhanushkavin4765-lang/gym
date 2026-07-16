import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { Dumbbell, Lock, Mail, Eye, EyeOff, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingGymBackground from '../components/FloatingGymBackground';
import FlexingDumbbell from '../components/FlexingDumbbell';


const Login = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'member' ? 'member' : 'admin';
  
  const [activeRole, setActiveRole] = useState(initialRole); // 'admin' or 'member'

  // Admin form state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Member form state
  const [memberId, setMemberId] = useState('');
  const [memberPin, setMemberPin] = useState('');
  const [showMemberPin, setShowMemberPin] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, admin } = useContext(AuthContext);
  const navigate = useNavigate();

  // If admin is already logged in, redirect to admin home
  useEffect(() => {
    if (admin) {
      navigate('/');
    }
  }, [admin, navigate]);

  // If member is already logged in, redirect to member dashboard
  useEffect(() => {
    const memberToken = localStorage.getItem('gym_member_token');
    if (memberToken && activeRole === 'member') {
      navigate('/member/dashboard');
    }
  }, [activeRole, navigate]);

  const handleRoleToggle = (role) => {
    setActiveRole(role);
    setErrorMsg('');
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const result = await login(adminEmail, adminPassword);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const { data } = await API.post('/auth/member-login', {
        memberId,
        pin: memberPin
      });

      localStorage.setItem('gym_member_token', data.token);
      localStorage.setItem('gym_member_user', JSON.stringify({
        _id: data._id,
        fullName: data.fullName,
        memberId: data.memberId,
        role: 'member'
      }));

      setIsSubmitting(false);
      navigate('/member/dashboard');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Invalid Member ID or PIN. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-deep)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background graphics */}
      <FloatingGymBackground activeRole={activeRole} />
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: activeRole === 'admin' 
          ? 'radial-gradient(circle, rgba(197, 160, 89, 0.06) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
        top: '10%',
        left: '20%',
        filter: 'blur(50px)',
        zIndex: 0,
        transition: 'background 0.5s ease'
      }} />


      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '430px',
          padding: '36px 30px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}
      >
        {/* Logo and Titles */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{
            background: activeRole === 'admin' 
              ? 'linear-gradient(135deg, var(--gold-primary), var(--gold-secondary))'
              : 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '12px',
            padding: '10px',
            color: activeRole === 'admin' ? 'var(--text-dark)' : 'var(--text-white)',
            boxShadow: activeRole === 'admin' ? '0 0 20px var(--gold-glow)' : '0 0 20px rgba(16, 185, 129, 0.25)',
            transition: 'all 0.5s ease'
          }}>
            <FlexingDumbbell size={28} color={activeRole === 'admin' ? 'var(--text-dark)' : 'var(--text-white)'} />
          </div>
          <h1 className="gold-text" style={{ fontSize: '1.6rem', letterSpacing: '1px', marginTop: '6px' }}>IRON DOME GYM</h1>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.8rem' }}>Smart Gym Access Portal</p>
        </div>

        {/* Tab switch control */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-glass)',
          borderRadius: '10px',
          width: '100%',
          padding: '4px',
          position: 'relative',
          marginTop: '10px'
        }}>
          <button
            onClick={() => handleRoleToggle('admin')}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              background: 'none',
              color: activeRole === 'admin' ? 'var(--text-dark)' : 'var(--text-gray)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              zIndex: 2,
              transition: 'color 0.3s ease'
            }}
          >
            ADMIN LOGIN
          </button>
          <button
            onClick={() => handleRoleToggle('member')}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              background: 'none',
              color: activeRole === 'member' ? 'var(--text-white)' : 'var(--text-gray)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              zIndex: 2,
              transition: 'color 0.3s ease'
            }}
          >
            ATHLETE PORTAL
          </button>

          {/* Tab Slider Indicator */}
          <motion.div
            layoutId="activeTabIndicator"
            animate={{
              left: activeRole === 'admin' ? '4px' : '50%',
              background: activeRole === 'admin' 
                ? 'linear-gradient(135deg, var(--gold-primary) 0%, var(--gold-secondary) 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            style={{
              position: 'absolute',
              top: '4px',
              width: 'calc(50% - 4px)',
              height: 'calc(100% - 8px)',
              borderRadius: '8px',
              zIndex: 1
            }}
          />
        </div>

        {/* Dynamic Card forms */}
        <div style={{ width: '100%', marginTop: '10px' }}>
          <AnimatePresence mode="wait">
            {activeRole === 'admin' ? (
              // ADMIN FORM
              <motion.form
                key="admin-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleAdminSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-gray)', fontWeight: 500 }}>ADMIN EMAIL</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-gray)' }} />
                    <input
                      type="email"
                      placeholder="admin@gym.com"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="premium-input"
                      style={{ paddingLeft: '44px', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-gray)', fontWeight: 500 }}>PASSWORD</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-gray)' }} />
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="premium-input"
                      style={{ paddingLeft: '44px', paddingRight: '44px', fontSize: '0.9rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      style={{ position: 'absolute', right: '14px', top: '13px', background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}
                    >
                      {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', color: 'var(--status-expired)', padding: '8px 10px', borderRadius: '6px', fontSize: '0.75rem', textAlign: 'center' }}>
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="gold-btn"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.9rem', marginTop: '10px' }}
                >
                  {isSubmitting ? 'AUTHENTICATING...' : 'ACCESS ADMIN DASHBOARD'}
                </button>
              </motion.form>
            ) : (
              // MEMBER FORM
              <motion.form
                key="member-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleMemberSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-gray)', fontWeight: 500 }}>MEMBER ID</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-gray)' }} />
                    <input
                      type="text"
                      placeholder="e.g. GYM-1025"
                      required
                      value={memberId}
                      onChange={(e) => setMemberId(e.target.value)}
                      className="premium-input"
                      style={{ paddingLeft: '44px', fontSize: '0.9rem', fontFamily: 'Space Grotesk' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-gray)', fontWeight: 500 }}>4-DIGIT PIN</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-gray)' }} />
                    <input
                      type={showMemberPin ? 'text' : 'password'}
                      placeholder="••••"
                      required
                      maxLength={4}
                      value={memberPin}
                      onChange={(e) => setMemberPin(e.target.value.replace(/\D/g, ''))}
                      className="premium-input"
                      style={{ paddingLeft: '44px', paddingRight: '44px', fontSize: '0.9rem', letterSpacing: '8px', fontFamily: 'Space Grotesk' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowMemberPin(!showMemberPin)}
                      style={{ position: 'absolute', right: '14px', top: '13px', background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}
                    >
                      {showMemberPin ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', color: 'var(--status-expired)', padding: '8px 10px', borderRadius: '6px', fontSize: '0.75rem', textAlign: 'center' }}>
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="gold-btn"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.9rem', marginTop: '10px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)' }}
                >
                  {isSubmitting ? 'VERIFYING...' : 'ENTER MEMBER PORTAL'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Helpers notice */}
        <p style={{ fontSize: '0.7rem', color: 'var(--text-gray)', textAlign: 'center', marginTop: '10px' }}>
          {activeRole === 'admin' ? (
            <span>Default: <strong style={{ color: 'var(--gold-primary)' }}>admin@gym.com</strong> / <strong style={{ color: 'var(--gold-primary)' }}>Admin@123</strong></span>
          ) : (
            <span>Seeded: <strong style={{ color: '#10b981' }}>GYM-1025</strong> / PIN: <strong style={{ color: '#10b981' }}>1025</strong></span>
          )}
        </p>

      </motion.div>
    </div>
  );
};

export default Login;
