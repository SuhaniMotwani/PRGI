import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function AmbientBeigeParticles() {
  const count = 120;
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    // Warm beige, muted gold, soft terracotta, and subtle sage palette
    const colorOptions = [
      new THREE.Color('#D97706'), // Warm Gold / Amber
      new THREE.Color('#B45309'), // Deep Amber
      new THREE.Color('#CFC0A8'), // Sand beige
      new THREE.Color('#A8A29E'), // Soft stone
      new THREE.Color('#059669'), // Subtle emerald hint
    ];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const chosenColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;
    }

    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.015) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" count={count} args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        vertexColors
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  );
}

export const DynamicBeigeBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Subtle radial ambient gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-b from-amber-100/40 via-orange-50/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-to-tl from-emerald-100/30 via-stone-100/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      {/* Subtle warm mesh grid overlay */}
      <div className="absolute inset-0 bg-warm-mesh opacity-60"></div>

      {/* Dynamic 3D constellation */}
      <Canvas camera={{ position: [0, 0, 7], fov: 60 }} gl={{ alpha: true }}>
        <AmbientBeigeParticles />
      </Canvas>
    </div>
  );
};
