import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { PlusCircle, Edit3, Trash2, Phone, Mail, Award, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GymLoader from '../components/GymLoader';

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    specialization: '',
    mobile: '',
    email: '',
    salary: '',
    shift: 'Morning',
    photo: '',
    isActive: true
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/trainers');
      setTrainers(data);
    } catch (err) {
      console.error('Error fetching trainers:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenCreate = () => {
    setEditingTrainer(null);
    setFormData({
      fullName: '',
      specialization: '',
      mobile: '',
      email: '',
      salary: '',
      shift: 'Morning',
      photo: '',
      isActive: true
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      fullName: trainer.fullName,
      specialization: trainer.specialization,
      mobile: trainer.mobile,
      email: trainer.email || '',
      salary: trainer.salary,
      shift: trainer.shift,
      photo: trainer.photo || '',
      isActive: trainer.isActive
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      if (editingTrainer) {
        await API.put(`/trainers/${editingTrainer._id}`, formData);
      } else {
        await API.post('/trainers', formData);
      }
      setShowModal(false);
      fetchTrainers();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error saving trainer details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trainer?')) {
      return;
    }

    try {
      await API.delete(`/trainers/${id}`);
      fetchTrainers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting trainer.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title & Actions */}
      <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="gold-text" style={{ fontSize: '1.75rem', fontWeight: 600 }}>GYM TRAINERS MANAGER</h1>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>Track shift rosters, coordinate specializations, and view salary indexes.</p>
        </div>
        <button onClick={handleOpenCreate} className="gold-btn">
          <PlusCircle size={16} /> Add Gym Trainer
        </button>
      </div>

      {/* Grid of trainers */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <GymLoader text="LOADING COACHES INDEX..." color="var(--gold-primary)" />
        </div>
      ) : trainers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-gray)' }}>
          No trainers registered. Click "Add Gym Trainer" to enroll staff.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {trainers.map((trainer) => (
            <motion.div
              key={trainer._id}
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                gap: '16px',
                position: 'relative',
                border: trainer.isActive ? '1px solid var(--border-glass)' : '1px solid rgba(239, 68, 68, 0.15)'
              }}
            >
              {/* Photo */}
              <img
                src={trainer.photo || 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&q=80&w=120'}
                alt={trainer.fullName}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  border: '1px solid var(--border-glass)'
                }}
              />

              {/* Info content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{trainer.fullName}</h3>
                  <span className={`badge ${trainer.isActive ? 'badge-active' : 'badge-expired'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                    {trainer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <p style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                  <Award size={12} /> {trainer.specialization}
                </p>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} /> Shift: <strong>{trainer.shift}</strong>
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'var(--text-gray)', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {trainer.mobile}</span>
                  {trainer.email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {trainer.email}</span>}
                </div>

                {/* Edit Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button
                    onClick={() => handleOpenEdit(trainer)}
                    className="outline-btn"
                    style={{ flex: 1, padding: '4px 8px', fontSize: '0.7rem', justifyContent: 'center' }}
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(trainer._id)}
                    className="outline-btn"
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.7rem',
                      borderColor: 'rgba(239, 68, 68, 0.2)',
                      color: 'var(--status-expired)',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

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
                maxWidth: '460px',
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              <h2 className="gold-text" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {editingTrainer ? 'EDIT TRAINER FILE' : 'REGISTER TRAINER'}
              </h2>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Visual upload path */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <img
                    src={formData.photo || 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&q=80&w=100'}
                    alt=""
                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-glass)' }}
                  />
                  <div>
                    <label className="outline-btn" style={{ padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer' }}>
                      Upload Trainer Photo
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>FULL NAME</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="premium-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>SPECIALIZATION</label>
                    <input
                      type="text"
                      name="specialization"
                      required
                      value={formData.specialization}
                      onChange={handleChange}
                      className="premium-input"
                      placeholder="e.g. Strength / Yoga"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>SALARY ($)</label>
                    <input
                      type="number"
                      name="salary"
                      required
                      value={formData.salary}
                      onChange={handleChange}
                      className="premium-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>MOBILE</label>
                    <input
                      type="tel"
                      name="mobile"
                      required
                      value={formData.mobile}
                      onChange={handleChange}
                      className="premium-input"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>SHIFT</label>
                    <select
                      name="shift"
                      value={formData.shift}
                      onChange={handleChange}
                      className="premium-input"
                    >
                      <option value="Morning">Morning</option>
                      <option value="Evening">Evening</option>
                      <option value="Full Time">Full Time</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>EMAIL</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="premium-input"
                  />
                </div>

                {editingTrainer && (
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
                      Set trainer active
                    </label>
                  </div>
                )}

                {errorMsg && (
                  <div style={{ color: 'var(--status-expired)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '6px', fontSize: '0.8rem', textAlign: 'center' }}>
                    {errorMsg}
                  </div>
                )}

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
                    {submitting ? 'Saving...' : 'Save File'}
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

export default Trainers;
