"use client";
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Environment, Float, Sparkles, PerspectiveCamera } from '@react-three/drei';

export function ExperienceA() {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  
  const monoliths = useMemo(() => {
    return Array.from({ length: 30 }).map(() => ({
      position: [
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 40 - 15
      ] as [number, number, number],
      scale: [
        Math.random() * 2 + 1,
        Math.random() * 20 + 5,
        Math.random() * 2 + 1
      ] as [number, number, number],
      rotation: [
        Math.random() * 0.1,
        Math.random() * Math.PI,
        Math.random() * 0.1
      ] as [number, number, number],
      speed: Math.random() * 0.1 + 0.05
    }));
  }, []);

  useFrame((_state, delta) => {
    if (group.current) {
      // Slow rotation of the entire environment
      group.current.rotation.y += delta * 0.03;
      // Parallax based on mouse
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, pointer.y * 0.05, 0.05);
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -pointer.x * 0.05, 0.05);
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={45} />
      
      <color attach="background" args={['#030712']} />
      <fog attach="fog" args={['#030712', 15, 60]} />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 15]} intensity={2.5} color="#3b82f6" />
      <directionalLight position={[-10, -20, -15]} intensity={1.5} color="#8b5cf6" />
      <pointLight position={[0, 0, 0]} intensity={2} color="#60a5fa" distance={30} />

      <group ref={group}>
        {monoliths.map((props, i) => (
          <Float key={i} speed={props.speed} rotationIntensity={0.1} floatIntensity={0.2}>
            <mesh position={props.position} scale={props.scale} rotation={props.rotation}>
              <boxGeometry args={[1, 1, 1]} />
              <meshPhysicalMaterial 
                color="#0f172a"
                metalness={0.9}
                roughness={0.1}
                envMapIntensity={2}
                clearcoat={0.8}
                clearcoatRoughness={0.2}
              />
            </mesh>
          </Float>
        ))}
        
        {/* Core structure */}
        <Float speed={0.2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={[0, 0, -5]}>
            <octahedronGeometry args={[4, 0]} />
            <meshPhysicalMaterial 
              color="#1e3a8a"
              metalness={1}
              roughness={0}
              transmission={0.9}
              thickness={2}
              envMapIntensity={2}
              emissive="#1d4ed8"
              emissiveIntensity={0.2}
            />
          </mesh>
        </Float>
      </group>

      <Sparkles count={2000} scale={60} size={1.5} speed={0.1} color="#93c5fd" opacity={0.6} />
      <Sparkles count={800} scale={40} size={3} speed={0.3} color="#c4b5fd" opacity={0.8} />

      <Environment preset="city" />
    </>
  );
}
