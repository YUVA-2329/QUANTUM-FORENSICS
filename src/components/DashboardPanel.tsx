import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnalysisResult } from '../api';

interface DashboardPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: { file: File; result: AnalysisResult; timestamp: number }[];
  onAnalyzeNew: (file: File) => void;
  onViewResult: (index: number) => void;
}

export const DashboardPanel: React.FC<DashboardPanelProps> = ({ isOpen, onClose, history, onAnalyzeNew, onViewResult }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAnalyzeNew(e.target.files[0]);
    }
  };

  const getRelativeTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#04070e]/95 backdrop-blur-3xl border-l border-white/10 z-[100] shadow-2xl flex flex-col"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            <div className="p-8 border-b border-white/5 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-white tracking-tight">Intelligence Hub</h2>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                    <span className="text-xs font-medium text-gray-300">System Online</span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{history.length} Analysis Records</span>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              {history.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                  <svg className="w-8 h-8 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-sm font-medium">No records found</p>
                  <p className="text-xs mt-1 opacity-70">Upload an image to begin forensic analysis</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Recent Scans</h3>
                  {history.map((item, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => onViewResult(i)} 
                      className="group p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 cursor-pointer transition-all duration-300 flex items-center gap-4 relative overflow-hidden"
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.result.verdict === 'AUTHENTIC' ? 'bg-emerald-500' : 'bg-red-500'} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                      <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/5 flex items-center justify-center flex-shrink-0">
                        {item.result.verdict === 'AUTHENTIC' ? (
                          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200 font-medium truncate">{item.file.name}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <p className={`text-[11px] font-bold tracking-wide uppercase ${item.result.verdict === 'AUTHENTIC' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {item.result.verdict} • {(item.result.confidence * 100).toFixed(1)}%
                          </p>
                          <span className="text-[10px] text-gray-500 font-medium">{getRelativeTime(item.timestamp)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 border-t border-white/5 bg-black/20">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg, image/png" className="hidden" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                Launch New Analysis
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
