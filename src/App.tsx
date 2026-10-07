import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadArea } from './components/UploadArea';
import { ProcessingScreen } from './components/ProcessingScreen';
import { ResultWorkspace } from './components/ResultWorkspace';
import { IntroSequence } from './components/intro/IntroSequence';
import { HelpPopup } from './components/HelpPopup';
import { analyzeImage } from './api';
import type { AnalysisStatus, AnalysisResult } from './api';

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setStatus('selected'); // temporary status
  };

  const startAnalysis = async () => {
    if (!file) return;
    setStatus('ingesting');
    setProgress(0);
    setResult(null);

    try {
      const res = await analyzeImage(file, (s, p) => {
        setStatus(s);
        setProgress(p);
      });
      setResult(res);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setStatus('idle');
    setResult(null);
    setProgress(0);
  };

  return (
    <>
      <HelpPopup />
      <AnimatePresence>
        {showIntro && <IntroSequence onComplete={() => setShowIntro(false)} />}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: showIntro ? 0 : 1, scale: showIntro ? 0.98 : 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: showIntro ? 0 : 0.2 }}
        className="min-h-screen text-[var(--color-text-primary)] flex flex-col font-sans relative overflow-hidden bg-[#F8FAFC]"
        style={{ pointerEvents: showIntro ? 'none' : 'auto' }}
      >
        
        {/* Light Interactive Background */}
        <div className="light-interactive-bg" />
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />
      <div className="ambient-blob blob-3" />
      
      {/* Top Navigation */}
      <motion.nav 
        initial={{ backgroundColor: 'rgba(255, 255, 255, 0)', borderBottomColor: 'rgba(255, 255, 255, 0)', backdropFilter: 'blur(0px)' }}
        animate={{ 
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0)',
          borderBottomColor: scrolled ? 'var(--color-surface-border)' : 'rgba(255, 255, 255, 0)',
          backdropFilter: scrolled ? 'blur(16px)' : 'blur(0px)'
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full flex items-center justify-between px-8 py-4 sticky top-0 z-40 border-b"
      >
        <div className="flex items-center space-x-8">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 shadow-sm">
             <div className="w-3 h-3 bg-blue-500 rounded-sm shadow-sm" />
          </div>
          <span className="text-[var(--color-text-primary)] font-semibold tracking-tight">Quantum Forensics</span>
          <div className="hidden md:flex space-x-6 text-sm text-[var(--color-text-secondary)] font-medium">
            <button className="text-[var(--color-text-primary)] font-semibold">Analysis</button>
            <button className="hover:text-[var(--color-text-primary)] subtle-transition transition-colors">Database</button>
            <button className="hover:text-[var(--color-text-primary)] subtle-transition transition-colors">Settings</button>
          </div>
        </div>
      </motion.nav>

      {/* Main Workspace */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto flex flex-col z-10 p-4 md:p-8">
        <AnimatePresence mode="wait">
          {(status === 'idle' || status === 'selected') && !result && (
            <motion.div 
              key="hero"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.2, ease: "easeIn" } }}
              transition={{ duration: 0.4, ease: "easeOut", staggerChildren: 0.1 }}
              className="flex-1 flex flex-col mt-12 md:mt-24 relative"
            >
              <div className="mb-12 text-center md:text-left">
                <motion.h1 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-[var(--color-text-primary)]"
                >
                  Image Integrity Analysis
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.08 }}
                  className="text-xl text-[var(--color-text-secondary)] font-light"
                >
                  Precision forensics in a clean, intelligent workspace.
                </motion.p>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.16 }}
                className="panel bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm"
              >
                 <AnimatePresence mode="wait">
                   {status === 'idle' ? (
                     <motion.div
                       key="upload"
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0, scale: 0.98 }}
                       transition={{ duration: 0.25 }}
                     >
                       <UploadArea onFileSelect={handleFileSelect} />
                     </motion.div>
                   ) : (
                     <motion.div
                       key="preview"
                       initial={{ opacity: 0, scale: 0.98, y: 10 }}
                       animate={{ opacity: 1, scale: 1, y: 0 }}
                       transition={{ duration: 0.3 }}
                       className="p-8 flex flex-col md:flex-row items-center justify-between gap-8"
                     >
                       <div className="flex items-center gap-6">
                         <div className="w-24 h-24 rounded-lg overflow-hidden border border-[var(--color-surface-border)] shadow-sm">
                           <img src={file ? URL.createObjectURL(file) : ''} alt="Selected" className="w-full h-full object-cover" />
                         </div>
                         <div>
                           <div className="font-medium text-[var(--color-text-primary)] truncate max-w-xs">{file?.name}</div>
                           <div className="text-sm text-[var(--color-text-muted)] mt-1">{(file?.size! / 1024 / 1024).toFixed(2)} MB</div>
                         </div>
                       </div>
                       
                       <div className="flex gap-4 w-full md:w-auto">
                         <motion.button 
                           whileHover={{ y: -1 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={handleReset}
                           className="flex-1 md:flex-none px-6 py-3 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-transparent hover:border-slate-200 rounded-lg subtle-transition"
                         >
                           Cancel
                         </motion.button>
                         <motion.button 
                           whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}
                           whileTap={{ scale: 0.98 }}
                           onClick={startAnalysis}
                           className="flex-1 md:flex-none px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm subtle-transition"
                         >
                           Analyze Image
                         </motion.button>
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
          
          {status !== 'idle' && status !== 'complete' && status !== 'error' && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, scale: 0.98, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full relative"
            >
              <div className="panel bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
                <ProcessingScreen status={status} progress={progress} file={file} />
              </div>
            </motion.div>
          )}
          
          {status === 'complete' && result && file && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="panel bg-white/90 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl mt-4"
            >
              <ResultWorkspace file={file} result={result} onReset={handleReset} />
            </motion.div>
          )}
          
          {status === 'error' && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center relative"
            >
              <div className="panel bg-white/90 backdrop-blur-xl border border-red-200 p-12 text-center max-w-md w-full rounded-2xl shadow-xl">
                <h2 className="text-2xl font-semibold mb-2 text-[var(--color-text-primary)]">Analysis Failed</h2>
                <p className="text-[var(--color-text-secondary)] mb-8 text-sm">The forensic pipeline encountered an unexpected error.</p>
                <motion.button 
                  whileHover={{ y: -1, backgroundColor: 'var(--color-surface)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReset} 
                  className="px-6 py-2 bg-slate-100 border border-slate-200 text-sm font-medium rounded-md subtle-transition text-[var(--color-text-primary)]"
                >
                  Try Again
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      </motion.div>
    </>
  );
}

export default App;
