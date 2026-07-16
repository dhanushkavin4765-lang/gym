import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { Bell, LogOut, CheckCheck, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { admin, logout } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useContext(NotificationContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      height: '75px',
      borderBottom: '1px solid var(--border-glass)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 30px',
      background: 'rgba(10, 11, 15, 0.5)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Greetings */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>
          Welcome back, <span className="gold-text">{admin?.name || 'Administrator'}</span>
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>Iron Dome Security Dashboard</p>
      </div>

      {/* Profile & Notifications Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative' }}>
        
        {/* Notification Bell */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'rgba(197, 160, 89, 0.05)',
              border: '1px solid var(--border-glass)',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-white)',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
          >
            <Bell size={20} />
          </button>
          
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              background: 'var(--status-expired)',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
            }}>
              {unreadCount}
            </span>
          )}

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '55px',
              right: 0,
              width: '380px',
              maxHeight: '450px',
              overflowY: 'auto',
              zIndex: 100,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(197, 160, 89, 0.1)', paddingBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }} className="gold-text">Notifications ({unreadCount})</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      title="Mark all as read"
                      style={{ background: 'none', border: 'none', color: 'var(--status-active)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <CheckCheck size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '350px' }}>
                {notifications.length === 0 ? (
                  <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>No active notifications</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: notif.readStatus ? 'rgba(255, 255, 255, 0.02)' : 'rgba(197, 160, 89, 0.06)',
                        borderLeft: `4px solid ${
                          notif.type === 'Expired'
                            ? 'var(--status-expired)'
                            : notif.type === 'Expiring Soon'
                            ? 'var(--status-warning)'
                            : 'var(--gold-primary)'
                        }`,
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '20px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: notif.readStatus ? 'var(--text-white)' : 'var(--gold-primary)' }}>
                          {notif.title}
                        </span>
                        <button
                          onClick={() => deleteNotification(notif._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-gray)',
                            cursor: 'pointer',
                            position: 'absolute',
                            right: '8px',
                            top: '8px'
                          }}
                          title="Delete alert"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', lineHeight: '1.25' }}>{notif.message}</p>
                      
                      {!notif.readStatus && (
                        <button
                          onClick={() => markAsRead(notif._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--gold-secondary)',
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                            alignSelf: 'flex-end',
                            marginTop: '2px',
                            fontWeight: 500
                          }}
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={admin?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
            alt="Admin profile"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: '2px solid var(--gold-secondary)',
              objectFit: 'cover'
            }}
          />
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-gray)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '6px',
              transition: 'var(--transition-smooth)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--status-expired)'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-gray)'; e.currentTarget.style.background = 'none'; }}
            title="Log out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
