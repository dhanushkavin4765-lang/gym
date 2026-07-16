import React from 'react';
import { motion } from 'framer-motion';

// Gym-themed SVG Icons to render
const DumbbellIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6.5 6.5 11 11" />
    <path d="m21 21-1-1" />
    <path d="m3 3 1 1" />
    <path d="m18.5 5.5 3 3" />
    <path d="m15.5 8.5 3 3" />
    <path d="m5.5 18.5 3 3" />
    <path d="m8.5 15.5 3 3" />
    <path d="M20 7h1" />
    <path d="M3 17h1" />
  </svg>
);

const KettlebellIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a4 4 0 0 0-4 4v3h8V6a4 4 0 0 0-4-4z" />
    <path d="M6 9h12a3 3 0 0 1 3 3v5a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-5a3 3 0 0 1 3-3z" />
    <circle cx="12" cy="16" r="2" />
  </svg>
);

const PlateIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1" />
    <path d="M12 2v6" />
    <path d="M12 16v6" />
    <path d="M2 12h6" />
    <path d="M16 12h6" />
  </svg>
);

const FlameIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const HeartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const ActivityIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const FloatingGymBackground = ({ activeRole = 'admin' }) => {
  // Generate pseudo-random configuration for floating icons
  // Since we want this to be deterministic on mount to avoid hydration mismatch, we define them statically
  const floatingItems = [
    { Icon: DumbbellIcon, x: '8%', y: '15%', size: 40, duration: 15, delay: 0 },
    { Icon: KettlebellIcon, x: '85%', y: '12%', size: 36, duration: 18, delay: 2 },
    { Icon: PlateIcon, x: '78%', y: '75%', size: 48, duration: 22, delay: 1 },
    { Icon: FlameIcon, x: '12%', y: '68%', size: 32, duration: 14, delay: 3 },
    { Icon: HeartIcon, x: '50%', y: '8%', size: 28, duration: 16, delay: 5 },
    { Icon: ActivityIcon, x: '92%', y: '45%', size: 38, duration: 20, delay: 2 },
    { Icon: DumbbellIcon, x: '42%', y: '82%', size: 34, duration: 17, delay: 4 },
    { Icon: KettlebellIcon, x: '25%', y: '42%', size: 30, duration: 19, delay: 6 },
    { Icon: PlateIcon, x: '72%', y: '30%', size: 44, duration: 24, delay: 3 },
    { Icon: FlameIcon, x: '60%', y: '60%', size: 28, duration: 13, delay: 1 },
  ];

  // Pick glowing color based on active login role
  const glowColor = activeRole === 'admin' ? 'rgba(197, 160, 89, 0.15)' : 'rgba(16, 185, 129, 0.15)';

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: 0
    }}>
      {floatingItems.map((item, idx) => {
        const IconComponent = item.Icon;
        return (
          <motion.div
            key={idx}
            initial={{
              x: 0,
              y: 0,
              opacity: 0
            }}
            animate={{
              y: [0, -35, 0],
              x: [0, 15, 0],
              rotate: [0, 360],
              opacity: [0.08, 0.22, 0.08]
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              delay: item.delay,
              ease: "easeInOut"
            }}
            style={{
              position: 'absolute',
              left: item.x,
              top: item.y,
              color: activeRole === 'admin' ? 'var(--gold-secondary)' : '#10b981',
              filter: `drop-shadow(0 0 8px ${glowColor})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ transform: `scale(${item.size / 24})` }}>
              <IconComponent />
            </div>
          </motion.div>
        );
      })}

      {/* Grid line patterns in the background to look like a virtual arena */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.01) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.5,
        zIndex: -1
      }} />
    </div>
  );
};

export default FloatingGymBackground;
