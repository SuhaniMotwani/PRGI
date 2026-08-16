import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface SceneProps {
  title?: string;
  verdict?: 'APPROVED' | 'MANUAL_REVIEW' | 'REJECTED' | null;
  isScanning?: boolean;
}

function Title3DSeal({ title = 'Times India', verdict, isScanning }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const laserRef = useRef<THREE.Mesh>(null);
  const scanRingRef = useRef<THREE.Mesh>(null);
  const orbitRing1 = useRef<THREE.Mesh>(null);
  const orbitRing2 = useRef<THREE.Mesh>(null);

  // Dynamic Theme Colors based on verification verdict
  const { primaryColor, emissiveColor, statusLabel } = useMemo(() => {
    if (verdict === 'APPROVED') {
      return {
        primaryColor: '#059669', // Emerald
        emissiveColor: '#10B981',
        statusLabel: 'VERIFIED CLEAR • PRGI APPROVED'
      };
    }
    if (verdict === 'REJECTED') {
      return {
        primaryColor: '#DC2626', // Crimson
        emissiveColor: '#EF4444',
        statusLabel: 'CLASH DETECTED • STATUTORY REJECT'
      };
    }
    if (verdict === 'MANUAL_REVIEW') {
      return {
        primaryColor: '#D97706', // Amber
        emissiveColor: '#F59E0B',
        statusLabel: 'BORDERLINE RISK • OFFICER REVIEW'
      };
    }
    return {
      primaryColor: '#B45309', // Regal Golden Brass
      emissiveColor: '#D97706',
      statusLabel: 'PRGI ACT 2023 • STATUTORY SEAL'
    };
  }, [verdict]);

  // Clean formatting of proposed title
  const displayTitle = useMemo(() => {
    const trimmed = (title || 'PRGI TitleGuard').trim();
    if (!trimmed) return 'Enter Title';
    return trimmed;
  }, [title]);

  // Adaptive font sizing based on length
  const fontSize = useMemo(() => {
    const len = displayTitle.length;
    if (len > 30) return 0.22;
    if (len > 20) return 0.28;
    if (len > 12) return 0.34;
    return 0.42;
  }, [displayTitle]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Smooth continuous 360-degree rotation of the entire 3D seal & title badge
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.85; // Continuous 360 spinning
      groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.08; // Subtle breathing tilt
    }

    // High-tech laser body scan sweeping up and down across the 3D text
    if (laserRef.current) {
      laserRef.current.position.y = Math.sin(t * 3.2) * 1.35;
      laserRef.current.scale.set(
        1 + Math.sin(t * 6) * 0.04,
        1,
        1 + Math.sin(t * 6) * 0.04
      );
    }

    if (scanRingRef.current) {
      scanRingRef.current.rotation.z = -t * 1.2;
    }

    if (orbitRing1.current) {
      orbitRing1.current.rotation.x = t * 0.3;
      orbitRing1.current.rotation.y = t * 0.5;
    }

    if (orbitRing2.current) {
      orbitRing2.current.rotation.y = -t * 0.4;
      orbitRing2.current.rotation.z = t * 0.3;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 360-degree Rotating Title Badge Entity */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <group ref={groupRef}>
          {/* Holographic Embossed Backplate Slab */}
          <RoundedBox args={[3.6, 1.9, 0.18]} radius={0.12} smoothness={4} position={[0, 0, 0]}>
            <meshStandardMaterial
              color="#FAF7F2"
              roughness={0.2}
              metalness={0.7}
              transparent
              opacity={0.92}
            />
          </RoundedBox>

          {/* Inner Seal Border Rim */}
          <mesh position={[0, 0, 0.1]}>
            <ringGeometry args={[1.35, 1.4, 48]} />
            <meshStandardMaterial
              color={primaryColor}
              emissive={emissiveColor}
              emissiveIntensity={isScanning ? 1.0 : 0.4}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Front Header Ribbon in 3D */}
          <Text
            position={[0, 0.65, 0.11]}
            fontSize={0.11}
            maxWidth={3.2}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            color="#75634B"
            letterSpacing={0.15}
          >
            PRESS REGISTRAR GENERAL OF INDIA
          </Text>

          {/* Main 3D Title (Front Side) */}
          <Text
            position={[0, 0.08, 0.12]}
            fontSize={fontSize}
            maxWidth={3.1}
            lineHeight={1.08}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            color={primaryColor}
            outlineWidth={0.012}
            outlineColor="#1C1917"
          >
            {displayTitle}
            <meshStandardMaterial
              color={primaryColor}
              emissive={emissiveColor}
              emissiveIntensity={isScanning ? 1.2 : 0.5}
              metalness={0.8}
              roughness={0.15}
            />
          </Text>

          {/* Front Subtitle Status Badge */}
          <Text
            position={[0, -0.62, 0.11]}
            fontSize={0.105}
            maxWidth={3.2}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            color={primaryColor}
            letterSpacing={0.12}
          >
            {statusLabel}
          </Text>

          {/* Back Side of the 3D Seal (visible as it spins 360 degrees) */}
          <Text
            position={[0, 0.15, -0.11]}
            rotation={[0, Math.PI, 0]}
            fontSize={fontSize * 0.9}
            maxWidth={3.1}
            lineHeight={1.08}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            color={primaryColor}
            outlineWidth={0.012}
            outlineColor="#1C1917"
          >
            {displayTitle}
            <meshStandardMaterial
              color={primaryColor}
              emissive={emissiveColor}
              emissiveIntensity={isScanning ? 1.2 : 0.5}
              metalness={0.8}
              roughness={0.15}
            />
          </Text>

          <Text
            position={[0, -0.55, -0.11]}
            rotation={[0, Math.PI, 0]}
            fontSize={0.095}
            maxWidth={3.2}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            color="#564735"
            letterSpacing={0.1}
          >
            160,000 TITLES MASTER REGISTRY INDEX
          </Text>
        </group>
      </Float>

      {/* Laser Body Scan Plane (sweeps up & down through text) */}
      {isScanning && (
        <group ref={laserRef}>
          {/* Glowing laser slice sheet */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4.2, 2.2]} />
            <meshBasicMaterial
              color={emissiveColor}
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Laser beam edge line */}
          <mesh>
            <cylinderGeometry args={[0.025, 0.025, 4.3, 16]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
      )}

      {/* Orbital Hologram Gyroscope Rings */}
      <mesh ref={orbitRing1}>
        <torusGeometry args={[2.3, 0.018, 16, 64]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={0.6}
          wireframe
        />
      </mesh>

      <mesh ref={orbitRing2}>
        <torusGeometry args={[2.5, 0.012, 16, 48]} />
        <meshBasicMaterial
          color="#A8A29E"
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Ambient Micro Particle Sparkles around the 3D Text */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 2.1 + Math.sin(i * 1.8) * 0.4;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(i * 2.5) * 0.9;
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial
              color={emissiveColor}
              emissive={emissiveColor}
              emissiveIntensity={isScanning ? 1.8 : 0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export const Hero3DCanvas: React.FC<SceneProps> = ({ title, verdict, isScanning }) => {
  return (
    <div className="w-full h-full min-h-[300px] relative pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 4.6], fov: 46 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[6, 8, 6]} intensity={1.8} color="#FFFDF7" />
        <pointLight position={[-6, -4, -2]} intensity={0.8} color="#D97706" />
        <pointLight
          position={[0, 3, 3]}
          intensity={1.6}
          color={
            verdict === 'APPROVED'
              ? '#10B981'
              : verdict === 'REJECTED'
              ? '#EF4444'
              : '#F59E0B'
          }
        />
        <Title3DSeal title={title} verdict={verdict} isScanning={isScanning} />
      </Canvas>
    </div>
  );
};

