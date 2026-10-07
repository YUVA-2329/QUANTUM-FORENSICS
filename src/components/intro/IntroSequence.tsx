import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface IntroSequenceProps {
  onComplete: () => void;
}

export const IntroSequence: React.FC<IntroSequenceProps> = ({ onComplete }) => {
  useEffect(() => {
    // 3 second total duration
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      className="fixed inset-0 z-50 bg-[#020617] flex items-center justify-center overflow-hidden"
    >
      {/* Deep atmospheric background glow */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_60%)] pointer-events-none"
      />

      {/* Cinematic container slow-zoom */}
      <motion.div 
        initial={{ scale: 0.96 }}
        animate={{ scale: 1.02 }}
        transition={{ duration: 3.5, ease: "linear" }}
        className="relative flex flex-col items-center justify-center z-10 w-full"
      >
        {/* Main Title Reveal with blur and tracking expansion */}
        <motion.h1
          initial={{ opacity: 0, filter: 'blur(12px)', y: 10 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold text-white text-center tracking-[0.25em] pl-[0.25em]" // pl offsets tracking for centering
        >
          QUANTUM FORENSICS
        </motion.h1>

        {/* Elegant dividing line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut", delay: 0.8 }}
          className="h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent w-64 md:w-96 my-6 origin-center"
        />

        {/* Subtitle Mask Reveal */}
        <div className="overflow-hidden">
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 1.2 }}
            className="text-xs md:text-sm font-medium text-slate-400 tracking-[0.4em] uppercase text-center pl-[0.4em]"
          >
            Digital Image Analysis
          </motion.div>
        </div>
      </motion.div>
      
      {/* Subtle scanning light effect moving horizontally */}
      <motion.div 
        initial={{ left: '-10%', opacity: 0 }}
        animate={{ left: '110%', opacity: [0, 0.5, 0] }}
        transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-1/2 -translate-y-1/2 w-64 h-32 bg-blue-400/10 blur-[40px] rounded-full pointer-events-none transform -skew-x-12"
      />
    </motion.div>
  );
};
