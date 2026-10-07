import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onFileSelect }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <motion.label 
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        animate={{
          scale: isDragActive || isHovered ? 1.01 : 1,
          borderColor: isDragActive ? 'rgba(59, 130, 246, 0.4)' : isHovered ? 'rgba(148, 163, 184, 0.4)' : 'rgba(226, 232, 240, 1)',
          backgroundColor: isDragActive ? 'rgba(239, 246, 255, 0.5)' : isHovered ? 'rgba(248, 250, 252, 1)' : 'rgba(255, 255, 255, 1)',
          boxShadow: isDragActive || isHovered ? '0 10px 40px -10px rgba(0,0,0,0.05)' : '0 0px 0px 0px rgba(0,0,0,0)'
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center w-full aspect-[3/1] min-h-[300px] border rounded-xl cursor-pointer relative overflow-hidden"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4 z-10">
          <motion.svg 
            animate={{ 
              y: isDragActive ? -4 : isHovered ? -2 : 0,
              color: isDragActive ? '#3b82f6' : isHovered ? '#64748b' : '#94a3b8'
            }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </motion.svg>
          
          <div className="text-center">
            <motion.p 
              animate={{ color: isDragActive ? '#1e293b' : '#0f172a' }}
              className="text-lg font-medium mb-1"
            >
              {isDragActive ? 'Drop to analyze' : 'Drop an image to analyze'}
            </motion.p>
            <p className="text-[var(--color-text-muted)] text-sm">
              JPEG · PNG · WEBP
            </p>
          </div>

          <motion.div 
            animate={{ 
              backgroundColor: isDragActive ? '#dbeafe' : '#f1f5f9',
              color: isDragActive ? '#2563eb' : '#0f172a'
            }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 px-4 py-2 rounded-md text-sm font-medium subtle-transition"
          >
            Browse files
          </motion.div>
        </div>
        
        <input 
          type="file" 
          className="hidden" 
          accept="image/jpeg, image/png, image/webp"
          onChange={handleChange}
        />
      </motion.label>
    </div>
  );
};
