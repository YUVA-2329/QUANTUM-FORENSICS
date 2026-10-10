import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import type { AnalysisResult } from '../api';
import { ThreeDPaper } from '../shaders/3d-paper/ThreeDPaper';

interface ResultWorkspaceProps {
  file: File;
  result: AnalysisResult;
  onReset: () => void;
}

const NumberCounter = ({ value, isPercentage = false, duration = 1.5 }: { value: number, isPercentage?: boolean, duration?: number }) => {
  const count = useMotionValue(0);
  const display = useTransform(count, (latest) => 
    isPercentage ? `${latest.toFixed(1)}%` : latest.toFixed(2)
  );

  useEffect(() => {
    const controls = animate(count, value, {
      duration,
      ease: "easeOut"
    });
    return controls.stop;
  }, [value, duration]);

  return <motion.span>{display}</motion.span>;
};

export const ResultWorkspace: React.FC<ResultWorkspaceProps> = ({ file, result, onReset }) => {
  const [imageUrl] = useState(() => URL.createObjectURL(file));
  
  const isTampered = result.verdict === 'TAMPERED';
  const themeColor = isTampered ? '#ef4444' : '#3b82f6';

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full flex flex-col space-y-6 pb-20 mt-2"
    >
      {/* Header Verdict */}
      <motion.div variants={item} className="flex flex-col md:flex-row items-start md:items-end justify-between mb-2">
        <div>
          <h2 className="text-sm text-slate-400 font-medium mb-1 tracking-tight">Analysis Result</h2>
          <div className="flex items-center space-x-3">
            <motion.span 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="text-4xl md:text-5xl font-medium tracking-tight drop-shadow-2xl"
              style={{ color: themeColor }}
            >
              {isTampered ? '⚠️ Potentially Tampered' : '✓ Authentic'}
            </motion.span>
          </div>
        </div>

        <div className="mt-6 md:mt-0 flex flex-col items-start md:items-end">
          <div className="text-4xl md:text-5xl font-medium text-white tracking-tight">
            <NumberCounter value={result.confidence * 100} isPercentage={true} />
          </div>
          <div className="text-sm text-slate-400 font-medium mt-1 uppercase tracking-widest">
            confidence
          </div>
        </div>
      </motion.div>
      
      <motion.p variants={item} className="text-[#94a3b8] text-sm max-w-2xl mb-4 leading-relaxed">
        {isTampered 
          ? 'The image contains compression patterns that differ significantly across regions, indicating potential localized manipulation.' 
          : 'The image displays consistent compression patterns across all regions, typical of an unmodified file.'}
      </motion.p>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - 3D Paper Presentation */}
        <motion.div variants={item} className="lg:col-span-2 flex flex-col relative min-h-[600px] bg-[#0a0a0c] rounded-2xl overflow-hidden shadow-2xl">
           
           <ThreeDPaper variant="original" imageUrl={imageUrl} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
           
           <div className="absolute top-6 right-6 z-20">
              <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.98 }}
                onClick={onReset}
                className="text-xs font-semibold px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-md text-white shadow-lg subtle-transition tracking-wide"
              >
                Analyze New Image
              </motion.button>
           </div>
           
           <div className="absolute bottom-10 right-10 z-20 text-right pointer-events-none drop-shadow-md">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
                className="text-5xl font-bold tracking-tighter" 
                style={{ color: themeColor }}
              >
                {result.verdict}
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 1.2 }}
                className="text-white/80 text-sm mt-2 uppercase tracking-widest font-medium"
              >
                {isTampered ? 'Manipulation Detected' : 'No Alteration Found'}
              </motion.div>
           </div>
           
           {/* Scan Line Animation Overlay */}
           <motion.div 
             initial={{ top: '-10%', opacity: 0 }}
             animate={{ top: '110%', opacity: [0, 1, 1, 0] }}
             transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
             className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-blue-400/20 to-blue-500/40 border-b border-blue-400 pointer-events-none z-10"
             style={{ boxShadow: '0 4px 20px rgba(59,130,246,0.3)' }}
           />
        </motion.div>

        {/* Right Column - Metrics Panels */}
        <div className="flex flex-col space-y-6">
          
          {/* Metrics Grid */}
          <motion.div variants={item} className="panel p-6 shadow-2xl border border-white/10 hover:border-white/20 subtle-transition">
            <h3 className="text-sm font-medium text-white mb-6 tracking-tight">Model Performance</h3>
            
            <div className="space-y-4">
              {[
                { label: 'Accuracy', value: result.model.accuracy },
                { label: 'Precision', value: result.model.precision },
                { label: 'Recall', value: result.model.recall },
                { label: 'F1 Score', value: result.model.f1 }
              ].map((metric, i) => (
                <div key={metric.label}>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400 font-medium">{metric.label}</span>
                    <span className="text-white font-mono font-medium">
                      <NumberCounter value={metric.value * 100} isPercentage={true} duration={1.5 + (i * 0.1)} />
                    </span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.value * 100}%` }}
                      transition={{ duration: 1.2, delay: 0.3 + (i * 0.1), ease: "easeOut" }}
                      className="h-full bg-white" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ELA Stats */}
          <motion.div variants={item} className="panel p-6 shadow-2xl border border-white/10 hover:border-white/20 subtle-transition">
            <h3 className="text-sm font-medium text-white mb-6 tracking-tight">Error Level Statistics</h3>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <div className="text-xs text-slate-400 mb-1 font-medium">Mean Error</div>
                <div className="text-sm font-mono text-white"><NumberCounter value={result.ela.mean_error} duration={1.2} /></div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1 font-medium">Std Dev</div>
                <div className="text-sm font-mono text-white"><NumberCounter value={result.ela.std_error} duration={1.3} /></div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1 font-medium">Max Error</div>
                <div className="text-sm font-mono text-white"><NumberCounter value={result.ela.max_error} duration={1.4} /></div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1 font-medium">Anomaly Ratio</div>
                <div className="text-sm font-mono" style={{ color: result.ela.high_error_ratio > 5 ? '#ef4444' : '#ffffff' }}>
                  <NumberCounter value={result.ela.high_error_ratio} isPercentage={true} duration={1.5} />
                </div>
              </div>
            </div>
            
            {/* Show ELA image */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="mt-6 rounded-lg overflow-hidden border border-white/10 relative aspect-video bg-[#0a0a0c] shadow-inner group"
            >
                <img src={result.ela.image_url} alt="ELA Map" className="absolute inset-0 w-full h-full object-contain opacity-90 group-hover:opacity-100 subtle-transition" />
            </motion.div>
          </motion.div>

          {/* Metadata */}
          <motion.div variants={item} className="panel p-6 shadow-2xl border border-white/10 hover:border-white/20 subtle-transition">
            <h3 className="text-sm font-medium text-white mb-4 tracking-tight">Metadata</h3>
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Resolution</span>
                <span className="text-white font-medium">{result.image.width}x{result.image.height}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Format</span>
                <span className="text-white font-medium">{result.image.format}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Size</span>
                <span className="text-white font-medium">{(result.image.size_bytes / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Model Algorithm</span>
                <span className="text-white font-medium truncate max-w-[150px]" title={result.model.algorithm}>{result.model.algorithm}</span>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </motion.div>
  );
};
