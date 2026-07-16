import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { PlusCircle, Edit3, Trash2, Check, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GymLoader from '../components/GymLoader';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null); // plan object if editing, null if creating
  
  const [formData, setFormData] = useState({
    name: '',
    durationMonths: 1,
    feeAmount: '',
    description: '',
    isActive: true
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/plans');
      setPlans(data);
    } catch (err) {
      console.error('Error fetching plans:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      durationMonths: 1,
      feeAmount: '',
      description: '',
      isActive: true
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      durationMonths: plan.durationMonths,
      feeAmount: plan.feeAmount,
      description: plan.description || '',
      isActive: plan.isActive
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      if (editingPlan) {
        // Update Plan
        await API.put(`/plans/${editingPlan._id}`, formData);
      } else {
        // Create Plan
        await API.post('/plans', formData);
      }
      
      setShowModal(false);
      fetchPlans();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error saving membership plan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this membership plan? Any member attached to this plan will keep their historical record but new sign-ups will be restricted.')) {
      return;
    }

    try {
      await API.delete(`/plans/${id}`);
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting plan.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="gold-text" style={{ fontSize: '1.75rem', fontWeight: 600 }}>MEMBERSHIP PACKAGES</h1>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>Configure membership durations, pricing collections, and plan scopes.</p>
        </div>
        <button onClick={handleOpenCreate} className="gold-btn">
          <PlusCircle size={16} /> Create New Package
        </button>
      </div>

      {/* Grid of plans */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <GymLoader text="LOADING MEMBERSHIP RATES..." color="var(--gold-primary)" />
        </div>
      ) : plans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-gray)' }}>
          No plans registered. Click "Create New Package" to setup your first gym membership plan.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {plans.map((plan) => (
            <motion.div
              key={plan._id}
              layout
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '20px',
                position: 'relative',
                border: plan.isActive ? '1px solid var(--border-glass)' : '1px solid rgba(239, 68, 68, 0.15)'
              }}
            >
              {/* Status flag */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${plan.isActive ? 'badge-active' : 'badge-expired'}`}>
                  {plan.isActive ? 'Active Plan' : 'Suspended'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)', fontWeight: 500, fontFamily: 'Space Grotesk' }}>
                  {plan.durationMonths} {plan.durationMonths === 1 ? 'Month' : 'Months'}
                </span>
              </div>

              {/* Package Details */}
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-white)' }}>{plan.name}</h3>
                <h2 className="gold-text" style={{ fontSize: '2rem', marginTop: '12px', fontFamily: 'Space Grotesk', fontWeight: 800 }}>
                  ${plan.feeAmount}
                </h2>
                <p style={{ color: 'var(--text-gray)', fontSize: '0.8rem', marginTop: '10px', lineHeight: '1.4' }}>
                  {plan.description || 'No package details description provided.'}
                </p>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '16px' }}>
                <button
                  onClick={() => handleOpenEdit(plan)}
                  className="outline-btn"
                  style={{ flex: 1, padding: '8px', fontSize: '0.8rem', justifyContent: 'center' }}
                >
                  <Edit3 size={14} /> Edit Details
                </button>
                <button
                  onClick={() => handleDelete(plan._id)}
                  className="outline-btn"
                  style={{
                    padding: '8px',
                    borderColor: 'rgba(239, 68, 68, 0.2)',
                    color: 'var(--status-expired)',
                    justifyContent: 'center'
                  }}
                  title="Delete Package"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: '450px',
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              <h2 className="gold-text" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {editingPlan ? 'EDIT MEMBERSHIP PACKAGE' : 'CREATE NEW PACKAGE'}
              </h2>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Name */}
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>PACKAGE NAME</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="premium-input"
                    placeholder="e.g. Standard 3 Months"
                  />
                </div>

                {/* Duration & cost grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>DURATION (MONTHS)</label>
                    <input
                      type="number"
                      name="durationMonths"
                      required
                      value={formData.durationMonths}
                      onChange={handleChange}
                      className="premium-input"
                      min={1}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>PLAN FEE ($)</label>
                    <input
                      type="number"
                      name="feeAmount"
                      required
                      value={formData.feeAmount}
                      onChange={handleChange}
                      className="premium-input"
                      placeholder="e.g. 150"
                      min={0}
                    />
                  </div>

                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>DESCRIPTION</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="premium-input"
                    rows={3}
                    placeholder="Provide details about features included (e.g. locker access, trainers)..."
                    style={{ resize: 'none' }}
                  />
                </div>

                {/* Active Checkbox */}
                {editingPlan && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      name="isActive"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--gold-primary)' }}
                    />
                    <label htmlFor="isActive" style={{ fontSize: '0.85rem', color: 'var(--text-white)', cursor: 'pointer' }}>
                      Set package as Active / Subscribable
                    </label>
                  </div>
                )}

                {errorMsg && (
                  <div style={{ color: 'var(--status-expired)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '6px', fontSize: '0.8rem', textAlign: 'center' }}>
                    {errorMsg}
                  </div>
                )}

                {/* Actions buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="outline-btn"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="gold-btn"
                    style={{ flex: 2, justifyContent: 'center' }}
                  >
                    {submitting ? 'Saving...' : 'Save Package'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
};

export default Plans;
