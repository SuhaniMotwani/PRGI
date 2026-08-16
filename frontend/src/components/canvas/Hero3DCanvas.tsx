import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';

interface SceneProps {
  title?: string;
  verdict?: 'APPROVED' | 'MANUAL_REVIEW' | 'REJECTED' | null;
  isScanning?: boolean;
}

function Pure3DTitleText({ title = 'Times India', verdict, isScanning }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const scanLaserRef = useRef<THREE.Group>(null);

  // Dynamic Theme Colors
  const { primaryColor, emissiveColor, glowColor } = useMemo(() => {
    if (verdict === 'APPROVED') {
      return {
        primaryColor: '#059669', // Emerald Green
        emissiveColor: '#10B981',
        glowColor: '#34D399'
      };
    }
    if (verdict === 'REJECTED') {
      return {
        primaryColor: '#DC2626', // Crimson Red
        emissiveColor: '#EF4444',
        glowColor: '#F87171'
      };
    }
    if (verdict === 'MANUAL_REVIEW') {
      return {
        primaryColor: '#D97706', // Warm Amber
        emissiveColor: '#F59E0B',
        glowColor: '#FBBF24'
      };
    }
    return {
      primaryColor: '#292524', // Deep Stone Charcoal / Espresso
      emissiveColor: '#B45309', // Warm Bronze Glow
      glowColor: '#D97706'
    };
  }, [verdict]);

  // Clean formatting of proposed title
  const displayTitle = useMemo(() => {
    const trimmed = (title || 'PRGI TitleGuard').trim();
    if (!trimmed) return 'Enter Title';
    return trimmed;
  }, [title]);

  // Proportional font sizing for crisp layout
  const fontSize = useMemo(() => {
    const len = displayTitle.length;
    if (len > 35) return 0.28;
    if (len > 24) return 0.36;
    if (len > 14) return 0.46;
    return 0.58;
  }, [displayTitle]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Smooth, continuous 360-degree spinning of the 3D text
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.55; // Silky-smooth constant 360 rotation
      groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.05; // Gentle natural breathing tilt
    }

    // Silky-smooth, slow-moving laser scan sweeping vertically across text
    if (scanLaserRef.current) {
      // Smooth sinusoidal cycle with slow frequency (~3.5 second period)
      scanLaserRef.current.position.y = Math.sin(t * 1.4) * 0.85;
      scanLaserRef.current.rotation.z = Math.sin(t * 0.7) * 0.03;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Pure 3D Floating & Spinning Text Entity (No background plates or bulky cards) */}
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.25}>
        <group ref={groupRef}>
          {/* Front Face 3D Text */}
          <Text
            position={[0, 0, 0.02]}
            fontSize={fontSize}
            maxWidth={4.2}
            lineHeight={1.05}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsA88c7O9yZ4KMCoOg4Ko20yygg_Pb.woff"
            outlineWidth={0.012}
            outlineColor="#1C1917"
          >
            {displayTitle}
            <meshStandardMaterial
              color={primaryColor}
              emissive={emissiveColor}
              emissiveIntensity={isScanning ? 1.4 : verdict ? 0.9 : 0.25}
              metalness={0.7}
              roughness={0.2}
            />
          </Text>

          {/* Reverse Face 3D Text (Oriented outward so it reads correctly when spun 180°) */}
          <Text
            position={[0, 0, -0.02]}
            rotation={[0, Math.PI, 0]}
            fontSize={fontSize}
            maxWidth={4.2}
            lineHeight={1.05}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsA88c7O9yZ4KMCoOg4Ko20yygg_Pb.woff"
            outlineWidth={0.012}
            outlineColor="#1C1917"
          >
            {displayTitle}
            <meshStandardMaterial
              color={primaryColor}
              emissive={emissiveColor}
              emissiveIntensity={isScanning ? 1.4 : verdict ? 0.9 : 0.25}
              metalness={0.7}
              roughness={0.2}
            />
          </Text>
        </group>
      </Float>

      {/* Smooth & Gentle Laser Body Scan Bar */}
      {isScanning && (
        <group ref={scanLaserRef} position={[0, 0, 0]}>
          {/* Soft Laser Light Plane */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4.4, 0.6]} />
            <meshBasicMaterial
              color={glowColor}
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Precision Laser Core Line */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, 4.5, 16]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>

          {/* Ambient Glow Point Light attached to the laser bar */}
          <pointLight color={glowColor} intensity={2.0} distance={2.5} />
        </group>
      )}
    </group>
  );
}

export const Hero3DCanvas: React.FC<SceneProps> = ({ title, verdict, isScanning }) => {
  return (
    <div className="w-full h-full min-h-[280px] relative pointer-events-auto flex items-center justify-center">
      <Canvas
        camera={{ position: [0, 0, 3.8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 6, 5]} intensity={1.6} color="#FFFDF7" />
        <directionalLight position={[-5, -4, -3]} intensity={0.7} color="#E8E0D2" />
        <pointLight
          position={[0, 2, 3]}
          intensity={1.8}
          color={
            verdict === 'APPROVED'
              ? '#10B981'
              : verdict === 'REJECTED'
              ? '#EF4444'
              : verdict === 'MANUAL_REVIEW'
              ? '#F59E0B'
              : '#D97706'
          }
        />
        <Pure3DTitleText title={title} verdict={verdict} isScanning={isScanning} />
      </Canvas>
    </div>
  );
};

