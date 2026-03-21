'use client'

import * as React from 'react'

import { Separator } from '@/components/ui/separator'

export type CharacterCounterProps = {
  count: number
  max: number
  size?: number
  color?: string
}

const WARN_AT = 20
const DANGER_AT = 0
const TRACK_COLOR = '#d9e0e5'

function getColor(remaining: number, override?: string) {
  if (override) {
    return override
  }

  if (remaining <= DANGER_AT) {
    return '#f4212e'
  }

  if (remaining <= WARN_AT) {
    return '#ff7a00'
  }

  return '#1d9bf0'
}

export function CharacterCounter({
  count,
  max,
  size = 20,
  color: colorOverride,
}: CharacterCounterProps) {
  const isWarning = count <= WARN_AT && count >= 0
  const color = getColor(count, colorOverride)

  const strokeWidth = size * 0.12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const safeMax = max > 0 ? max : 1

  const dashOffset = React.useMemo(() => {
    const used = Math.min(safeMax, safeMax - count)
    const percentage = Math.min(1, Math.max(0, used / safeMax))
    return circumference * (1 - percentage)
  }, [count, circumference, safeMax])

  const fontSize = Math.max(9, size * 0.55)

  if (count < 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={`${Math.abs(count)} characters over limit`}
        className="inline-flex shrink-0 items-center justify-center text-destructive"
        style={{
          width: size,
          height: size,
        }}
      >
        <span
          className="font-medium tabular-nums"
          style={{
            fontSize: `${fontSize}px`,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
            lineHeight: 1,
          }}
        >
          {count}
        </span>
      </div>
    )
  }

  return (
    <div
      role="meter"
      aria-valuenow={count}
      aria-valuemax={max}
      aria-label={`${count} characters remaining`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'visible',
        }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={TRACK_COLOR}
          strokeWidth={strokeWidth}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset 0.18s ease, stroke 0.18s ease',
          }}
        />
      </svg>

      <span
        aria-hidden="true"
        style={{
          position: 'relative',
          fontSize: `${fontSize}px`,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
          fontWeight: 400,
          lineHeight: 1,
          color,
          opacity: isWarning ? 1 : 0,
          transform: isWarning ? 'scale(1)' : 'scale(0.6)',
          transition: 'opacity 0.15s ease, transform 0.15s ease, color 0.18s ease',
          userSelect: 'none',
          pointerEvents: 'none',
          minWidth: `${fontSize * 1.6}px`,
          textAlign: 'center',
        }}
      >
        {count}
      </span>
    </div>
  )
}

export function CharacterCounterDemo() {
  const max = 280
  const [text, setText] = React.useState('')
  const remaining = max - text.length

  const showcaseStates = [
    { label: 'plenty', value: 220 },
    { label: '20 left', value: 20 },
    { label: '10 left', value: 10 },
    { label: 'at limit', value: 0 },
    { label: '-10', value: -10 },
  ]

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-4 text-neutral-900 shadow-sm">
      <div className="mx-auto w-full max-w-xl">
        <div className="rounded-3xl border border-neutral-200 bg-white p-4">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={4}
            placeholder="What's happening?"
            className="min-h-28 w-full resize-none border-0 bg-transparent text-[17px] leading-7 text-neutral-900 outline-none placeholder:text-neutral-400"
          />

          <Separator className="mt-3 bg-neutral-200" />

          <div className="mt-3 flex items-center justify-end gap-3">
            <CharacterCounter
              count={remaining}
              max={max}
              size={20}
            />
            <Separator
              orientation="vertical"
              className="h-6 bg-neutral-200"
            />
            <button
              type="button"
              disabled={!text.length}
              className="rounded-full bg-[#1d9bf0] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1a8cd8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-5">
          {showcaseStates.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-1.5 text-[11px] text-neutral-500"
            >
              <CharacterCounter
                count={item.value}
                max={max}
                size={26}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
