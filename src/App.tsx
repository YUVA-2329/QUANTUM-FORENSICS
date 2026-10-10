import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LandingHero } from './components/landing/LandingHero';
import { ProcessingScreen } from './components/ProcessingScreen';
import { ResultWorkspace } from './components/ResultWorkspace';
import { HelpPopup } from './components/HelpPopup';
import { DashboardPanel } from './components/DashboardPanel';
import { IntroSequence } from './components/IntroSequence';
import { analyzeImage } from './api';
import type { AnalysisStatus, AnalysisResult } from './api';

function App() {
  const [showIntro, setShowIntro] = useState(() => {
    return !localStorage.getItem('introSeen');
  });
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard state
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [history, setHistory] = useState<{file: File, result: AnalysisResult, timestamp: number}[]>([]);

  const handleAnalyze = async (selectedFile: File) => {
    setIsDashboardOpen(false); // Close dashboard during upload/processing
    setFile(selectedFile);
    setStatus('ingesting');
    setError(null);
    
    const minimumDelay = new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const [response] = await Promise.all([
        analyzeImage(selectedFile, () => {}),
        minimumDelay
      ]);
      setResult(response);
      setStatus('complete');
      
      // Add to history
      setHistory(prev => [{ file: selectedFile, result: response, timestamp: Date.now() }, ...prev]);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze image. Ensure backend is running.');
      setStatus('idle');
      setIsDashboardOpen(true); // Re-open dashboard on error
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setStatus('idle');
    setIsDashboardOpen(true); // Automatically open dashboard when going back, showing history
  };

  const handleViewResult = (index: number) => {
    const item = history[index];
    setFile(item.file);
    setResult(item.result);
    setStatus('complete');
    setIsDashboardOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {showIntro && <IntroSequence onComplete={() => { localStorage.setItem('introSeen', 'true'); setShowIntro(false); }} />}
      </AnimatePresence>

      <HelpPopup />
      
      <DashboardPanel 
        isOpen={isDashboardOpen} 
        onClose={() => setIsDashboardOpen(false)} 
        history={history}
        onAnalyzeNew={handleAnalyze}
        onViewResult={handleViewResult}
      />

      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-red-500/90 text-white px-6 py-3 rounded-full text-sm shadow-2xl backdrop-blur-md">
          {error}
        </div>
      )}

      {/* LandingHero is always mounted as the base background */}
      <LandingHero onFileSelect={handleAnalyze} onOpenDashboard={() => setIsDashboardOpen(true)} />

      <AnimatePresence>
        {status === 'ingesting' && (
          <motion.div key="ingesting" initial={{opacity:0, backdropFilter: 'blur(0px)'}} animate={{opacity:1, backdropFilter: 'blur(20px)'}} exit={{opacity:0, backdropFilter: 'blur(0px)'}} transition={{ duration: 0.8 }} className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center">
            <ProcessingScreen status={status} progress={50} file={file} />
          </motion.div>
        )}

        {status === 'complete' && result && file && (
          <motion.div key="complete" initial={{opacity:0, backdropFilter: 'blur(0px)'}} animate={{opacity:1, backdropFilter: 'blur(40px)'}} transition={{ duration: 0.8 }} className="fixed inset-0 z-30 bg-black/80 overflow-y-auto">
            <ResultWorkspace file={file} result={result} onReset={handleReset} />
            
            {/* Float dashboard button inside workspace */}
            <button 
              onClick={() => setIsDashboardOpen(true)}
              className="fixed top-6 right-6 z-[60] bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              Intelligence Hub
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
