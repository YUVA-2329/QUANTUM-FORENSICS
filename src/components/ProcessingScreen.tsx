import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProcessingScreenProps {
  status: string;
  progress: number;
  file: File | null;
}

const contextualLabels = [
  "Extracting visual evidence",
  "Computing error level differences",
  "Extracting localized features",
  "Running model inference",
  "Evaluating compression gradients",
  "Compiling forensic results"
];

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ file }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [labelIndex, setLabelIndex] = useState(0);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLabelIndex(i => (i + 1) % contextualLabels.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full p-8 md:p-12 flex flex-col items-center">
      {/* Uploaded Image Preview */}
      {imageUrl && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          whileHover={{ scale: 1.01 }}
          className="relative rounded-lg overflow-hidden border border-[var(--color-surface-border)] shadow-sm mb-12 max-w-[240px] w-full aspect-square bg-slate-100 flex items-center justify-center"
        >
          <img src={imageUrl} alt="Target" className="w-full h-full object-cover" />
          <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] pointer-events-none rounded-lg" />
        </motion.div>
      )}

      {/* Honest Loading State */}
      <div className="flex flex-col items-center justify-center space-y-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, ease: "linear", repeat: Infinity }}
          className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full"
        />
        
        <div className="text-center">
          <h2 className="text-lg font-medium text-[var(--color-text-primary)] mb-2 tracking-tight">ANALYZING IMAGE</h2>
          
          <div className="h-6 relative overflow-hidden flex justify-center">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={labelIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="text-sm text-[var(--color-text-secondary)] absolute"
              >
                {contextualLabels[labelIndex]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
