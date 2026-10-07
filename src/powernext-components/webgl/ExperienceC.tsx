"use client";
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PerspectiveCamera, Float } from '@react-three/drei';

const NODE_COUNT = 300;
const CONNECTION_DISTANCE = 4.5;

export function ExperienceC() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { pointer } = useThree();

  const { positions, colors, linesGeometry } = useMemo(() => {
    const pos = new Float32Array(NODE_COUNT * 3);
    const col = new Float32Array(NODE_COUNT * 3);
    
    // Generate nodes in a sphere
    for (let i = 0; i < NODE_COUNT; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = Math.cbrt(Math.random()) * 15; // uniform sphere distribution
      
      pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      
      // Teal to electric blue
      const isHub = Math.random() > 0.9;
      col[i * 3 + 0] = isHub ? 0.2 : 0.05;
      col[i * 3 + 1] = isHub ? 0.8 : 0.4;
      col[i * 3 + 2] = isHub ? 1.0 : 0.8;
    }

    // Generate lines between close nodes
    const linePositions = [];
    const lineColors = [];
    
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;
        
        if (distSq < CONNECTION_DISTANCE * CONNECTION_DISTANCE) {
          linePositions.push(
            pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2],
            pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]
          );
          
          const alpha = 1.0 - Math.sqrt(distSq) / CONNECTION_DISTANCE;
          lineColors.push(
            0.1, 0.4, 0.8, alpha,
            0.1, 0.4, 0.8, alpha
          );
        }
      }
    }

    const linesGeo = new THREE.BufferGeometry();
    linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    linesGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 4));

    return { positions: pos, colors: col, linesGeometry: linesGeo };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!meshRef.current || !linesRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Rotate the whole system slowly
    meshRef.current.rotation.y += delta * 0.05;
    meshRef.current.rotation.x += delta * 0.02;
    linesRef.current.rotation.y = meshRef.current.rotation.y;
    linesRef.current.rotation.x = meshRef.current.rotation.x;
    
    // Mouse parallax
    const targetX = pointer.x * 2;
    const targetY = pointer.y * 2;
    
    state.camera.position.x += (targetX - state.camera.position.x) * 0.05;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.05;
    state.camera.lookAt(0, 0, 0);

    // Pulse nodes
    for (let i = 0; i < NODE_COUNT; i++) {
      dummy.position.set(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      );
      // Breathing scale
      const scale = 1 + Math.sin(time * 2 + i) * 0.3;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 25]} fov={50} />
      
      <color attach="background" args={['#020617']} />
      
      <ambientLight intensity={1} />
      
      {/* Nodes */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, NODE_COUNT]}>
        <sphereGeometry args={[0.15, 16, 16]}>
          <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
        </sphereGeometry>
        <meshBasicMaterial vertexColors toneMapped={false} />
      </instancedMesh>
      
      {/* Connections */}
      <lineSegments ref={linesRef} geometry={linesGeometry}>
        <lineBasicMaterial vertexColors transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>

      {/* Floating abstract data rings */}
      <Float speed={0.5} rotationIntensity={1} floatIntensity={1}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[18, 0.02, 16, 100]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.15} />
        </mesh>
      </Float>
      <Float speed={0.3} rotationIntensity={1.5} floatIntensity={0.5}>
        <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
          <torusGeometry args={[22, 0.05, 16, 100]} />
          <meshBasicMaterial color="#818cf8" transparent opacity={0.1} />
        </mesh>
      </Float>
    </>
  );
}
