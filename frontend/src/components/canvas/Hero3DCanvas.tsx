import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface SceneProps {
  verdict?: 'APPROVED' | 'MANUAL_REVIEW' | 'REJECTED' | null;
  isScanning?: boolean;
}

function HologramMesh({ verdict, isScanning }: SceneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const laserRef = useRef<THREE.Mesh>(null);

  // Dynamic theme colors for Beige / Executive theme
  const primaryColor = useMemo(() => {
    if (verdict === 'APPROVED') return '#059669'; // Emerald
    if (verdict === 'MANUAL_REVIEW') return '#D97706'; // Amber / Gold
    if (verdict === 'REJECTED') return '#DC2626'; // Crimson
    return '#B45309'; // Default Warm Gold
  }, [verdict]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.35;
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.12;
    }
    
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.4;
      ringRef.current.rotation.x = Math.cos(t * 0.3) * 0.15;
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.y = t * 0.25;
      outerRingRef.current.rotation.z = Math.sin(t * 0.4) * 0.15;
    }

    if (laserRef.current) {
      laserRef.current.position.y = Math.sin(t * 2.5) * 1.5;
      laserRef.current.scale.set(
        1 + Math.sin(t * 5) * 0.05,
        1,
        1 + Math.sin(t * 5) * 0.05
      );
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central Holographic Core */}
      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.4}>
        <mesh ref={meshRef}>
          <cylinderGeometry args={[1.25, 1.25, 0.35, 32, 1, false]} />
          <MeshDistortMaterial
            color={primaryColor}
            speed={1.5}
            distort={0.2}
            roughness={0.15}
            metalness={0.85}
            transparent
            opacity={0.88}
          />
        </mesh>
      </Float>

      {/* Inner Wireframe Tech Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.75, 0.025, 16, 64]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={0.8}
          wireframe
        />
      </mesh>

      {/* Outer Data Orbit Ring */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[2.2, 0.015, 16, 48]} />
        <meshBasicMaterial
          color="#A8A29E"
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Scanning Laser Disc */}
      {isScanning && (
        <mesh ref={laserRef}>
          <cylinderGeometry args={[1.9, 1.9, 0.02, 32]} />
          <meshBasicMaterial
            color={primaryColor}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Floating 3D Micro-Nodes */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const radius = 1.9 + Math.sin(i * 1.5) * 0.35;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(i * 3) * 0.7;
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial
              color={primaryColor}
              emissive={primaryColor}
              emissiveIntensity={1.0}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export const Hero3DCanvas: React.FC<SceneProps> = ({ verdict, isScanning }) => {
  return (
    <div className="w-full h-full min-h-[300px] relative pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 4.4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 8, 5]} intensity={1.8} color="#FFFDF7" />
        <pointLight position={[-5, -5, -2]} intensity={0.9} color="#D97706" />
        <pointLight
          position={[0, 4, 2]}
          intensity={1.2}
          color={verdict === 'APPROVED' ? '#059669' : verdict === 'REJECTED' ? '#DC2626' : '#D97706'}
        />
        <HologramMesh verdict={verdict} isScanning={isScanning} />
      </Canvas>
    </div>
  );
};
