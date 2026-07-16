import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { Settings as SettingsIcon, ShieldCheck, Database, Save, Loader, Download, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
  const { admin, updateProfile } = useContext(AuthContext);

  // Profile data state
  const [profileForm, setProfileForm] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    avatar: admin?.avatar || ''
  });
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Backup & Restore states
  const [backupStatus, setBackupStatus] = useState('');
  const [restoreStatus, setRestoreStatus] = useState('');

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });
    setProfileLoading(true);

    const res = await updateProfile(profileForm);
    setProfileLoading(false);

    if (res.success) {
      setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
    } else {
      setProfileMsg({ text: res.message, type: 'error' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordMsg({ text: 'New passwords do not match', type: 'error' });
    }

    setPasswordLoading(true);
    try {
      const { data } = await API.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setPasswordMsg({ text: data.message || 'Password changed successfully!', type: 'success' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordMsg({
        text: error.response?.data?.message || 'Password update failed',
        type: 'error'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Mock Database Backup
  const handleBackup = () => {
    setBackupStatus('initial');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      if (progress >= 100) {
        clearInterval(interval);
        setBackupStatus('complete');
        // Trigger mockup download of database snapshot JSON
        const backupData = {
          system: 'Iron Dome Gym Management',
          timestamp: new Date().toISOString(),
          collections: ['Admin', 'Members', 'Attendance', 'Payments', 'MembershipPlans', 'Notifications', 'Trainers']
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `gym_db_backup_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    }, 400);
  };

  // Mock Database Restore
  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRestoreStatus('loading');
      setTimeout(() => {
        setRestoreStatus('complete');
        alert('Database restored successfully from backup file!');
        setRestoreStatus('');
      }, 2000);
    }
  };

  // CSV Export functions
  const convertToCSV = (objArray) => {
    if (objArray.length === 0) return '';
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    const headers = Object.keys(array[0]);
    let str = headers.join(',') + '\r\n';

    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (let index in headers) {
        if (line !== '') line += ',';
        let val = array[i][headers[index]];
        if (val === undefined || val === null) {
          val = '';
        } else {
          val = String(val).replace(/"/g, '""');
        }
        line += `"${val}"`;
      }
      str += line + '\r\n';
    }
    return str;
  };

  const handleExportCSV = async (type) => {
    try {
      const { data } = await API.get(`/reports/export/${type}`);
      if (data && data.length > 0) {
        const csvContent = convertToCSV(data);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `gym_${type}_report_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.remove(link);
      } else {
        alert(`No data available to export for: ${type}`);
      }
    } catch (error) {
      console.error(`Error exporting ${type} report:`, error);
      alert(`Failed to export report: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Title */}
      <div>
        <h1 className="gold-text" style={{ fontSize: '1.75rem', fontWeight: 600 }}>SYSTEM SETTINGS</h1>
        <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>Configure security details, adjust profiles, and trigger database actions.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '30px' }}>
        
        {/* PROFILE CONFIG PANEL */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }} className="gold-text">
            <SettingsIcon size={18} /> Profile Configuration
          </h3>

          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Avatar uploader */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <img
                src={profileForm.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                alt=""
                style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold-secondary)' }}
              />
              <label className="outline-btn" style={{ padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer' }}>
                Change Avatar
                <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
              </label>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>ADMIN DISPLAY NAME</label>
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                required
                className="premium-input"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>EMAIL ADDRESS</label>
              <input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                required
                className="premium-input"
              />
            </div>

            {profileMsg.text && (
              <div style={{
                color: profileMsg.type === 'success' ? 'var(--status-active)' : 'var(--status-expired)',
                fontSize: '0.8rem',
                textAlign: 'center'
              }}>
                {profileMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={profileLoading}
              className="gold-btn"
              style={{ justifyContent: 'center', marginTop: '10px' }}
            >
              {profileLoading ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>

          </form>
        </div>

        {/* PASSWORD CONFIG PANEL */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }} className="gold-text">
            <ShieldCheck size={18} /> Update Security Key
          </h3>

          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>CURRENT PASSWORD</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
                className="premium-input"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>NEW PASSWORD</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                className="premium-input"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'block', marginBottom: '6px' }}>CONFIRM NEW PASSWORD</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
                className="premium-input"
              />
            </div>

            {passwordMsg.text && (
              <div style={{
                color: passwordMsg.type === 'success' ? 'var(--status-active)' : 'var(--status-expired)',
                fontSize: '0.8rem',
                textAlign: 'center'
              }}>
                {passwordMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="gold-btn"
              style={{ justifyContent: 'center', marginTop: '10px' }}
            >
              {passwordLoading ? <Loader size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              Update Security Code
            </button>

          </form>
        </div>

        {/* DATABASE BACKUP AND RESTORE PANEL */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }} className="gold-text">
            <Database size={18} /> Database Utilities
          </h3>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.8rem', lineHeight: '1.4' }}>
            Backup your entire MongoDB schemas including Admin profile credentials, athlete details collections, payment transaction records, and logs database configurations as a structured JSON file.
          </p>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
            
            {/* Backup Button */}
            <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleBackup}
                disabled={backupStatus === 'initial'}
                className="outline-btn"
                style={{ justifyContent: 'center', padding: '14px', width: '100%' }}
              >
                {backupStatus === 'initial' ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Packaging Snapshot...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Backup Database
                  </>
                )}
              </button>
              {backupStatus === 'complete' && <span style={{ fontSize: '0.75rem', color: 'var(--status-active)', textAlign: 'center' }}>Database Snapshot JSON created!</span>}
            </div>

            {/* Restore Button */}
            <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                className="outline-btn"
                style={{
                  justifyContent: 'center',
                  padding: '14px',
                  width: '100%',
                  cursor: restoreStatus === 'loading' ? 'not-allowed' : 'pointer',
                  borderColor: 'var(--gold-secondary)',
                  opacity: restoreStatus === 'loading' ? 0.6 : 1
                }}
              >
                {restoreStatus === 'loading' ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Restoring Structures...
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    Restore Database
                  </>
                )}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestore}
                  disabled={restoreStatus === 'loading'}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

          </div>
        </div>

        {/* CSV REPORT EXPORT PANEL */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }} className="gold-text">
            <Download size={18} /> Export Database to CSV
          </h3>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.8rem', lineHeight: '1.4' }}>
            Export database collections and log metrics directly as structured `.csv` spreadsheet files for analysis in Excel or other programs.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '10px' }}>
            <button
              onClick={() => handleExportCSV('payments')}
              className="outline-btn"
              style={{ flex: 1, minWidth: '180px', justifyContent: 'center', padding: '12px', borderColor: 'var(--gold-secondary)' }}
            >
              <Download size={14} style={{ marginRight: '6px' }} /> Export Members CSV
            </button>

            <button
              onClick={() => handleExportCSV('attendance')}
              className="outline-btn"
              style={{ flex: 1, minWidth: '180px', justifyContent: 'center', padding: '12px', borderColor: 'var(--gold-secondary)' }}
            >
              <Download size={14} style={{ marginRight: '6px' }} /> Export Attendance CSV
            </button>

            <button
              onClick={() => handleExportCSV('income')}
              className="outline-btn"
              style={{ flex: 1, minWidth: '180px', justifyContent: 'center', padding: '12px', borderColor: 'var(--gold-secondary)' }}
            >
              <Download size={14} style={{ marginRight: '6px' }} /> Export Payments/Income CSV
            </button>

            <button
              onClick={() => handleExportCSV('expired')}
              className="outline-btn"
              style={{ flex: 1, minWidth: '180px', justifyContent: 'center', padding: '12px', borderColor: 'rgba(239, 68, 68, 0.4)', color: 'var(--status-expired)' }}
            >
              <Download size={14} style={{ marginRight: '6px' }} /> Export Expired Members CSV
            </button>
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
      `}</style>

    </div>
  );
};

export default Settings;
