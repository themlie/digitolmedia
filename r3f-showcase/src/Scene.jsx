import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Html, RoundedBox, Lightformer } from '@react-three/drei'
import * as THREE from 'three'

const INK = '#111318'
const MUTED = '#666b78'
const ACCENT = '#cc693d'

// ---------- shared soft "contact shadow" blob for floating objects ----------
let sharedShadowTexture = null
function getShadowTexture() {
  if (sharedShadowTexture) return sharedShadowTexture
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  // Reduce outer radius slightly so it fades to fully transparent before touching the quad edges
  const outerRadius = (size / 2) - 4
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, outerRadius)
  g.addColorStop(0, 'rgba(17,19,24,0.4)')
  g.addColorStop(1, 'rgba(17,19,24,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  sharedShadowTexture = new THREE.CanvasTexture(canvas)
  return sharedShadowTexture
}

function SoftShadow({ width, height }) {
  const texture = useMemo(() => getShadowTexture(), [])
  return (
    <mesh position={[0, -height * 0.18, -0.06]}>
      <planeGeometry args={[width * 1.6, height * 1.6]} />
      <meshBasicMaterial map={texture} transparent opacity={0.5} depthWrite={false} />
    </mesh>
  )
}

// ---------- bare float animation wrapper (no card, no glass) ----------
function FloatingGroup({ position, rotation = [0, 0, 0], speed = 1, phase = 0, amplitude = 0.11, children }) {
  const group = useRef()
  const baseY = position[1]

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (!group.current) return
    group.current.position.y = baseY + Math.sin(t * speed + phase) * amplitude
    group.current.rotation.z = rotation[2] + Math.sin(t * speed * 0.6 + phase) * 0.035
    group.current.rotation.x = rotation[0] + Math.cos(t * speed * 0.5 + phase) * 0.02
  })

  return (
    <group ref={group} position={position} rotation={rotation}>
      {children}
    </group>
  )
}

// ---------- bare logo: just the image floating, no glass card behind it ----------
function FloatingLogo({ position, rotation = [0, 0, 0], width, height, speed = 1, phase = 0, amplitude = 0.11, src, size = 60 }) {
  return (
    <FloatingGroup position={position} rotation={rotation} speed={speed} phase={phase} amplitude={amplitude}>
      <SoftShadow width={width} height={height} />
      <Html transform center occlude={false} position={[0, 0, 0.01]} distanceFactor={1.9} style={{ pointerEvents: 'none' }}>
        <img src={src} style={{ width: size, height: size, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 6px 10px rgba(17,19,24,0.18))' }} />
      </Html>
    </FloatingGroup>
  )
}

// ---------- small html helpers (Turkish, brand palette only) ----------
function Stat({ n, l }) {
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 14, color: INK, lineHeight: 1.2 }}>{n}</div>
      <div style={{ fontSize: 10, color: MUTED }}>{l}</div>
    </div>
  )
}
// phone screen
function CSSPhone() {
  return (
    <div className="mp-3d" style={{ transform: 'none', margin: 0 }}>
      <div className="mp-face mp-face-left"></div>
      <div className="mp-face mp-face-right"></div>
      <div className="mp-face mp-face-top"></div>
      <div className="mp-face mp-face-bottom"></div>
      <div className="mp-face mp-face-back">
        <div className="mp-camera-bump"></div>
      </div>
      <div className="mp-face mp-face-front">
        <div className="mp-glare"></div>
        <div className="mp-screen">
          <div className="mp-notch"></div>
          <div className="mp-content">
            <img
              src="images/work/digtol_telefon.webp"
              alt="Digitol"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------- phone: mouse parallax wrapper ----------
function Phone() {
  const group = useRef()
  const eased = useRef({ x: 0, y: 0 })
  const base = { x: -0.33, y: 0.06 }

  useFrame((state) => {
    eased.current.x += (state.pointer.x - eased.current.x) * 0.035
    eased.current.y += (state.pointer.y - eased.current.y) * 0.035
    if (group.current) {
      group.current.rotation.y = base.x + eased.current.x * 0.14
      group.current.rotation.x = base.y - eased.current.y * 0.09
    }
  })

  return (
    <group ref={group} position={[-0.075, 0.55, 0]} rotation={[base.y, base.x, 0.015]}>
      <Html transform center occlude={false} position={[0, 0, 0]} distanceFactor={1.3} style={{ pointerEvents: 'none' }}>
        <CSSPhone />
      </Html>
      <SoftShadow width={1.4} height={2.6} />
    </group>
  )
}

// ---------- floating ecosystem objects (no glass mesh — bare icons / soft CSS cards) ----------
function SvgIconCard(props) {
  const { children, width, height, ...rest } = props
  return (
    <FloatingGroup {...rest}>
      <SoftShadow width={width} height={height} />
      <Html transform center occlude={false} position={[0, 0, 0.01]} distanceFactor={1.9} style={{ pointerEvents: 'none' }}>
        <div style={{ filter: 'drop-shadow(0 5px 8px rgba(17,19,24,0.16))', display: 'flex' }}>{children}</div>
      </Html>
    </FloatingGroup>
  )
}

const softCardStyle = {
  background: 'rgba(255,255,255,0.92)',
  borderRadius: 18,
  boxShadow: '0 16px 34px rgba(17,19,24,0.12)',
  fontFamily: "'Inter', sans-serif",
}

function GrowthCard(props) {
  const { width, height, ...rest } = props
  return (
    <FloatingGroup {...rest}>
      <SoftShadow width={width} height={height} />
      <Html transform center occlude={false} position={[0, 0, 0.01]} distanceFactor={1.9} style={{ pointerEvents: 'none' }}>
        <div style={{ ...softCardStyle, width: 195, padding: '18px 20px' }}>
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 5 }}>Takipçi Artışı</div>
          <div style={{ fontWeight: 800, fontSize: 27, color: INK, marginBottom: 10 }}>+284%</div>
          <svg width="153" height="54" viewBox="0 0 118 42">
            <polyline points="0,38 20,30 40,32 60,18 80,20 100,7 118,3" fill="none" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </Html>
    </FloatingGroup>
  )
}

function EngagementCard(props) {
  const { width, height, ...rest } = props
  return (
    <FloatingGroup {...rest}>
      <SoftShadow width={width} height={height} />
      <Html transform center occlude={false} position={[0, 0, 0.01]} distanceFactor={1.9} style={{ pointerEvents: 'none' }}>
        <div style={{ ...softCardStyle, width: 198, padding: '18px 20px', display: 'flex', gap: 24 }}>
          <Stat n="%8.2" l="Etkileşim" />
          <Stat n="96K" l="Erişim" />
        </div>
      </Html>
    </FloatingGroup>
  )
}

function CalendarCard(props) {
  const { width, height, ...rest } = props
  const highlighted = [2, 5, 9, 13, 17]
  return (
    <FloatingGroup {...rest}>
      <SoftShadow width={width} height={height} />
      <Html transform center occlude={false} position={[0, 0, 0.01]} distanceFactor={1.9} style={{ pointerEvents: 'none' }}>
        <div style={{ ...softCardStyle, width: 172, padding: 20 }}>
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 12 }}>İçerik Takvimi</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
            {Array.from({ length: 21 }).map((_, i) => (
              <div key={i} style={{ width: 13, height: 13, borderRadius: 4, background: highlighted.includes(i) ? ACCENT : '#ececec' }} />
            ))}
          </div>
        </div>
      </Html>
    </FloatingGroup>
  )
}

function NotificationBadge(props) {
  const { width, height, ...rest } = props
  return (
    <FloatingGroup {...rest}>
      <SoftShadow width={width} height={height} />
      <Html transform center occlude={false} position={[0, 0, 0.01]} distanceFactor={1.9} style={{ pointerEvents: 'none' }}>
        <div style={{ position: 'relative', width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', filter: 'drop-shadow(0 5px 8px rgba(17,19,24,0.16))' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <div style={{ position: 'absolute', top: 4, right: 6, width: 11, height: 11, borderRadius: '50%', background: ACCENT, border: '2px solid #fff' }} />
        </div>
      </Html>
    </FloatingGroup>
  )
}

const heartSvg = (
  <svg width="120" height="120" viewBox="0 0 24 24" fill={ACCENT}>
    <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 2.5 5 6 5c2 0 3.5 1.2 4 2.3.5-1.1 2-2.3 4-2.3 3.5 0 5.5 3.5 3.5 7.5C19 16.65 12 21 12 21z" />
  </svg>
)
const commentSvg = (
  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.8">
    <path d="M21 11.5a8.38 8.38 0 0 1-4.5 7.5 8.5 8.5 0 0 1-4 .9 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6A8.38 8.38 0 0 1 12.5 3h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)
const linkedinSvg = (
  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.6">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V9h4v1.5A6 6 0 0 1 16 8z" />
    <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
  </svg>
)
const tiktokSvg = (
  <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.6">
    <path d="M9 3v12.8a3.6 3.6 0 1 1-3.2-3.58" />
    <path d="M9 3.2c.7 2.7 2.9 4.6 6 4.8v3.2c-2.2-.1-4.2-.9-6-2.2" />
  </svg>
)

// ---------- studio-style environment (no external HDRI dependency) ----------
function Studio() {
  return (
    <Environment resolution={256}>
      <group>
        <Lightformer form="rect" intensity={2.4} color="#ffffff" position={[0, 4, 3]} scale={[7, 3, 1]} />
        <Lightformer form="rect" intensity={1.1} color="#fff3e8" position={[-5, 1, 2]} scale={[3, 5, 1]} rotation={[0, Math.PI / 4, 0]} />
        <Lightformer form="rect" intensity={0.95} color="#ffffff" position={[5, 0, 2]} scale={[3, 5, 1]} rotation={[0, -Math.PI / 4, 0]} />
        <Lightformer form="ring" intensity={1.6} color="#ffd9b3" position={[0, -0.5, -6]} scale={5} />
      </group>
    </Environment>
  )
}

export default function Scene() {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ fov: 32, position: [0, 0, 12] }} gl={{ antialias: true, alpha: false }}>
      <color attach="background" args={['#ffffff']} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 4]} intensity={1.0} color="#fff8f0" />
      <pointLight position={[0, 0, -3]} intensity={0.45} color={ACCENT} distance={9} decay={2} />

      <Studio />

      <Phone />

      <FloatingLogo src="images/3d%20logo/insta.png" size={160} position={[-2.05, 1.2, 0.5]} width={1.4} height={1.4} speed={0.55} phase={0.2} amplitude={0.1} />
      <FloatingLogo src="images/3d%20logo/faceboook.png" size={150} position={[2.1, 1.35, -0.35]} width={1.3} height={1.3} speed={0.5} phase={1.4} amplitude={0.1} />
      <SvgIconCard position={[-2.15, -1.05, -0.25]} width={2.2} height={2.2} speed={0.62} phase={2.1} amplitude={0.09}>{linkedinSvg}</SvgIconCard>
      <SvgIconCard position={[2.15, -1.15, 0.45]} width={3.4} height={3.4} speed={0.58} phase={0.8} amplitude={0.09}>{tiktokSvg}</SvgIconCard>

      <SvgIconCard position={[0.55, 2.15, 0.75]} width={1.8} height={1.8} speed={0.75} phase={0.5} amplitude={0.12}>{heartSvg}</SvgIconCard>
      <SvgIconCard position={[-1.15, -2.0, 0.65]} width={1.8} height={1.8} speed={0.7} phase={1.9} amplitude={0.12}>{commentSvg}</SvgIconCard>

      <GrowthCard position={[2.6, 0.15, -0.85]} width={1.5} height={1.05} speed={0.4} phase={0.3} amplitude={0.08} />
      <EngagementCard position={[-2.65, 0.3, -0.75]} width={1.35} height={0.85} speed={0.42} phase={1.6} amplitude={0.08} />
      <CalendarCard position={[0.1, -2.25, -0.55]} width={1.25} height={1.1} speed={0.38} phase={2.4} amplitude={0.08} />
      <NotificationBadge position={[1.85, 2.45, 1.15]} width={0.55} height={0.55} speed={0.9} phase={3.0} amplitude={0.1} />
    </Canvas>
  )
}
