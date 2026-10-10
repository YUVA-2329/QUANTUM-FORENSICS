import re

with open("src/components/landing/LandingHero.tsx", "r") as f:
    content = f.read()

magnetic_code = """
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const MagneticWrapper: React.FC<{ children: React.ReactElement, className?: string, style?: any, onClick?: () => void }> = ({ children, className, style, onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, { stiffness: 200, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 200, damping: 20, mass: 0.5 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { width, height, left, top } = e.currentTarget.getBoundingClientRect();
    const xPos = (clientX - (left + width / 2)) * 0.2;
    const yPos = (clientY - (top + height / 2)) * 0.2;
    x.set(xPos);
    y.set(yPos);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  return (
    <motion.div
      className={className}
      style={{ ...style, x: springX, y: springY, display: 'inline-block' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
"""

content = content.replace("import React, { useCallback, useRef } from 'react';", "import React, { useCallback, useRef } from 'react';\n" + magnetic_code)

content = content.replace(
    '<button className="lh-pill-nav" onClick={openFileDialog}><span>Analyze File</span></button>',
    '<MagneticWrapper className="lh-pill-nav" onClick={openFileDialog}><button style={{all:"unset", width:"100%", height:"100%", cursor:"pointer", position:"relative", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center"}}><span className="sweep-hover">Analyze File</span></button></MagneticWrapper>'
)

content = content.replace(
    '<button className="lh-pill-cta" onClick={openFileDialog}><span>Analyze Image</span></button>',
    '<MagneticWrapper className="lh-pill-cta" onClick={openFileDialog}><button style={{all:"unset", width:"100%", height:"100%", cursor:"pointer", position:"relative", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center"}}><span className="sweep-hover">Analyze Image</span></button></MagneticWrapper>'
)

with open("src/components/landing/LandingHero.tsx", "w") as f:
    f.write(content)
