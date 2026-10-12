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
function FloatingGroup({ position, rotation = [0, 0, 0], speed = 1, phase = 0, amplitude = 0.11, children, ...rest }) {
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
    <group ref={group} position={position} rotation={rotation} {...rest}>
      {children}
    </group>
  )
}

// ---------- bare logo: just the image floating, no glass card behind it ----------
function FloatingLogo({ position, rotation = [0, 0, 0], width, height, speed = 1, phase = 0, amplitude = 0.11, src, size = 60 }) {
  return (
    <FloatingGroup position={position} rotation={rotation} speed={speed} phase={phase} amplitude={amplitude}>

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
    <group ref={group} position={[-1.8, 1.6, 0]} rotation={[base.y, base.x, 0.015]} scale={1.4}>
      <Html transform center occlude={false} position={[0, 0, 0]} distanceFactor={1.3} style={{ pointerEvents: 'none' }}>
        <CSSPhone />
      </Html>

    </group>
  )
}

// ---------- floating ecosystem objects (no glass mesh — bare icons / soft CSS cards) ----------
function SvgIconCard(props) {
  const { children, width, height, ...rest } = props
  return (
    <FloatingGroup {...rest}>

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

      <Html transform center occlude={false} position={[0, 0, 0.01]} distanceFactor={1.9} style={{ pointerEvents: 'none' }}>
        <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', filter: 'drop-shadow(0 6px 12px rgba(17,19,24,0.16))' }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <div style={{ position: 'absolute', top: 10, right: 14, width: 24, height: 24, borderRadius: '50%', background: ACCENT, border: '4px solid #fff' }} />
        </div>
      </Html>
    </FloatingGroup>
  )
}

const heartSvg = (
  <svg width="120" height="120" viewBox="0 0 24 24" fill={ACCENT}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
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

export default function SocialScene({ domTarget }) {
  const group = useRef()
  useFrame(() => {
    if (domTarget && group.current) {
      const rect = domTarget.getBoundingClientRect()
      const vh = window.innerHeight
      // Fade out as it scrolls UP (leaves top)
      const leaveP = Math.max(0, Math.min(1, -rect.top / (rect.height * 0.7)))
      const targetScale = 1 - leaveP * 0.4
      const targetZ = leaveP * -8
      group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08)
      group.current.position.z += (targetZ - group.current.position.z) * 0.08
      // opacity can't easily be lerped on a group without material traversal, but scaling/receding is enough!
    }
  })

  return (
    <group ref={group}>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 4]} intensity={1.0} color="#fff8f0" />
      <pointLight position={[0, 0, -3]} intensity={0.45} color={ACCENT} distance={9} decay={2} />

      <Studio />

      <Phone />

      <GrowthCard position={[1.5, 1.5, -0.5]} scale={1.6} width={1.5} height={1.05} speed={0.4} phase={0.3} amplitude={0.08} />
      <EngagementCard position={[1.9, 0.15, -0.85]} scale={1.6} width={1.35} height={0.85} speed={0.42} phase={1.6} amplitude={0.08} />
      <CalendarCard position={[1.4, -1.5, -0.2]} scale={1.8} width={1.25} height={1.1} speed={0.38} phase={2.4} amplitude={0.08} />
    </group>
  )
}
