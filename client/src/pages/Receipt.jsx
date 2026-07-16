import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { ArrowLeft, Printer, Dumbbell, ShieldCheck } from 'lucide-react';
import GymLoader from '../components/GymLoader';
import { motion } from 'framer-motion';

const Receipt = () => {
  const { receiptNumber } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/payments/receipt/${receiptNumber}`);
        setPayment(data);
      } catch (err) {
        console.error('Error fetching receipt:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [receiptNumber]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <GymLoader text="PRINTING INVOICE..." color="var(--gold-primary)" />
      </div>
    );
  }

  if (!payment) {
    return <div style={{ color: 'var(--status-expired)', textAlign: 'center', padding: '40px' }}>Receipt not found.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '650px', margin: '0 auto' }}>
      
      {/* Header action */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate(-1)} className="outline-btn" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={handlePrint} className="gold-btn">
          <Printer size={16} /> Print Receipt
        </button>
      </div>

      {/* Invoice Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel print-container"
        style={{
          padding: '40px',
          background: 'linear-gradient(135deg, #12141a 0%, #0c0d12 100%)',
          border: '1px solid var(--border-glass)',
          boxShadow: 'var(--shadow-premium)',
          display: 'flex',
          flexDirection: 'column',
          gap: '30px'
        }}
      >
        {/* Top Header details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(197, 160, 89, 0.1)', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-secondary))',
              color: 'var(--text-dark)',
              padding: '6px',
              borderRadius: '6px'
            }}>
              <Dumbbell size={20} />
            </div>
            <div>
              <h3 className="gold-text" style={{ fontSize: '1.1rem', letterSpacing: '0.5px' }}>IRON DOME</h3>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-gray)' }}>STRENGTH & FITNESS HUB</p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--gold-primary)', fontWeight: 600 }}>OFFICIAL INVOICE</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '2px', fontFamily: 'Space Grotesk' }}>No: {payment.receiptNumber}</p>
          </div>
        </div>

        {/* Middle details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.85rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-gray)' }}>BILLED TO:</span>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>{payment.member?.fullName}</h4>
            <p style={{ color: 'var(--text-gray)', marginTop: '2px', fontFamily: 'Space Grotesk' }}>Member ID: {payment.member?.memberId}</p>
            <p style={{ color: 'var(--text-gray)' }}>Phone: {payment.member?.mobile}</p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-gray)' }}>INVOICE DETAILS:</span>
            <p style={{ marginTop: '4px' }}>Date: <strong>{new Date(payment.paymentDate).toLocaleDateString()}</strong></p>
            <p>Method: <strong>{payment.paymentMethod}</strong></p>
            <p>Status: <strong style={{ color: 'var(--status-active)' }}>Paid</strong></p>
          </div>
        </div>

        {/* Invoice Item Table */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)', padding: '20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-gray)', textTransform: 'uppercase', marginBottom: '12px' }}>
            <span>Plan Item Description</span>
            <span>Rate</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 500 }}>
            <div>
              <p>{payment.plan?.name}</p>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-gray)' }}>Duration: {payment.plan?.durationMonths} Months</span>
            </div>
            <span style={{ fontFamily: 'Space Grotesk' }}>${payment.plan?.feeAmount}</span>
          </div>
        </div>

        {/* Invoice Total */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', gap: '40px', justifyContent: 'space-between', width: '220px' }}>
            <span style={{ color: 'var(--text-gray)' }}>Total Plan Fee:</span>
            <span style={{ fontFamily: 'Space Grotesk' }}>${payment.plan?.feeAmount}</span>
          </div>
          <div style={{ display: 'flex', gap: '40px', justifyContent: 'space-between', width: '220px', fontWeight: 600, color: 'var(--status-active)' }}>
            <span>Amount Paid:</span>
            <span style={{ fontFamily: 'Space Grotesk' }}>-${payment.amountPaid}</span>
          </div>
          <div style={{ display: 'flex', gap: '40px', justifyContent: 'space-between', width: '220px', borderTop: '1px solid rgba(197, 160, 89, 0.1)', paddingTop: '8px', fontWeight: 700, color: 'var(--gold-primary)' }}>
            <span>Outstanding Balance:</span>
            <span style={{ fontFamily: 'Space Grotesk' }}>${payment.amountPending}</span>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ borderTop: '1px solid rgba(197, 160, 89, 0.1)', paddingTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-gray)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ color: 'var(--status-active)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
            <ShieldCheck size={14} /> Verified Secure Transaction
          </div>
          <p>Thank you for choosing Iron Dome Strength Hub. Train Hard!</p>
        </div>

      </motion.div>

      {/* Printing style variables */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            background: white !important;
            border: none !important;
            box-shadow: none !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-container span {
            color: #333 !important;
          }
          .print-container p {
            color: #333 !important;
          }
          .print-container h3, .print-container h4, .print-container h2 {
            color: black !important;
            -webkit-text-fill-color: black !important;
          }
        }
      `}</style>

    </div>
  );
};

export default Receipt;
