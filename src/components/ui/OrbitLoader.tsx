/**
 * OrbitLoader.tsx
 * Standalone orbit/momentum loading spinner.
 * Pure CSS animation via injected keyframes + CSS custom properties.
 *
 * Usage:
 *   <OrbitLoader />
 *   <OrbitLoader size={60} color="#3b82f6" speed={2} />
 *
 * Props:
 *   size   — px size (default: 45)
 *   color  — CSS color string (default: "currentColor")
 *   speed  — animation duration in seconds (default: 2.5)
 *   className — extra classes on wrapper
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrbitLoaderProps {
  size?: number
  color?: string
  speed?: number
  className?: string
}

// ─── Keyframes (injected once) ────────────────────────────────────────────────

const STYLE_ID = '__orbit-loader-styles__'

function ensureStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return
  const el = document.createElement('style')
  el.id = STYLE_ID
  el.textContent = `
    @keyframes orbitMove {
      0%   { transform: translateX(calc(var(--ol-size) * 0.25))   scale(0.73684);  opacity: 0.65; }
      5%   { transform: translateX(calc(var(--ol-size) * 0.235))  scale(0.68421);  opacity: 0.58; }
      10%  { transform: translateX(calc(var(--ol-size) * 0.182))  scale(0.63158);  opacity: 0.51; }
      15%  { transform: translateX(calc(var(--ol-size) * 0.129))  scale(0.57894);  opacity: 0.44; }
      20%  { transform: translateX(calc(var(--ol-size) * 0.076))  scale(0.52631);  opacity: 0.37; }
      25%  { transform: translateX(0%)                            scale(0.47368);  opacity: 0.30; }
      30%  { transform: translateX(calc(var(--ol-size) * -0.076)) scale(0.52631);  opacity: 0.37; }
      35%  { transform: translateX(calc(var(--ol-size) * -0.129)) scale(0.57894);  opacity: 0.44; }
      40%  { transform: translateX(calc(var(--ol-size) * -0.182)) scale(0.63158);  opacity: 0.51; }
      45%  { transform: translateX(calc(var(--ol-size) * -0.235)) scale(0.68421);  opacity: 0.58; }
      50%  { transform: translateX(calc(var(--ol-size) * -0.25))  scale(0.73684);  opacity: 0.65; }
      55%  { transform: translateX(calc(var(--ol-size) * -0.235)) scale(0.78947);  opacity: 0.72; }
      60%  { transform: translateX(calc(var(--ol-size) * -0.182)) scale(0.84210);  opacity: 0.79; }
      65%  { transform: translateX(calc(var(--ol-size) * -0.129)) scale(0.89474);  opacity: 0.86; }
      70%  { transform: translateX(calc(var(--ol-size) * -0.076)) scale(0.94737);  opacity: 0.93; }
      75%  { transform: translateX(0%)                            scale(1);        opacity: 1.00; }
      80%  { transform: translateX(calc(var(--ol-size) * 0.076))  scale(0.94737);  opacity: 0.93; }
      85%  { transform: translateX(calc(var(--ol-size) * 0.129))  scale(0.89474);  opacity: 0.86; }
      90%  { transform: translateX(calc(var(--ol-size) * 0.182))  scale(0.84210);  opacity: 0.79; }
      95%  { transform: translateX(calc(var(--ol-size) * 0.235))  scale(0.78947);  opacity: 0.72; }
      100% { transform: translateX(calc(var(--ol-size) * 0.25))   scale(0.73684);  opacity: 0.65; }
    }

    .orbit-dot {
      position: absolute;
      top: 0;
      left: calc(50% - var(--ol-size) / 12);
      height: 100%;
      width: calc(100% / 6);
      border-radius: 50%;
      background-color: var(--ol-color);
      flex-shrink: 0;
      animation: orbitMove var(--ol-speed) linear infinite;
      transition: background-color 0.3s ease;
      will-change: transform, opacity;
    }

    /* per-slice delays — before / after pairs */
    .orbit-slice:nth-child(1) .orbit-dot-after  { animation-delay: calc(var(--ol-speed) / -2); }
    .orbit-slice:nth-child(2) .orbit-dot-before { animation-delay: calc(var(--ol-speed) / -6); }
    .orbit-slice:nth-child(2) .orbit-dot-after  { animation-delay: calc(var(--ol-speed) / -2 + var(--ol-speed) / -6); }
    .orbit-slice:nth-child(3) .orbit-dot-before { animation-delay: calc(var(--ol-speed) / -6 * 2); }
    .orbit-slice:nth-child(3) .orbit-dot-after  { animation-delay: calc(var(--ol-speed) / -2 + var(--ol-speed) / -6 * 2); }
    .orbit-slice:nth-child(4) .orbit-dot-before { animation-delay: calc(var(--ol-speed) / -6 * 3); }
    .orbit-slice:nth-child(4) .orbit-dot-after  { animation-delay: calc(var(--ol-speed) / -2 + var(--ol-speed) / -6 * 3); }
    .orbit-slice:nth-child(5) .orbit-dot-before { animation-delay: calc(var(--ol-speed) / -6 * 4); }
    .orbit-slice:nth-child(5) .orbit-dot-after  { animation-delay: calc(var(--ol-speed) / -2 + var(--ol-speed) / -6 * 4); }
    .orbit-slice:nth-child(6) .orbit-dot-before { animation-delay: calc(var(--ol-speed) / -6 * 5); }
    .orbit-slice:nth-child(6) .orbit-dot-after  { animation-delay: calc(var(--ol-speed) / -2 + var(--ol-speed) / -6 * 5); }
  `
  document.head.appendChild(el)
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OrbitLoader({
  size = 45,
  color = 'currentColor',
  speed = 2.5,
  className,
}: OrbitLoaderProps) {
  React.useEffect(() => {
    ensureStyles()
  }, [])

  const cssVars = {
    '--ol-size': `${size}px`,
    '--ol-color': color,
    '--ol-speed': `${speed}s`,
  } as React.CSSProperties

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex flex-col items-center justify-center', className)}
      style={{ ...cssVars, width: size, height: size }}
    >
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="orbit-slice relative w-full"
          style={{ height: size / 6 }}
        >
          <span className="orbit-dot orbit-dot-before" />
          <span className="orbit-dot orbit-dot-after" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  )
}

// ─── Demo ─────────────────────────────────────────────────────────────────────

export default function OrbitLoaderDemo() {
  return (
    <div className="min-h-screen bg-white flex flex-wrap items-center justify-center gap-16 p-12">
      {/* Default */}
      <div className="flex flex-col items-center gap-3">
        <OrbitLoader />
        <span className="text-xs text-neutral-400 font-mono">default</span>
      </div>

      {/* Large + blue */}
      <div className="flex flex-col items-center gap-3">
        <OrbitLoader
          size={72}
          color="#3b82f6"
        />
        <span className="text-xs text-neutral-400 font-mono">large · blue</span>
      </div>

      {/* Small + fast */}
      <div className="flex flex-col items-center gap-3">
        <OrbitLoader
          size={28}
          color="#10b981"
          speed={1.4}
        />
        <span className="text-xs text-neutral-400 font-mono">small · fast</span>
      </div>

      {/* Slow + violet */}
      <div className="flex flex-col items-center gap-3">
        <OrbitLoader
          size={56}
          color="#8b5cf6"
          speed={4}
        />
        <span className="text-xs text-neutral-400 font-mono">slow · violet</span>
      </div>

      {/* On dark */}
      <div className="bg-neutral-900 rounded-2xl p-8 flex flex-col items-center gap-3">
        <OrbitLoader
          size={45}
          color="white"
        />
        <span className="text-xs text-neutral-500 font-mono">on dark</span>
      </div>

      {/* currentColor inheritance */}
      <div className="text-rose-500 flex flex-col items-center gap-3">
        <OrbitLoader size={45} />
        <span className="text-xs font-mono">currentColor</span>
      </div>
    </div>
  )
}
