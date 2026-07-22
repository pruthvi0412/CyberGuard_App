import React, { useRef, useMemo, Suspense, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, OrbitControls, Stars, Text3D, Center, MeshDistortMaterial, Line, Sphere, Torus } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import ChatBot from '../components/ChatBot';
import VoiceAssistant from '../components/VoiceAssistant';

/* ─────────────────────────────────────────────
   CURSOR REACTIVE SCENE — tracks mouse globally
   ───────────────────────────────────────────── */
function CursorFollower({ mouse }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.x += (mouse.current[0] * 1.5 - camera.position.x) * 0.04;
    camera.position.y += (mouse.current[1] * 0.8 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ─────────────────────────────────────────────
   FLOATING CYBER NODE — reacts to proximity of cursor
   ───────────────────────────────────────────── */
function CyberNode({ position, mouse, index }) {
  const mesh = useRef();
  const [hovered, setHovered] = useState(false);
  const baseColor = useMemo(() => (index % 3 === 0 ? '#00ffaa' : index % 3 === 1 ? '#00B4FF' : '#FF00FF'), [index]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.x = t * 0.3 + index;
    mesh.current.rotation.y = t * 0.5 + index;
    mesh.current.rotation.z = t * 0.2;

    // Cursor repulsion / attraction
    const dx = mouse.current[0] * 10 - position[0];
    const dy = mouse.current[1] * 6 - position[1];
    const dist = Math.sqrt(dx * dx + dy * dy);
    const force = Math.max(0, 3 - dist) * 0.015;
    mesh.current.position.x = position[0] + Math.sin(t * 0.7 + index) * 0.4 - dx * force;
    mesh.current.position.y = position[1] + Math.cos(t * 0.5 + index) * 0.3 - dy * force;
    mesh.current.position.z = position[2] + Math.sin(t * 0.4 + index) * 0.5;

    // Pulse scale
    const pulse = 1 + Math.sin(t * 2 + index) * 0.1;
    mesh.current.scale.setScalar(hovered ? pulse * 1.5 : pulse);
  });

  return (
    <mesh ref={mesh} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <icosahedronGeometry args={[0.3, 1]} />
      <meshStandardMaterial
        color={hovered ? '#ffffff' : baseColor}
        emissive={baseColor}
        emissiveIntensity={hovered ? 3 : 0.8}
        wireframe={!hovered}
        transparent
        opacity={hovered ? 1 : 0.7}
      />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   CYBER SHIELD — floating shield shapes
   ───────────────────────────────────────────── */
function CyberShield({ position, mouse, index }) {
  const group = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.4 + index * 1.2;
    group.current.rotation.x = Math.sin(t * 0.3 + index) * 0.3;

    const dx = mouse.current[0] * 10 - position[0];
    const dy = mouse.current[1] * 6 - position[1];
    group.current.position.x = position[0] + Math.sin(t * 0.5 + index) * 0.5 + dx * 0.02;
    group.current.position.y = position[1] + Math.cos(t * 0.4 + index) * 0.4 + dy * 0.02;
    group.current.position.z = position[2];
  });

  return (
    <group ref={group}>
      <mesh>
        <torusGeometry args={[0.4, 0.05, 6, 6]} />
        <meshStandardMaterial color="#00ffaa" emissive="#00ffaa" emissiveIntensity={1} transparent opacity={0.6} />
      </mesh>
      <mesh>
        <octahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial color="#00B4FF" emissive="#00B4FF" emissiveIntensity={1.5} wireframe />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────
   DATA PACKETS — moving cubes along paths
   ───────────────────────────────────────────── */
function DataPacket({ pathOffset, mouse }) {
  const mesh = useRef();
  const speed = 0.3 + pathOffset * 0.2;
  const radius = 4 + pathOffset * 2;
  const tilt = pathOffset * Math.PI * 0.4;

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed + pathOffset * 10;
    mesh.current.position.x = Math.cos(t) * radius + mouse.current[0] * 0.5;
    mesh.current.position.y = Math.sin(t) * radius * Math.cos(tilt) + mouse.current[1] * 0.3;
    mesh.current.position.z = Math.sin(t) * radius * Math.sin(tilt) - 2;
    mesh.current.rotation.x += 0.05;
    mesh.current.rotation.y += 0.03;

    const colorShift = (Math.sin(t * 0.5) + 1) / 2;
    mesh.current.material.emissiveIntensity = 0.5 + colorShift;
  });

  return (
    <mesh ref={mesh}>
      <boxGeometry args={[0.15, 0.15, 0.15]} />
      <meshStandardMaterial color="#00ffaa" emissive="#00B4FF" emissiveIntensity={1} />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   CONNECTION LINES — neural net effect
   ───────────────────────────────────────────── */
function ConnectionWeb({ mouse }) {
  const linesRef = useRef([]);
  const nodeCount = 12;
  const nodePositions = useMemo(() => {
    return Array.from({ length: nodeCount }, (_, i) => {
      const angle = (i / nodeCount) * Math.PI * 2;
      const r = 3 + (i % 3);
      return new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r * 0.6, (Math.random() - 0.5) * 4);
    });
  }, []);

  const lineData = useMemo(() => {
    const lines = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (Math.random() > 0.65) {
          lines.push([nodePositions[i], nodePositions[j]]);
        }
      }
    }
    return lines;
  }, [nodePositions]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    linesRef.current.forEach((line, i) => {
      if (line) {
        line.material.opacity = 0.1 + Math.abs(Math.sin(t * 0.5 + i * 0.3)) * 0.3;
      }
    });
  });

  return (
    <group>
      {nodePositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#00ffaa" emissive="#00ffaa" emissiveIntensity={2} />
        </mesh>
      ))}
      {lineData.map((pts, i) => (
        <Line
          key={i}
          ref={el => linesRef.current[i] = el}
          points={pts}
          color="#00B4FF"
          lineWidth={0.5}
          transparent
          opacity={0.2}
        />
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────────
   CENTRAL GLOBE — the Earth / target
   ───────────────────────────────────────────── */
function CentralGlobe({ mouse }) {
  const group = useRef();
  const wire = useRef();

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y += dt * 0.15;
    group.current.rotation.x = mouse.current[1] * 0.2;
    group.current.rotation.z = mouse.current[0] * 0.1;
    if (wire.current) wire.current.rotation.y -= dt * 0.08;
  });

  return (
    <group ref={group} position={[0, 0, -4]} scale={0.8}>
      <mesh>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshStandardMaterial color="#030a0f" emissive="#00ffaa" emissiveIntensity={0.3} />
      </mesh>
      <mesh ref={wire}>
        <sphereGeometry args={[2.55, 20, 20]} />
        <meshStandardMaterial color="#00ffaa" wireframe transparent opacity={0.15} />
      </mesh>
      <mesh>
        <torusGeometry args={[3.2, 0.02, 8, 120]} />
        <meshStandardMaterial color="#00B4FF" emissive="#00B4FF" emissiveIntensity={1} transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 3, 0, Math.PI / 6]}>
        <torusGeometry args={[3.6, 0.015, 8, 120]} />
        <meshStandardMaterial color="#00ffaa" emissive="#00ffaa" emissiveIntensity={1} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────
   CYBER CRYSTAL — geometric crystal shapes
   ───────────────────────────────────────────── */
function CyberCrystal({ position, mouse, index }) {
  const mesh = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.y = t * 0.6 + index;
    mesh.current.rotation.z = Math.sin(t * 0.4) * 0.5;

    const dx = mouse.current[0] * 12 - position[0];
    const dy = mouse.current[1] * 8 - position[1];
    mesh.current.position.x = position[0] + Math.cos(t * 0.3 + index) * 0.6 + dx * 0.03;
    mesh.current.position.y = position[1] + Math.sin(t * 0.4 + index) * 0.5 + dy * 0.03;
    mesh.current.position.z = position[2] + Math.sin(t * 0.2 + index) * 2;
    
    if (hovered) {
      mesh.current.scale.setScalar(1.4 + Math.sin(t * 5) * 0.1);
    } else {
      mesh.current.scale.setScalar(1.0);
    }
  });

  return (
    <mesh ref={mesh} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <tetrahedronGeometry args={[0.4, 0]} />
      <meshStandardMaterial 
        color={hovered ? '#00ffff' : '#00B4FF'} 
        emissive="#00B4FF" 
        emissiveIntensity={hovered ? 4 : 1}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   FLOATING DATA — small glowing shards
   ───────────────────────────────────────────── */
function FloatingData({ position, mouse, index }) {
  const mesh = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const dx = mouse.current[0] * 8 - position[0];
    const dy = mouse.current[1] * 5 - position[1];
    mesh.current.position.x = position[0] + dx * 0.02 + Math.sin(t * 0.8 + index) * 0.3;
    mesh.current.position.y = position[1] + dy * 0.02 + Math.cos(t * 0.6 + index) * 0.3;
    mesh.current.position.z = position[2];
    mesh.current.rotation.x += 0.02;
    mesh.current.rotation.y += 0.03;
  });

  return (
    <mesh position={position} ref={mesh}>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshStandardMaterial color="#00ffaa" emissive="#00ffaa" emissiveIntensity={2} transparent opacity={0.6} />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   SECURITY LOCK — padlock shape
   ───────────────────────────────────────────── */
function SecurityLock({ position, mouse, index }) {
  const group = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.5 + index;
    const dx = mouse.current[0] * 10 - position[0];
    const dy = mouse.current[1] * 6 - position[1];
    group.current.position.x = position[0] + dx * 0.02 + Math.sin(t * 0.4 + index) * 0.4;
    group.current.position.y = position[1] + dy * 0.02 + Math.cos(t * 0.3 + index) * 0.4;
  });

  return (
    <group ref={group} position={position} scale={0.6}>
      <mesh>
        <boxGeometry args={[0.4, 0.35, 0.2]} />
        <meshStandardMaterial color="#00B4FF" emissive="#00B4FF" emissiveIntensity={0.5} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <torusGeometry args={[0.15, 0.04, 8, 20, Math.PI]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────
   NEURAL CHIP — silicon chip shape
   ───────────────────────────────────────────── */
function NeuralChip({ position, mouse, index }) {
  const mesh = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.x = t * 0.2;
    mesh.current.rotation.y = t * 0.3;
    const dx = mouse.current[0] * 8 - position[0];
    const dy = mouse.current[1] * 5 - position[1];
    mesh.current.position.x = position[0] + dx * 0.01 + Math.sin(t * 0.6 + index) * 0.5;
    mesh.current.position.y = position[1] + dy * 0.01 + Math.cos(t * 0.5 + index) * 0.5;
  });

  return (
    <mesh ref={mesh} position={position} scale={0.7}>
      <boxGeometry args={[0.5, 0.5, 0.05]} />
      <meshStandardMaterial color="#111" />
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[0.35, 0.35]} />
        <meshStandardMaterial color="#00ffaa" emissive="#00ffaa" emissiveIntensity={2} transparent opacity={0.8} />
      </mesh>
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   CYBER SKULL — hacker representation
   ───────────────────────────────────────────── */
function CyberSkull({ position, mouse, index }) {
  const group = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.4 + index;
    group.current.position.y = position[1] + Math.sin(t * 0.5 + index) * 0.6;
    group.current.position.x = position[0] + mouse.current[0] * 1.5;
  });

  return (
    <group ref={group} position={position} scale={0.5}>
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#FF00FF" emissive="#FF00FF" emissiveIntensity={1} transparent opacity={0.6} wireframe />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial color="#200020" emissive="#FF00FF" emissiveIntensity={0.3} />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.12, 0.1, 0.25]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#FF00FF" emissive="#FF00FF" emissiveIntensity={5} />
      </mesh>
      <mesh position={[-0.12, 0.1, 0.25]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#FF00FF" emissive="#FF00FF" emissiveIntensity={5} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────
   RADAR PULSE — concentric scanning rings
   ───────────────────────────────────────────── */
function RadarPulse({ position, mouse, index }) {
  const group = useRef();
  const ringRefs = [useRef(), useRef(), useRef()];

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.position.x = position[0] + Math.sin(t * 0.3 + index) * 0.5;
    group.current.position.y = position[1] + Math.cos(t * 0.3 + index) * 0.5;
    
    ringRefs.forEach((ref, i) => {
      const s = 1 + ((t + i * 0.6) % 2) * 1.5;
      const op = 1 - ((t + i * 0.6) % 2) / 2;
      if (ref.current) {
        ref.current.scale.setScalar(s);
        ref.current.material.opacity = Math.max(0, op * 0.5);
      }
    });
  });

  return (
    <group ref={group} position={position} scale={0.3 + Math.random() * 0.3}>
      {ringRefs.map((ref, i) => (
        <mesh key={i} ref={ref}>
          <torusGeometry args={[0.12, 0.006, 8, 40]} />
          <meshStandardMaterial color="#00ffaa" emissive="#00ffaa" emissiveIntensity={2} transparent opacity={0.3} />
        </mesh>
      ))}
      <mesh>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#00ffaa" emissive="#00ffaa" emissiveIntensity={5} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────
   POLICE BEACON — flashing security lights
   ───────────────────────────────────────────── */
function PoliceBeacon({ position, mouse, index }) {
  const group = useRef();
  const light1 = useRef();
  const light2 = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 12;
    group.current.position.x = position[0] + mouse.current[0] * 2;
    group.current.position.y = position[1] + mouse.current[1] * 2;
    
    const flash = Math.sin(t * 18) > 0;
    if (light1.current) light1.current.material.emissiveIntensity = flash ? 12 : 0;
    if (light2.current) light2.current.material.emissiveIntensity = !flash ? 12 : 0;
  });

  return (
    <group ref={group} position={position} scale={0.35}>
      <mesh ref={light1} position={[0.25, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0} />
      </mesh>
      <mesh ref={light2} position={[-0.25, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#0000FF" emissive="#0000FF" emissiveIntensity={0} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.6, 0.1, 0.2]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────
   FULL BACKGROUND 3D SCENE
   ───────────────────────────────────────────── */
function Scene({ mouse }) {
  const cyberNodes = useMemo(() => Array.from({ length: 32 }, (_, i) => ({
    position: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8 - 4],
    index: i
  })), []);

  const shields = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    position: [(Math.random() - 0.5) * 18, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6 - 2],
    index: i
  })), []);

  const crystals = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    position: [(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 5],
    index: i
  })), []);

  const fragments = useMemo(() => Array.from({ length: 15 }, (_, i) => ({
    position: [(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4 - 1],
    index: i
  })), []);

  const locks = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    position: [(Math.random() - 0.5) * 22, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 10 - 6],
    index: i
  })), []);

  const chips = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    position: [(Math.random() - 0.5) * 16, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6 - 2],
    index: i
  })), []);

  const skulls = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    position: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8 - 3],
    index: i
  })), []);

  const radars = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    position: [(Math.random() - 0.5) * 24, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 8 - 2],
    index: i
  })), []);

  const beacons = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    position: [(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 2 - 1],
    index: i
  })), []);

  return (
    <>
      <Stars radius={120} depth={60} count={6000} factor={4} saturation={0} fade speed={0.5} />
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 5]} intensity={2} color="#00ffaa" />
      <pointLight position={[10, 5, 0]} intensity={1} color="#00B4FF" />
      <pointLight position={[-10, -5, 0]} intensity={0.8} color="#FF00FF" />

      <CentralGlobe mouse={mouse} />
      <ConnectionWeb mouse={mouse} />

      {cyberNodes.map((n, i) => (
        <CyberNode key={i} position={n.position} mouse={mouse} index={n.index} />
      ))}

      {shields.map((s, i) => (
        <CyberShield key={i} position={s.position} mouse={mouse} index={s.index} />
      ))}

      {crystals.map((c, i) => (
        <CyberCrystal key={i} position={c.position} mouse={mouse} index={c.index} />
      ))}

      {fragments.map((f, i) => (
        <FloatingData key={i} position={f.position} mouse={mouse} index={f.index} />
      ))}

      {locks.map((l, i) => (
        <SecurityLock key={i} position={l.position} mouse={mouse} index={l.index} />
      ))}

      {chips.map((c, i) => (
        <NeuralChip key={i} position={c.position} mouse={mouse} index={c.index} />
      ))}

      {skulls.map((s, i) => (
        <CyberSkull key={i} position={s.position} mouse={mouse} index={s.index} />
      ))}

      {radars.map((r, i) => (
        <RadarPulse key={i} position={r.position} mouse={mouse} index={r.index} />
      ))}

      {beacons.map((b, i) => (
        <PoliceBeacon key={i} position={b.position} mouse={mouse} index={b.index} />
      ))}

      {Array.from({ length: 12 }, (_, i) => (
        <DataPacket key={i} pathOffset={i / 12} mouse={mouse} />
      ))}

      <CursorFollower mouse={mouse} />
    </>
  );
}


/* ─────────────────────────────────────────────
   HOME COMPONENT
   ───────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const mouse = useRef([0, 0]);

  const handleMouseMove = useCallback((e) => {
    mouse.current = [
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    ];
  }, []);

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'REPORT', path: '/submit' },
    { name: 'TRACK', path: '/track' },
    { name: 'DASHBOARD', path: '/dashboard' },
    { name: 'ADMIN', path: '/admin' }
  ];

  return (
    <div style={{
      background: '#02060A',
      color: '#fff',
      minHeight: '100vh',
      overflowX: 'hidden',
      position: 'relative',
      fontFamily: 'Inter, sans-serif'
    }} onMouseMove={handleMouseMove}>
      {/* ── FULLSCREEN 3D BACKGROUND ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <Suspense fallback={null}>
            <Scene mouse={mouse} />
          </Suspense>
        </Canvas>
      </div>

      {/* ── ATMOSPHERIC OVERLAY ── */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle at center, transparent 0%, rgba(2, 6, 10, 0.4) 100%)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 1 }} />

      {/* ── NAVBAR ── */}
      <header style={{
        position: 'fixed',
        top: 30,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        padding: '12px 24px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '32px',
        width: '90%',
        maxWidth: 1200,
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ 
            cursor: 'pointer', fontWeight: 900, fontSize: '20px', letterSpacing: '4px', color: '#fff',
            fontFamily: 'Orbitron, monospace', textShadow: '0 0 20px rgba(255, 255, 255, 0.4)'
          }} onClick={() => navigate('/')}>CYBERGUARD</div>
        </div>
        <nav style={{ flex: 2, display: 'flex', justifyContent: 'center', gap: 40 }}>
          {navLinks.map(link => (
            <span key={link.name} style={{ 
              cursor: 'pointer', fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', 
              letterSpacing: '2px', transition: '0.3s'
            }} onClick={() => navigate(link.path)}>
              {link.name}
            </span>
          ))}
        </nav>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            style={{ 
              padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', borderRadius: '16px', fontSize: '11px', fontWeight: 800, cursor: 'pointer'
            }}
            onClick={() => navigate('/login')}
          >
            SIGN IN
          </button>
          <button
            style={{ 
              padding: '10px 20px', background: '#007AFF', border: 'none',
              color: '#fff', borderRadius: '16px', fontSize: '11px', fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 8px 16px rgba(0, 122, 255, 0.3)'
            }}
            onClick={() => navigate('/register-choice')}
          >
            JOIN
          </button>
        </div>
      </header>

      {/* ── HERO CONTENT ── */}
      <section style={{
        position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', padding: '0 40px'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ textAlign: 'center', maxWidth: 1000 }}
        >
          <div style={{ 
            width: 60, height: 4, background: 'linear-gradient(90deg, #007AFF, #00FFD1)',
            margin: '0 auto 40px', borderRadius: 2, boxShadow: '0 0 20px rgba(0, 122, 255, 0.5)'
          }} />

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            style={{ 
              fontSize: 'clamp(3rem, 10vw, 8rem)', fontWeight: 900, letterSpacing: '-4px', lineHeight: '0.9',
              background: 'linear-gradient(to bottom, #fff, rgba(255,255,255,0.6))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 40
            }}
          >
            REPORT.<br />TRACK. PROTECT.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            style={{ 
              display: 'flex', gap: 40, justifyContent: 'center', alignItems: 'center',
              padding: '24px 48px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(30px)',
              borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', width: 'fit-content',
              margin: '0 auto 60px'
            }}
          >
            <div>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 800, letterSpacing: '2px', marginBottom: 4 }}>ENGINE</p>
              <p style={{ fontSize: '14px', fontWeight: 800, color: '#34C759' }}>STABLE</p>
            </div>
            <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.1)' }} />
            <div>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 800, letterSpacing: '2px', marginBottom: 4 }}>NODES</p>
              <p style={{ fontSize: '14px', fontWeight: 800 }}>6,402</p>
            </div>
            <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.1)' }} />
            <div>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 800, letterSpacing: '2px', marginBottom: 4 }}>ACCURACY</p>
              <p style={{ fontSize: '14px', fontWeight: 800 }}>98.9%</p>
            </div>
          </motion.div>

          <motion.button
            onClick={() => navigate('/submit')}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              padding: '24px 64px', background: '#007AFF', borderRadius: '40px',
              border: 'none', color: '#fff', fontSize: '16px', fontWeight: 900,
              letterSpacing: '1px', cursor: 'pointer', boxShadow: '0 20px 40px rgba(0, 122, 255, 0.4)'
            }}
          >
            REPORT INCIDENT
          </motion.button>
        </motion.div>
      </section>

      {/* ── BOT INTERFACE ── */}
      <div style={{ 
        position: 'fixed', bottom: 40, right: 40, zIndex: 100,
        display: 'flex', gap: 16
      }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '12px' }}>
          <ChatBot />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '12px' }}>
          <VoiceAssistant />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STYLES
   ───────────────────────────────────────────── */
const s = {
  root: {
    background: '#000',
    color: '#fff',
    minHeight: '100vh',
    overflowX: 'hidden',
    position: 'relative',
    cursor: 'crosshair'
  },
  canvasBg: {
    position: 'fixed',
    inset: 0,
    zIndex: 0
  },
  scanlines: {
    position: 'fixed',
    inset: 0,
    zIndex: 1,
    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,170,0.015) 2px, rgba(0,255,170,0.015) 4px)',
    pointerEvents: 'none'
  },
  navbar: {
    position: 'relative',
    zIndex: 20,
    display: 'flex',
    justifyContent: 'space-between',
    padding: '18px 40px',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)',
    backdropFilter: 'blur(4px)'
  },
  logo: {
    cursor: 'pointer',
    fontWeight: '900',
    fontSize: 18,
    fontFamily: 'Orbitron, monospace',
    letterSpacing: '4px',
    color: '#00ffaa',
    textShadow: '0 0 20px #00ffaa'
  },
  navLink: {
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    color: 'rgba(255,255,255,0.75)',
    transition: 'color 0.3s',
    fontFamily: 'Orbitron, monospace'
  },
  hero: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 80px)',
    padding: '0 40px',
    marginTop: '-60px'
  },
  heroContent: {
    textAlign: 'center',
    maxWidth: 800
  },
  accentLine: {
    width: 80,
    height: 3,
    background: 'linear-gradient(90deg, #00ffaa, #00B4FF)',
    margin: '0 auto 30px',
    borderRadius: 2,
    boxShadow: '0 0 20px #00ffaa'
  },
  mainText: {
    fontSize: '100px',
    fontWeight: '900',
    letterSpacing: '-3px',
    lineHeight: '0.88',
    fontFamily: 'Orbitron, monospace',
    color: '#ffffff',
    textShadow: '0 0 40px rgba(255,255,255,0.15)',
    marginBottom: 0
  },
  statsCard: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 40,
    gap: 40,
    padding: '20px 40px',
    background: 'rgba(0,255,170,0.03)',
    border: '1px solid rgba(0,255,170,0.1)',
    borderRadius: 8,
    backdropFilter: 'blur(10px)'
  },
  statItem: { textAlign: 'center' },
  statDivider: { width: 1, background: 'rgba(255,255,255,0.1)' },
  statLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: 8,
    fontFamily: 'monospace'
  },
  statValue: { fontWeight: '700', fontSize: '20px', fontFamily: 'Orbitron, monospace' },
  btnPrimary: {
    marginTop: 40,
    padding: '18px 60px',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #00ffaa, #00B4FF)',
    color: '#000',
    border: 'none',
    fontWeight: '900',
    borderRadius: 4,
    textTransform: 'uppercase',
    letterSpacing: '3px',
    fontSize: '13px',
    fontFamily: 'Orbitron, monospace',
    boxShadow: '0 0 40px rgba(0,255,170,0.4)',
    transition: 'all 0.3s ease'
  },
  gmLabel: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    paddingBottom: 40,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10
  },
  gmTitle: {
    fontSize: '36px',
    fontWeight: '800',
    fontFamily: 'Orbitron, monospace',
    letterSpacing: '6px',
    textTransform: 'uppercase',
    color: '#fff',
    textShadow: '0 0 30px rgba(0,255,170,0.5)'
  }
};