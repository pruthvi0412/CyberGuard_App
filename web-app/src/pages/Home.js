import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/* ─────────────────────────────────────────────
3D GLOBE Component
───────────────────────────────────────────── */
function Globe() {
  const sphere = useRef();
  const wire = useRef();
  const ring1 = useRef();
  const ring2 = useRef();

  useFrame((_, dt) => {
    if (sphere.current) sphere.current.rotation.y += dt * 0.2;
    if (wire.current) wire.current.rotation.y -= dt * 0.1;
    if (ring1.current) ring1.current.rotation.x += dt * 0.3;
    if (ring2.current) ring2.current.rotation.z += dt * 0.2;
  });

  return (
    <group>
      <mesh ref={sphere}>
        <sphereGeometry args={[2, 48, 48]} />
        <meshStandardMaterial color="#e0e4ea" transparent opacity={0.6} />
      </mesh>
      <mesh ref={wire}>
        <sphereGeometry args={[2.05, 20, 20]} />
        <meshStandardMaterial color="#888" wireframe transparent opacity={0.3} />
      </mesh>
      <mesh ref={ring1}>
        <torusGeometry args={[2.8, 0.01, 8, 100]} />
        <meshStandardMaterial color="#555" transparent opacity={0.5} />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[3.2, 0.005, 8, 100]} />
        <meshStandardMaterial color="#999" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function Particles() {
  const count = 60;
  const pos = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 15;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 15;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={pos} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#aaa" size={0.05} transparent opacity={0.4} />
    </points>
  );
}

/* ─────────────────────────────────────────────
MAIN HOME Component
───────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Report', path: '/submit' },
    { name: 'Track', path: '/track' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Admin', path: '/admin' }
  ];

  return (
    <div style={s.root}>
      {/* Navbar */}
      <header style={s.navbar}>
        <div style={s.logo} onClick={() => navigate('/')}>CRMS</div>
        <nav style={s.navRow}>
          {navLinks.map((link) => (
            <span key={link.name} style={s.navLink} onClick={() => navigate(link.path)}>
              {link.name}
            </span>
          ))}
        </nav>
        <button style={s.reportBtn} onClick={() => navigate('/register')}>Get Started</button>
      </header>

      {/* Hero Section */}
      <section style={s.hero}>
        <motion.h1 style={s.mainText} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          REPORT. TRACK.<br />PROTECT.
        </motion.h1>

        {/* Updated Stats Card with Accuracy and Green Dot */}
        <motion.div style={s.statsCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div style={s.statItem}>
            <p style={s.statLabel}>Status</p>
            <p style={s.statValue}><span style={s.greenDot}>●</span> Operational</p>
          </div>
          <div style={s.statDivider} />
          <div style={s.statItem}>
            <p style={s.statLabel}>Cases Solved</p>
            <p style={s.statValue}>48,230</p>
          </div>
          <div style={s.statDivider} />
          <div style={s.statItem}>
            <p style={s.statLabel}>Accuracy</p>
            <p style={s.statValue}>97.4%</p>
          </div>
        </motion.div>
      </section>

      {/* Globe Section */}
      <section style={s.globeSection}>
        <div style={s.globeText}>
          <p style={s.eyebrow}>CYBER SECURITY</p>
          <h2 style={s.sectionTitle}>Global Monitoring</h2>
          <p style={s.globeDesc}>Real-time monitoring of cyber threats and reports, now connected to your MongoDB instance.</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
            <button style={s.btnPrimary} onClick={() => navigate('/register')}>Join Now</button>
            <button style={s.btnSecondary} onClick={() => navigate('/login')}>Login</button>
          </div>
        </div>
        <div style={s.globeCanvas}>
          <Canvas camera={{ position: [0, 0, 7] }}>
            <ambientLight intensity={1.5} />
            <Suspense fallback={null}>
              <Float speed={1.5}><Globe /></Float>
              <Particles />
            </Suspense>
          </Canvas>
        </div>
      </section>
    </div>
  );
}

/* Styles */
const s = {
  root: { background: '#f5f5f5', color: '#111', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 50px', background: '#fff', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontWeight: 900, fontSize: 18, cursor: 'pointer' },
  navRow: { display: 'flex' },
  navLink: { margin: '0 15px', color: '#555', fontSize: 13, cursor: 'pointer', fontWeight: 500, transition: '0.2s color' },
  reportBtn: { padding: '8px 18px', border: '1px solid #111', background: '#fff', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  hero: { textAlign: 'center', padding: '80px 20px' },
  mainText: { fontSize: 'clamp(40px, 8vw, 70px)', fontWeight: 900, letterSpacing: '-2px', margin: 0 },
  statsCard: { display: 'flex', background: '#fff', width: 'min(550px, 90vw)', margin: '40px auto', padding: '20px', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
  statItem: { flex: 1, textAlign: 'center' },
  statDivider: { width: 1, background: '#f0f0f0' },
  statLabel: { fontSize: 10, color: '#999', textTransform: 'uppercase', marginBottom: 5 },
  statValue: { fontWeight: 700, fontSize: 14 },
  greenDot: { color: '#22c55e', marginRight: 6, fontSize: 10 },
  globeSection: { display: 'flex', alignItems: 'center', padding: '50px 100px', background: '#fff', gap: 50, flexWrap: 'wrap' },
  globeText: { flex: 1, maxWidth: 450 },
  sectionTitle: { fontSize: 32, fontWeight: 800, marginTop: 10 },
  globeDesc: { fontSize: 15, color: '#666', lineHeight: 1.6 },
  globeCanvas: { flex: 1, height: 450 },
  btnPrimary: { background: '#111', color: '#fff', border: 'none', borderRadius: 20, padding: '12px 24px', cursor: 'pointer', fontWeight: 600 },
  btnSecondary: { background: '#fff', color: '#111', border: '1px solid #ddd', borderRadius: 20, padding: '12px 24px', cursor: 'pointer', fontWeight: 600 },
};