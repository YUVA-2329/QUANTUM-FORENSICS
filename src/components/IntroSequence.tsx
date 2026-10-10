import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const IntroSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fast count to 100 over 1.5 seconds
    const duration = 1500;
    const interval = 16;
    let elapsed = 0;
    
    const timer = setInterval(() => {
      elapsed += interval;
      const p = Math.min(100, (elapsed / duration) * 100);
      // Easing out curve
      const easedP = 100 - 100 * Math.pow(1 - p/100, 3);
      setProgress(easedP);
      
      if (elapsed >= duration) {
        clearInterval(timer);
        setTimeout(onComplete, 500); // Hold at 100% for 0.5s before unmounting
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[200] bg-[#02040a] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background grid/scan lines */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        transform: 'perspective(500px) rotateX(60deg) scale(2) translateY(-100px)',
      }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="w-24 h-24 relative mb-8">
          <motion.svg 
            viewBox="0 0 100 100" 
            className="absolute inset-0 w-full h-full text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
          >
            <motion.circle 
              cx="50" cy="50" r="48" 
              fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" 
            />
            <motion.circle 
              cx="50" cy="50" r="48" 
              fill="none" stroke="currentColor" strokeWidth="2" 
              strokeDasharray="301.59"
              strokeDashoffset={301.59 - (301.59 * progress) / 100}
              strokeLinecap="round"
              className="origin-center -rotate-90"
            />
          </motion.svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-mono text-xl font-bold">{Math.floor(progress)}%</span>
          </div>
        </div>

        <h1 className="text-white text-3xl font-bold tracking-[0.2em] uppercase" style={{ fontFamily: "'Sora', sans-serif" }}>
          Neural
        </h1>
        <p className="text-gray-500 text-sm tracking-[0.3em] uppercase mt-2 font-mono">
          Quantum Forensics Engine
        </p>

        {/* Loading bar */}
        <div className="w-64 h-1 bg-white/10 rounded-full mt-8 overflow-hidden relative">
          <motion.div 
            className="absolute top-0 left-0 bottom-0 bg-white"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-1/2 -translate-x-full animate-[shimmer_1s_infinite]" />
        </div>
      </motion.div>
    </motion.div>
  );
};
