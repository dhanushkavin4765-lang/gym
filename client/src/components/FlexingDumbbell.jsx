import React from 'react';
import { motion } from 'framer-motion';

const FlexingDumbbell = ({ size = 28, color = 'currentColor' }) => {
  return (
    <motion.div
      whileHover={{
        scale: 1.15,
        rotate: [0, -15, 15, -15, 0],
      }}
      transition={{
        rotate: {
          duration: 0.5,
          ease: "easeInOut",
        },
        scale: {
          type: "spring",
          stiffness: 400,
          damping: 10
        }
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ overflow: 'visible' }}
      >
        {/* Main Shaft (The grip handle) */}
        <motion.line
          x1="6.5"
          y1="6.5"
          x2="17.5"
          y2="17.5"
          animate={{
            strokeWidth: [2.5, 3.5, 2.5]
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* End tips */}
        <line x1="21" y1="21" x2="20" y2="20" />
        <line x1="3" y1="3" x2="4" y2="4" />

        {/* Left/Top Weight plates stack */}
        <motion.path
          d="m18.5 5.5 3 3"
          animate={{
            x: [0, 1.5, 0],
            y: [0, -1.5, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.path
          d="m15.5 8.5 3 3"
          animate={{
            x: [0, 0.8, 0],
            y: [0, -0.8, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Right/Bottom Weight plates stack */}
        <motion.path
          d="m5.5 18.5 3 3"
          animate={{
            x: [0, -1.5, 0],
            y: [0, 1.5, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.path
          d="m8.5 15.5 3 3"
          animate={{
            x: [0, -0.8, 0],
            y: [0, 0.8, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Muscle / Force lines that pop out when flexing (hover) */}
        <motion.path
          d="M 12 6 A 8 8 0 0 1 18 12"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="2 2"
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 0.6, scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
        <motion.path
          d="M 6 12 A 8 8 0 0 1 12 18"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="2 2"
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 0.6, scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
      </svg>
    </motion.div>
  );
};

export default FlexingDumbbell;
