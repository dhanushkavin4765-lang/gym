import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import {
  User,
  Calendar,
  CreditCard,
  LineChart as LineIcon,
  PlusCircle,
  FileSpreadsheet,
  ArrowLeft,
  Activity,
  AlertTriangle,
  QrCode
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import GymLoader from '../components/GymLoader';

const MemberDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // Renewal Modal details
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentType, setPaymentType] = useState('payment'); // 'payment' or 'renewal'
  const [payAmount, setPayAmount] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [modalError, setModalError] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchMemberFullData = async () => {
    try {
      setLoading(true);
      const [mRes, aRes, pRes, plansRes] = await Promise.all([
        API.get(`/members/${id}`),
        API.get(`/attendance/member/${id}`),
        API.get(`/payments/member/${id}`),
        API.get('/plans/active')
      ]);

      setMember(mRes.data);
      setAttendance(aRes.data);
      setPayments(pRes.data);
      setPlans(plansRes.data);

      if (plansRes.data.length > 0) {
        setSelectedPlanId(mRes.data.plan?._id || plansRes.data[0]._id);
      }
      
      // Default payment amount to outstanding fees
      setPayAmount(mRes.data.feesPending);
    } catch (error) {
      console.error('Error fetching member file:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberFullData();
  }, [id]);

  // Update payment amount when modal toggle occurs
  useEffect(() => {
    if (member) {
      if (paymentType === 'renewal') {
        const selectedPlan = plans.find(p => p._id === selectedPlanId);
        setPayAmount(selectedPlan ? selectedPlan.feeAmount : 0);
      } else {
        setPayAmount(member.feesPending);
      }
    }
  }, [paymentType, selectedPlanId, member, plans]);

  // BMI calculations
  const heightM = member ? member.height / 100 : 0;
  const bmi = member && heightM > 0 ? (member.weight / (heightM * heightM)).toFixed(1) : 'N/A';

  const getBMICategory = (val) => {
    if (val === 'N/A') return { text: 'N/A', color: 'var(--text-gray)' };
    const num = parseFloat(val);
    if (num < 18.5) return { text: 'Underweight', color: 'var(--status-warning)' };
    if (num < 25) return { text: 'Healthy Weight', color: 'var(--status-active)' };
    if (num < 30) return { text: 'Overweight', color: 'var(--status-warning)' };
    return { text: 'Obese', color: 'var(--status-expired)' };
  };

  const bmiCat = getBMICategory(bmi);

  // Expiry Calculations
  const getRemainingDays = (expiryDate) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const exp = new Date(expiryDate);
    exp.setHours(0,0,0,0);
    
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 0 ? 0 : diffDays;
  };

  const remDays = member ? getRemainingDays(member.expiryDate) : 0;

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setProcessing(true);

    try {
      await API.post('/payments', {
        memberId: member._id,
        amountPaid: Number(payAmount),
        paymentMethod: payMethod,
        type: paymentType,
        planId: paymentType === 'renewal' ? selectedPlanId : undefined
      });
      
      setShowPayModal(false);
      fetchMemberFullData(); // reload
    } catch (error) {
      setModalError(error.response?.data?.message || 'Transaction failed. Please check amounts.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <GymLoader text="FETCHING MEMBER HISTORY..." color="var(--gold-primary)" />
      </div>
    );
  }

  if (!member) {
    return <div style={{ color: 'var(--status-expired)', textAlign: 'center', padding: '40px' }}>Member file not found.</div>;
  }

  // Weight history graph data coordinates
  const weightData = member.weightHistory?.map(w => ({
    date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: w.weight
  })) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Back & header actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <button onClick={() => navigate('/members')} className="outline-btn" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to Directory
        </button>
        <button onClick={() => { setPaymentType('payment'); setShowPayModal(true); }} className="gold-btn">
          <PlusCircle size={16} /> Collect Payment / Renew
        </button>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        
        {/* Left Card - Visual Card, QR, and Digital Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Member Visual Banner */}
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <img
              src={member.photo || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=150'}
              alt={member.fullName}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--gold-secondary)',
                boxShadow: '0 0 15px var(--gold-glow)'
              }}
            />
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 600 }}>{member.fullName}</h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>PIN: <span style={{ color: '#10b981', fontWeight: 'bold' }}>{member.pin}</span></p>
            </div>
            
            <span className={`badge ${
              member.status === 'Active'
                ? 'badge-active'
                : member.status === 'Expired'
                ? 'badge-expired'
                : 'badge-warning'
            }`}>
              {member.status}
            </span>

            {/* Sub details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', gap: '16px', borderTop: '1px solid rgba(197, 160, 89, 0.1)', paddingTop: '16px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-gray)' }}>REMAINING</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: remDays <= 7 ? 'var(--status-warning)' : 'var(--text-white)' }}>{remDays} Days</p>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-gray)' }}>FEES DUE</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: member.feesPending > 0 ? 'var(--status-warning)' : 'var(--text-white)' }}>${member.feesPending}</p>
              </div>
            </div>
          </div>

          {/* Digital Membership Card (User requirement) */}
          <div className="digital-id-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 className="gold-text" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>IRON DOME GYM</h4>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-gray)' }}>DIGITAL ATHLETE PASS</span>
              </div>
              <QRCodeSVG value={member.memberId} size={45} bgColor="#1a202a" fgColor="#d4af37" level="H" />
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', margin: '15px 0' }}>
              <img
                src={member.photo || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=100'}
                alt=""
                style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--gold-secondary)' }}
              />
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{member.fullName}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-gray)', fontFamily: 'Space Grotesk' }}>ID: {member.memberId}</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(212,175,55,0.15)', paddingTop: '8px', fontSize: '0.7rem' }}>
              <div>
                <span style={{ color: 'var(--text-gray)' }}>PLAN</span>
                <p style={{ fontWeight: 500 }}>{member.plan?.name}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-gray)' }}>EXPIRY</span>
                <p style={{ fontWeight: 500, color: remDays <= 7 ? 'var(--status-warning)' : 'var(--text-white)' }}>
                  {new Date(member.expiryDate).toLocaleDateString()}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--text-gray)' }}>SECURE PIN</span>
                <p style={{ fontWeight: 'bold', color: '#10b981' }}>{member.pin}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Section - Tabs and Details */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Tab Navigation */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(197, 160, 89, 0.1)', paddingBottom: '12px', gap: '20px', overflowX: 'auto' }}>
            {[
              { id: 'profile', label: 'Profile File', icon: User },
              { id: 'attendance', label: 'Attendance', icon: Calendar },
              { id: 'payments', label: 'Invoices', icon: CreditCard },
              { id: 'progress', label: 'Progress Chart', icon: LineIcon },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeTab === tab.id ? 'var(--gold-primary)' : 'var(--text-gray)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  paddingBottom: '8px',
                  borderBottom: activeTab === tab.id ? '2px solid var(--gold-primary)' : 'none',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div>
            
            {/* PROFILE DETAILS TAB */}
            {activeTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Mobile</span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '4px' }}>{member.mobile}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Emergency Contact</span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '4px' }}>{member.emergencyContact}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Age / Gender</span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '4px' }}>{member.age} Yrs / {member.gender}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Home Address</span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '4px' }}>{member.address}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Joining Date</span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '4px' }}>{new Date(member.joiningDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Expiry Date</span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '4px' }}>{new Date(member.expiryDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Height / Weight</span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '4px' }}>{member.height} cm / {member.weight} kg</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Payment Status</span>
                    <p style={{ marginTop: '4px' }}>
                      <span className={`badge ${member.paymentStatus === 'Paid' ? 'badge-active' : 'badge-warning'}`}>
                        {member.paymentStatus}
                      </span>
                    </p>
                  </div>
                </div>

                {/* BMI Analysis Module */}
                <div style={{
                  background: 'rgba(197, 160, 89, 0.03)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ color: 'var(--gold-primary)', background: 'rgba(197, 160, 89, 0.05)', padding: '10px', borderRadius: '50%' }}>
                      <Activity size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>BODY MASS INDEX (BMI)</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Category: <strong style={{ color: bmiCat.color }}>{bmiCat.text}</strong></p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-gray)' }}>BMI VALUE</span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold-primary)', fontFamily: 'Space Grotesk' }}>{bmi}</h3>
                  </div>
                </div>

              </div>
            )}

            {/* ATTENDANCE HISTORY TAB */}
            {activeTab === 'attendance' && (
              <div className="animate-fade-in">
                {attendance.length === 0 ? (
                  <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>No attendance check-ins recorded.</p>
                ) : (
                  <div className="premium-table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.map((log) => (
                          <tr key={log._id}>
                            <td>{new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                            <td style={{ fontFamily: 'Space Grotesk' }}>{log.checkInTime}</td>
                            <td><span className="badge badge-active" style={{ fontSize: '0.7rem' }}>Checked In</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* PAYMENT RECEIPTS TAB */}
            {activeTab === 'payments' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Fees total: <strong>${member.feesTotal}</strong></span>
                  <span>Paid: <strong style={{ color: 'var(--status-active)' }}>${member.feesPaid}</strong></span>
                  <span>Outstanding: <strong style={{ color: 'var(--status-warning)' }}>${member.feesPending}</strong></span>
                </div>

                {payments.length === 0 ? (
                  <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>No invoice payments registered.</p>
                ) : (
                  <div className="premium-table-container" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Receipt No</th>
                          <th>Paid</th>
                          <th>Pending</th>
                          <th>Date</th>
                          <th>Method</th>
                          <th>Receipt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr key={p._id}>
                            <td style={{ fontFamily: 'Space Grotesk', fontSize: '0.8rem' }}>{p.receiptNumber}</td>
                            <td style={{ fontFamily: 'Space Grotesk', color: 'var(--status-active)' }}>${p.amountPaid}</td>
                            <td style={{ fontFamily: 'Space Grotesk', color: p.amountPending > 0 ? 'var(--status-warning)' : 'var(--text-gray)' }}>${p.amountPending}</td>
                            <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                            <td>{p.paymentMethod}</td>
                            <td>
                              <button
                                onClick={() => navigate(`/receipt/${p.receiptNumber}`)}
                                className="outline-btn"
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              >
                                View Receipt
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* WEIGHT PROGRESS GRAPH */}
            {activeTab === 'progress' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>WEIGHT TRACKING LOGS</h4>
                <div style={{ width: '100%', height: '240px' }}>
                  {weightData.length < 2 ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-gray)', fontSize: '0.85rem' }}>
                      Register at least 2 weight logs to plot progress. (Update weight in profile to append logs)
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightData}>
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
                        <Line type="monotone" dataKey="weight" stroke="var(--gold-primary)" strokeWidth={2} name="Weight (kg)" dot={{ fill: 'var(--gold-primary)' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* COLLECT PAYMENT / RENEWAL MODAL */}
      {showPayModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '20px'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <h2 className="gold-text" style={{ fontSize: '1.25rem', fontWeight: 600 }}>RECORD TRANSACTION</h2>

            <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Type Switcher */}
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>TRANSACTION TYPE</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentType('payment')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-glass)',
                      background: paymentType === 'payment' ? 'var(--gold-secondary)' : 'transparent',
                      color: paymentType === 'payment' ? 'var(--text-dark)' : 'var(--text-white)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    Pay Balance
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('renewal')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-glass)',
                      background: paymentType === 'renewal' ? 'var(--gold-secondary)' : 'transparent',
                      color: paymentType === 'renewal' ? 'var(--text-dark)' : 'var(--text-white)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    Renew Plan
                  </button>
                </div>
              </div>

              {/* Conditional Plan selection */}
              {paymentType === 'renewal' && (
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>SELECT NEW PLAN</label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="premium-input"
                  >
                    {plans.map(p => (
                      <option key={p._id} value={p._id}>{p.name} (${p.feeAmount})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Amount to pay */}
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>AMOUNT TO COLLECT ($)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  required
                  className="premium-input"
                  min={0}
                />
                {paymentType === 'payment' && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-gray)', marginTop: '4px', display: 'block' }}>
                    Outstanding balance: ${member.feesPending}
                  </span>
                )}
              </div>

              {/* Method */}
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>PAYMENT METHOD</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="premium-input"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              {modalError && (
                <div style={{ color: 'var(--status-expired)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '6px', fontSize: '0.8rem', textAlign: 'center' }}>
                  {modalError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="outline-btn"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="gold-btn"
                  style={{ flex: 2, justifyContent: 'center' }}
                >
                  {processing ? 'Processing...' : 'Confirm Transaction'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
};

export default MemberDetails;
