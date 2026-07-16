import React from 'react';
import { motion } from 'framer-motion';

const GymLoader = ({ text = 'PUMPING IRON...', color = 'var(--gold-primary)' }) => {
  // Letters for the loading text animation
  const letters = Array.from(text);

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const letterVariants = {
    initial: { y: 0, opacity: 0.4 },
    animate: {
      y: [0, -5, 0],
      opacity: [0.4, 1, 0.4],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      gap: '24px',
      width: '100%',
      minHeight: '200px',
    }}>
      {/* Barbell Lifting Animation */}
      <div style={{ position: 'relative', width: '160px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Bench Press Support Rack (Background) */}
        <svg width="120" height="60" viewBox="0 0 120 60" style={{ position: 'absolute', bottom: 0, opacity: 0.15 }}>
          {/* Left Rack upright */}
          <line x1="30" y1="60" x2="30" y2="10" stroke="var(--text-white)" strokeWidth="4" strokeLinecap="round" />
          <path d="M 24 10 Q 30 15 36 10" fill="none" stroke="var(--text-white)" strokeWidth="4" strokeLinecap="round" />
          
          {/* Right Rack upright */}
          <line x1="90" y1="60" x2="90" y2="10" stroke="var(--text-white)" strokeWidth="4" strokeLinecap="round" />
          <path d="M 84 10 Q 90 15 96 10" fill="none" stroke="var(--text-white)" strokeWidth="4" strokeLinecap="round" />
          
          {/* Flat Bench */}
          <rect x="40" y="45" width="40" height="8" rx="2" fill="var(--text-white)" />
          <line x1="60" y1="53" x2="60" y2="60" stroke="var(--text-white)" strokeWidth="4" />
        </svg>

        {/* The Barbell */}
        <motion.div
          animate={{
            y: [-15, 20, -15],
            rotate: [-1, 1, -1]
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          {/* Barbell Steel shaft */}
          <div style={{
            width: '140px',
            height: '4px',
            background: 'linear-gradient(to bottom, #d1d5db, #9ca3af, #4b5563)',
            borderRadius: '2px',
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: `0 0 8px rgba(255,255,255,0.2)`
          }}>
            {/* Inner Collar Left */}
            <div style={{ width: '3px', height: '12px', background: '#6b7280', marginLeft: '22px', borderRadius: '1px' }} />
            
            {/* Inner Collar Right */}
            <div style={{ width: '3px', height: '12px', background: '#6b7280', marginRight: '22px', borderRadius: '1px' }} />
          </div>

          {/* Left Side Plates */}
          <div style={{ position: 'absolute', left: '0', display: 'flex', alignItems: 'center', gap: '1px' }}>
            {/* Outer mini plate (5lb) */}
            <div style={{ width: '4px', height: '14px', background: '#4b5563', borderRadius: '2px' }} />
            {/* Medium plate (25lb) */}
            <div style={{ width: '6px', height: '24px', background: '#374151', borderRadius: '3px' }} />
            {/* Large plate (45lb) */}
            <motion.div 
              animate={{ boxShadow: [`0 0 4px ${color}`, `0 0 16px ${color}`, `0 0 4px ${color}`] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              style={{
                width: '10px',
                height: '38px',
                background: color,
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            />
          </div>

          {/* Right Side Plates */}
          <div style={{ position: 'absolute', right: '0', display: 'flex', alignItems: 'center', gap: '1px', flexDirection: 'row-reverse' }}>
            {/* Outer mini plate (5lb) */}
            <div style={{ width: '4px', height: '14px', background: '#4b5563', borderRadius: '2px' }} />
            {/* Medium plate (25lb) */}
            <div style={{ width: '6px', height: '24px', background: '#374151', borderRadius: '3px' }} />
            {/* Large plate (45lb) */}
            <motion.div 
              animate={{ boxShadow: [`0 0 4px ${color}`, `0 0 16px ${color}`, `0 0 4px ${color}`] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              style={{
                width: '10px',
                height: '38px',
                background: color,
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            />
          </div>
        </motion.div>

        {/* Lifting Energy Pulse Wave */}
        <motion.div
          animate={{
            scale: [0.7, 1.3, 0.7],
            opacity: [0.1, 0.4, 0.1]
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: `2px solid ${color}`,
            filter: 'blur(3px)',
            zIndex: 1
          }}
        />
      </div>

      {/* Pulsing Text */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        style={{
          display: 'flex',
          gap: '2px',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-white)',
          letterSpacing: '1.5px',
          fontFamily: 'Space Grotesk',
          textShadow: `0 0 10px rgba(255, 255, 255, 0.15)`
        }}
      >
        {letters.map((char, index) => (
          <motion.span key={index} variants={letterVariants}>
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};

export default GymLoader;
