"use client";
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PerspectiveCamera } from '@react-three/drei';

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vPosition;

// Classic Perlin 3D Noise by Stefan Gustavson
vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vec2 uv = vUv;
  
  // Aspect ratio correction
  vec2 p = uv * 2.0 - 1.0;
  p.x *= uResolution.x / uResolution.y;

  // Mouse interaction distance
  float dMouse = length(p - uMouse);
  float mouseInfluence = smoothstep(1.5, 0.0, dMouse);

  // FBM fluid noise
  vec3 pos = vec3(p * 2.0, uTime * 0.2);
  
  // Distortion based on mouse
  pos.xy += uMouse * mouseInfluence * 2.0;

  float n = snoise(pos);
  n += 0.5 * snoise(pos * 2.0 - vec3(0.0, uTime * 0.5, 0.0));
  n += 0.25 * snoise(pos * 4.0 + vec3(uTime * 0.1, 0.0, 0.0));
  
  // Map noise to organic colors (purple / blue / teal)
  vec3 color1 = vec3(0.1, 0.0, 0.3); // Deep purple
  vec3 color2 = vec3(0.2, 0.4, 0.8); // Bright blue
  vec3 color3 = vec3(0.0, 0.8, 0.6); // Teal
  
  // Non-linear color mapping
  float t = n * 0.5 + 0.5;
  vec3 finalColor = mix(color1, color2, smoothstep(0.0, 0.6, t));
  finalColor = mix(finalColor, color3, smoothstep(0.5, 1.0, t));
  
  // Add some highlights where mouse is
  finalColor += vec3(0.2, 0.5, 0.8) * mouseInfluence * 0.5;
  
  // Add vignette
  float vignette = 1.0 - smoothstep(0.5, 1.5, length(p));
  finalColor *= vignette;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export function ExperienceB() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size, pointer } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
    }),
    [size]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Smoothly interpolate mouse position for fluid feel
      materialRef.current.uniforms.uMouse.value.lerp(
        new THREE.Vector2(pointer.x, pointer.y),
        0.05
      );
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 1]} />
      <mesh>
        <planeGeometry args={[20, 20]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
