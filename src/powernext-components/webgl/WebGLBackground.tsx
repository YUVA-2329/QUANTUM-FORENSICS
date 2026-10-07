"use client";

import { useState, Suspense, startTransition } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor, Preload, Stats } from '@react-three/drei';
import { ExperienceA } from './ExperienceA';
import { ExperienceB } from './ExperienceB';
import { ExperienceC } from './ExperienceC';
import { Layers, Activity, Cpu } from 'lucide-react';

export function WebGLBackground() {
  const [activeExperience, setActiveExperience] = useState<'A' | 'B' | 'C'>('A');
  const [dpr, setDpr] = useState(1.5);

  const switchExperience = (exp: 'A' | 'B' | 'C') => {
    startTransition(() => {
      setActiveExperience(exp);
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-[-1]">
        <Canvas 
          dpr={dpr} 
          gl={{ antialias: false, powerPreference: "high-performance" }}
          eventSource={typeof document !== 'undefined' ? document.body : undefined}
          eventPrefix="client"
        >
          <PerformanceMonitor 
            onDecline={() => setDpr(1)} 
            onIncline={() => setDpr(1.5)} 
          />
          <Suspense fallback={null}>
            {activeExperience === 'A' && <ExperienceA />}
            {activeExperience === 'B' && <ExperienceB />}
            {activeExperience === 'C' && <ExperienceC />}
            <Preload all />
          </Suspense>
          {import.meta.env.MODE === 'development' && <Stats className="!fixed !top-4 !left-4" />}
        </Canvas>
      </div>

      {/* Controller UI */}
      <div className="fixed bottom-6 right-6 z-50 flex gap-2 bg-black/50 backdrop-blur-md p-2 rounded-2xl border border-white/10 pointer-events-auto">
        <button
          onClick={() => switchExperience('A')}
          className={`p-3 rounded-xl transition-all ${activeExperience === 'A' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
          title="Cinematic Volumetric World"
        >
          <Layers size={18} />
        </button>
        <button
          onClick={() => switchExperience('B')}
          className={`p-3 rounded-xl transition-all ${activeExperience === 'B' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
          title="Procedural Fluid Shader"
        >
          <Activity size={18} />
        </button>
        <button
          onClick={() => switchExperience('C')}
          className={`p-3 rounded-xl transition-all ${activeExperience === 'C' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
          title="Interactive Data Universe"
        >
          <Cpu size={18} />
        </button>
      </div>
    </>
  );
}
