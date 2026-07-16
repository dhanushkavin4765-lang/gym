import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  CalendarDays,
  DollarSign,
  ShieldAlert,
  Key,
  Settings,
  ChevronLeft,
  ChevronRight,
  Dumbbell
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ isCollapsed, setIsCollapsed, logout }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Register Member', path: '/register', icon: UserPlus },
    { name: 'Member Directory', path: '/members', icon: Users },
    { name: 'Attendance Logs', path: '/attendance', icon: CalendarDays },
    { name: 'Fees & Plans', path: '/plans', icon: DollarSign },
    { name: 'Trainers Manager', path: '/trainers', icon: ShieldAlert }, // Changed icon to ShieldAlert/Users check
    { name: 'PIN check-in Mode', path: '/kiosk', icon: Key, external: false },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <motion.div
      animate={{ width: isCollapsed ? '80px' : '260px' }}
      transition={{ duration: 0.3, cubicBezier: [0.4, 0, 0.2, 1] }}
      style={{
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-glass)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Header Logo */}
      <div style={{
        padding: '24px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid rgba(197, 160, 89, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-secondary))',
          borderRadius: '8px',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-dark)',
          boxShadow: '0 0 15px var(--gold-glow)'
        }}>
          <Dumbbell size={22} />
        </div>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="gold-text"
            style={{ fontSize: '1.2rem', letterSpacing: '1px' }}
          >
            IRON DOME
          </motion.span>
        )}
      </div>

      {/* Navigation Items */}
      <div style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px 16px',
              borderRadius: '8px',
              color: isActive ? 'var(--text-dark)' : 'var(--text-gray)',
              background: isActive ? 'linear-gradient(135deg, var(--gold-primary) 0%, var(--gold-secondary) 100%)' : 'transparent',
              textDecoration: 'none',
              transition: 'var(--transition-smooth)',
              boxShadow: isActive ? '0 4px 15px rgba(212, 175, 55, 0.2)' : 'none',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            })}
            title={item.name}
          >
            <item.icon size={20} style={{ minWidth: '20px' }} />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ fontSize: '0.95rem', fontWeight: 500 }}
              >
                {item.name}
              </motion.span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom Toggle and Logout */}
      <div style={{
        padding: '16px 12px',
        borderTop: '1px solid rgba(197, 160, 89, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: 'rgba(197, 160, 89, 0.05)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-gray)',
            padding: '8px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition-smooth)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold-secondary)'; e.currentTarget.style.color = 'var(--text-white)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-glass)'; e.currentTarget.style.color = 'var(--text-gray)'; }}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
