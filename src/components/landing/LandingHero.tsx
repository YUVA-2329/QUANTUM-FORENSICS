import React, { useCallback, useRef, useEffect } from 'react';
import './LandingHero.css';

interface LandingHeroProps {
  onFileSelect: (file: File) => void;
  onOpenDashboard: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onFileSelect, onOpenDashboard }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const openFileDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenDashboard();
  };

  useEffect(() => {
    const q = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)');
    const v = document.querySelector('video.art') as HTMLVideoElement;
    if (!q || !v) return;
    
    function sync() {
      if (q.matches) { v.pause(); }
      else { const p = v.play(); if (p) p.catch(() => {}); }
    }
    sync();
    
    const target = document.getElementById('foot2');
    let timer: ReturnType<typeof setTimeout>;
    const done = () => {
      if (timer) clearTimeout(timer);
      if (target) target.removeEventListener('animationend', done);
      document.documentElement.classList.add('is-entered');
    };
    timer = setTimeout(done, 4000);
    if (target) target.addEventListener('animationend', done);

    return () => {
      if (timer) clearTimeout(timer);
      if (target) target.removeEventListener('animationend', done);
    };
  }, []);

  return (
    <div onDrop={handleDrop} onDragOver={handleDragOver} style={{ width: '100%', height: '100%' }}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg, image/png" style={{ opacity: 0, position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} />
      <video className="art" autoPlay muted loop playsInline preload="auto" aria-hidden="true" poster="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/130837c4-0244-4f37-9c61-8d801d93fd29.jpg" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_104303_0c6d60b2-9353-408e-9449-585108a22fb5.mp4"></video>
      <div className="veil"></div>
      <header className="bar">
        <a className="brand" href="#">
          <svg viewBox="0 0 23 17" aria-hidden="true">
            <path d="M8.15 0.9 L4.55 0.9 L0.5 9.3 L4.1 9.3 Z"/>
            <path d="M17.0 0 L13.4 0 L6.15 16.4 L9.75 16.4 Z"/>
            <path d="M22.9 0 L19.3 0 L15.0 7.6 L18.6 7.6 Z"/>
            <path d="M22.6 6.9 L19.0 6.9 L14.05 16.4 L17.65 16.4 Z"/>
          </svg>
          <span id="word">NEURAL</span>
        </a>
        <input className="navtoggle" type="checkbox" id="nav-open" />
        <label className="scrim" htmlFor="nav-open" aria-hidden="true"></label>
        <label className="burger" htmlFor="nav-open" aria-label="Menu">
          <svg viewBox="0 0 22 14">
            <path className="b1" d="M1 1 H21"/>
            <path className="b2" d="M1 7 H21"/>
            <path className="b3" d="M1 13 H21"/>
          </svg>
        </label>
        <div className="navpanel">
          <nav className="menu">
            <a href="#"><span id="about">About</span></a>
            <a href="#"><span id="product">Product</span></a>
            <a href="#"><span id="solutions">Solutions</span>
              <svg className="caret" viewBox="0 0 9 6" aria-hidden="true">
                <path d="M0.7 1.1 L4.5 4.6 L8.3 1.1"/>
              </svg>
            </a>
          </nav>
          <a className="login" href="#"><span id="login">Log in / Request access</span>
            <svg className="navarrow" viewBox="0 0 10 9" aria-hidden="true">
              <path d="M0 4.5 H9.1 M5.4 0.9 L9.2 4.5 L5.4 8.1"/>
            </svg>
          </a>
          <a className="pill" href="#"><span id="contact">Contact sales</span></a>
        </div>
      </header>
      <main className="hero">
        <h1 className="title">
          <span id="h1a">Advanced Image Forensics</span>
          <span id="h1b">Detect Tampering in Real-Time.</span>
        </h1>
        <p className="sub">
          <span id="sub1">We build intelligent analysis tools</span>
          <span id="sub2">for digital investigations.</span>
        </p>
        <a className="cta" href="#" onClick={openFileDialog}>
          <span id="cta">Get started today</span>
          <svg className="arrow" viewBox="0 0 16 11" aria-hidden="true">
            <path d="M0 5.5 H14.6 M10.3 1.2 L14.9 5.5 L10.3 9.8"/>
          </svg>
        </a>
        <ul className="feats">
          <li>
            <svg className="chev" viewBox="0 0 11 20"><path d="M1.15 1.15 L9.6 10 L1.15 18.85"/></svg>
            <span id="f1">Strategic partner</span>
          </li>
          <li>
            <svg className="chev" viewBox="0 0 11 20"><path d="M1.15 1.15 L9.6 10 L1.15 18.85"/></svg>
            <span id="f2">End-to-end delivery</span>
          </li>
          <li>
            <svg className="chev" viewBox="0 0 11 20"><path d="M1.15 1.15 L9.6 10 L1.15 18.85"/></svg>
            <span id="f3">Long-term impact</span>
          </li>
          <li>
            <svg className="chev" viewBox="0 0 11 20"><path d="M1.15 1.15 L9.6 10 L1.15 18.85"/></svg>
            <span id="f4">Long-term impact</span>
          </li>
        </ul>
        <span className="rule" aria-hidden="true"></span>
      </main>
      <footer className="foot">
        <span id="foot1">Trusted by innovative teams around the world.</span>
        <span id="foot2">2024</span>
      </footer>
    </div>
  );
};
