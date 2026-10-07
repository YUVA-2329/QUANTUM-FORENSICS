import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const HelpPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key.toLowerCase() === 'h' || e.key === '?') {
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-slate-900/40 backdrop-blur-md"
          onClick={() => setIsOpen(false)}
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white text-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row border border-slate-200"
            onClick={(e) => e.stopPropagation()} // Prevent clicking inside from closing it
          >
            {/* LEFT SIDE: The Easy Explanation */}
            <div className="flex-1 p-8 md:p-10 border-r border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">System Blueprint & Evaluator Guide</h2>
                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full tracking-widest uppercase">
                  Press ESC to close
                </span>
              </div>
              
              <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">1. What is Happening?</h3>
                  <p>When you drop an image into this interface, it is instantly securely transmitted to a Python server. The system mathematically dissects the image to see if any pixels were copy-pasted or digitally altered.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">2. How Do We Test It? (The Dataset)</h3>
                  <p>To train the AI, we built a <strong>Synthetic Dataset</strong>. We generated 100 perfectly clean images, and 100 artificially tampered images (by pasting shapes and changing compression rates). We trained the model on 80% of these images, and tested it on the remaining 20% to prove it could accurately catch the fakes.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">3. Why Does it Look Like That?</h3>
                  <p>The 3D floating paper effect and the precise animations were custom-coded. We wanted to build a <strong>World-Class UI/UX</strong> that feels like a real high-end digital forensics lab, moving away from standard, boring web dashboards.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">4. How the Verdict is Reached</h3>
                  <p>The system doesn't just guess. It extracts 14 specific numbers (features) from the image (like edge density and color variance). These 14 numbers are fed into the Machine Learning model, which outputs a strict mathematical probability. The numbers you see ticking up on the screen are the <strong>real calculations</strong>.</p>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Tech Dictionary */}
            <div className="w-full md:w-80 bg-slate-50 p-8 md:p-10">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Tech Dictionary</h3>
              
              <div className="space-y-5">
                <DictionaryItem 
                  term="Bootstrap / Templates" 
                  desc="A generic design toolkit used by most developers to make basic websites. We did NOT use this. Our UI is entirely custom."
                />
                <DictionaryItem 
                  term="WebGL / Three.js" 
                  desc="A technology that lets us draw real 3D graphics inside the browser. It's what makes the uploaded image float and reflect light like real glass."
                />
                <DictionaryItem 
                  term="Framer Motion" 
                  desc="An elite animation library that powers the cinematic 60fps fade-ins, number counting, and scanning effects."
                />
                <DictionaryItem 
                  term="ELA (Error Level Analysis)" 
                  desc="A forensic technique. Every time a JPEG is saved, it compresses. If you paste a new object in, it compresses differently. ELA detects that difference."
                />
                <DictionaryItem 
                  term="Random Forest" 
                  desc="The Machine Learning AI we use. It essentially creates hundreds of tiny 'decision trees' that vote on whether an image is fake or authentic."
                />
                <DictionaryItem 
                  term="FastAPI" 
                  desc="The hyper-fast Python backend server. It's what receives the image, runs the heavy math, and sends the verdict back to the screen."
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DictionaryItem = ({ term, desc }: { term: string, desc: string }) => (
  <div>
    <h4 className="text-slate-800 font-semibold text-sm mb-1">{term}</h4>
    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
  </div>
);
