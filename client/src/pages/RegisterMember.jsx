import React, { useEffect, useState, useRef } from 'react';
import API from '../services/api';
import { Camera, Upload, Trash2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RegisterMember = () => {
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    gender: 'Male',
    age: '',
    address: '',
    height: '',
    weight: '',
    emergencyContact: '',
    planId: '',
    joiningDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD local
    feesPaid: 0,
    paymentMethod: 'Cash',
  });

  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);
  const [photoBase64, setPhotoBase64] = useState('');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Fetch active plans on load
  useEffect(() => {
    const fetchActivePlans = async () => {
      try {
        const { data } = await API.get('/plans/active');
        setPlans(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, planId: data[0]._id }));
          setSelectedPlanDetails(data[0]);
        }
      } catch (error) {
        console.error('Error loading membership plans:', error.message);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchActivePlans();
  }, []);

  // Update selected plan cost/duration when plan selection changes
  useEffect(() => {
    if (formData.planId && plans.length > 0) {
      const match = plans.find((p) => p._id === formData.planId);
      setSelectedPlanDetails(match);
      setFormData((prev) => ({ ...prev, feesPaid: match?.feeAmount || 0 }));
    }
  }, [formData.planId, plans]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Convert uploaded image to base64
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Webcam stream controls
  const startWebcam = async () => {
    setIsWebcamActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Webcam access error:', err);
      setIsWebcamActive(false);
      alert('Could not access webcam. Please upload a photo instead.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataURL = canvas.toDataURL('image/jpeg');
      setPhotoBase64(dataURL);
      stopWebcam();
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsWebcamActive(false);
  };

  const clearPhoto = () => {
    setPhotoBase64('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const submissionData = {
        ...formData,
        photo: photoBase64
      };

      const { data } = await API.post('/members', submissionData);
      setSuccessResult(data);
      // Reset form
      setFormData({
        fullName: '',
        mobile: '',
        gender: 'Male',
        age: '',
        address: '',
        height: '',
        weight: '',
        emergencyContact: '',
        planId: plans[0]?._id || '',
        joiningDate: new Date().toLocaleDateString('en-CA'),
        feesPaid: plans[0]?.feeAmount || 0,
        paymentMethod: 'Cash',
      });
      setPhotoBase64('');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to register member. Please check values.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '900px', margin: '0 auto' }}>
      
      <div>
        <h1 className="gold-text" style={{ fontSize: '1.75rem', fontWeight: 600 }}>REGISTER MEMBER</h1>
        <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>Create profile, generate secure credentials, and record subscriptions.</p>
      </div>

      <AnimatePresence mode="wait">
        {successResult ? (
          // Registration Success Splash Card
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel"
            style={{
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '24px'
            }}
          >
            <div style={{ color: 'var(--status-active)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={60} />
              <h2 className="gold-text" style={{ fontSize: '1.8rem', fontWeight: 700 }}>REGISTRATION SUCCESSFUL!</h2>
            </div>
            
            <p style={{ color: 'var(--text-white)', maxWidth: '500px' }}>
              Member <strong>{successResult.fullName}</strong> has been enrolled successfully. Write down or print the secure details below:
            </p>

            {/* Generated Card Container */}
            <div style={{
              display: 'flex',
              gap: '40px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginTop: '10px'
            }}>
              {/* Profile details */}
              <div style={{
                textAlign: 'left',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-glass)',
                padding: '24px',
                borderRadius: '12px',
                minWidth: '280px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>MEMBER ID:</span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--gold-primary)', fontFamily: 'Space Grotesk' }}>{successResult.memberId}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>SECURE ATTENDANCE PIN:</span>
                  <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#10b981', fontFamily: 'Space Grotesk', letterSpacing: '2px' }}>{successResult.pin}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-gray)', marginTop: '2px' }}>This PIN is unique. Member must enter this PIN to check-in.</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>MEMBERSHIP STATUS:</span>
                  <p style={{ fontSize: '0.95rem' }}><span className="badge badge-active">{successResult.status}</span></p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>EXPIRY DATE:</span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>{new Date(successResult.expiryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSuccessResult(null)}
              className="gold-btn"
              style={{ marginTop: '20px' }}
            >
              Register Another Member
            </button>
          </motion.div>
        ) : (
          // Main Registration Form
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-panel"
            style={{ padding: '30px' }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Photo & Basic Details section */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
                
                {/* Photo uploader / Webcam capture pane */}
                <div style={{
                  flex: '1 1 250px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)', fontWeight: 500, alignSelf: 'flex-start' }}>MEMBER PHOTO</span>
                  
                  <div style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '16px',
                    border: '2px dashed var(--border-glass)',
                    background: 'rgba(10, 11, 15, 0.4)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    {photoBase64 ? (
                      <img src={photoBase64} alt="Member preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : isWebcamActive ? (
                      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ color: 'var(--text-gray)', fontSize: '0.75rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <Camera size={24} />
                        <span>No Photo Selected</span>
                      </div>
                    )}

                    {/* Canvas used for capture */}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                  </div>

                  {/* Photo Actions */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {isWebcamActive ? (
                      <>
                        <button type="button" onClick={capturePhoto} className="gold-btn" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                          Capture
                        </button>
                        <button type="button" onClick={stopWebcam} className="outline-btn" style={{ padding: '7px 11px', fontSize: '0.8rem', color: 'var(--status-expired)', borderColor: 'var(--status-expired)' }}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={startWebcam} className="outline-btn" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                          <Camera size={14} />
                          Webcam
                        </button>
                        <label className="outline-btn" style={{ padding: '8px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>
                          <Upload size={14} />
                          Upload
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                        </label>
                      </>
                    )}

                    {photoBase64 && (
                      <button type="button" onClick={clearPhoto} className="outline-btn" style={{ padding: '8px 10px', color: 'var(--status-expired)', borderColor: 'rgba(239, 68, 68, 0.4)' }} title="Clear Photo">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Basic Personal details */}
                <div style={{ flex: '2 2 450px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>FULL NAME</label>
                    <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="premium-input" placeholder="e.g. John Doe" />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>MOBILE NUMBER</label>
                    <input type="tel" name="mobile" required value={formData.mobile} onChange={handleChange} className="premium-input" placeholder="e.g. +1 555-0199" />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>EMERGENCY CONTACT</label>
                    <input type="tel" name="emergencyContact" required value={formData.emergencyContact} onChange={handleChange} className="premium-input" placeholder="e.g. Spouse / Parent Contact" />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>GENDER</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="premium-input">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>AGE</label>
                    <input type="number" name="age" required value={formData.age} onChange={handleChange} className="premium-input" placeholder="e.g. 25" min={1} />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>HOME ADDRESS</label>
                    <input type="text" name="address" required value={formData.address} onChange={handleChange} className="premium-input" placeholder="e.g. 123 Main St, New York" />
                  </div>

                </div>

              </div>

              {/* Physical Metrics and Subscriptions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', borderTop: '1px solid rgba(197, 160, 89, 0.1)', paddingTop: '20px' }}>
                
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>HEIGHT (CM)</label>
                  <input type="number" name="height" required value={formData.height} onChange={handleChange} className="premium-input" placeholder="e.g. 175" min={10} />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>WEIGHT (KG)</label>
                  <input type="number" name="weight" required value={formData.weight} onChange={handleChange} className="premium-input" placeholder="e.g. 70" min={10} />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>JOINING DATE</label>
                  <input type="date" name="joiningDate" required value={formData.joiningDate} onChange={handleChange} className="premium-input" />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>MEMBERSHIP PLAN</label>
                  {loadingPlans ? (
                    <select disabled className="premium-input"><option>Loading plans...</option></select>
                  ) : (
                    <select name="planId" value={formData.planId} onChange={handleChange} className="premium-input">
                      {plans.map((plan) => (
                        <option key={plan._id} value={plan._id}>{plan.name} (${plan.feeAmount})</option>
                      ))}
                    </select>
                  )}
                </div>

              </div>

              {/* Invoicing Section */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid var(--border-glass)',
                padding: '24px',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '24px'
              }}>
                {/* Auto Calculated Pricing tags */}
                <div style={{ display: 'flex', gap: '30px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>TOTAL MEMBERSHIP FEES</span>
                    <h3 style={{ fontSize: '1.6rem', color: 'var(--gold-primary)', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                      ${selectedPlanDetails ? selectedPlanDetails.feeAmount : 0}
                    </h3>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>PLAN DURATION</span>
                    <h3 style={{ fontSize: '1.6rem', color: 'var(--text-white)', fontWeight: 600 }}>
                      {selectedPlanDetails ? `${selectedPlanDetails.durationMonths} Months` : 'N/A'}
                    </h3>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>OUTSTANDING FEES BALANCE</span>
                    <h3 style={{ fontSize: '1.6rem', color: 'var(--status-warning)', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                      ${selectedPlanDetails ? Math.max(0, selectedPlanDetails.feeAmount - (Number(formData.feesPaid) || 0)) : 0}
                    </h3>
                  </div>
                </div>

                {/* Entry Inputs for Payment */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>FEES PAID ($)</label>
                    <input
                      type="number"
                      name="feesPaid"
                      value={formData.feesPaid}
                      onChange={handleChange}
                      className="premium-input"
                      style={{ width: '130px' }}
                      min={0}
                      max={selectedPlanDetails ? selectedPlanDetails.feeAmount : 0}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>PAYMENT METHOD</label>
                    <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="premium-input" style={{ width: '150px' }}>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

              </div>

              {errorMsg && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: 'var(--status-expired)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  textAlign: 'center'
                }}>
                  {errorMsg}
                </div>
              )}

              {/* Submit Buttons */}
              <button
                type="submit"
                disabled={submitting}
                className="gold-btn"
                style={{ width: '100%', padding: '14px', fontSize: '1rem', justifyContent: 'center' }}
              >
                {submitting ? 'GENERATING SECURE CREDENTIALS...' : 'COMPLETE MEMBER REGISTRATION'}
              </button>

            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default RegisterMember;
