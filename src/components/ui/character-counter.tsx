'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

import {
  CHARACTER_COUNTER_WARNING_AT,
  characterCounterVariants,
  getCharacterCounterColorTokens,
  getCharacterCounterSizeTokens,
  type CharacterCounterSize,
  type CharacterCounterVariant,
} from '@/components/ui/character-counter-variants'
import { Separator } from '@/components/ui/separator'

export type CharacterCounterProps = {
  count: number
  max: number
  size?: CharacterCounterSize
  variant?: CharacterCounterVariant
  className?: string
}

const COUNTER_FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif"

function getCharacterCounterAriaLabel(count: number) {
  if (count < 0) {
    return `${Math.abs(count)} characters over limit`
  }

  return `${count} characters remaining`
}

export function CharacterCounter({
  count,
  max,
  size = 'md',
  variant = 'default',
  className,
}: CharacterCounterProps) {
  const isExceeded = count < 0
  const isWarning = count <= CHARACTER_COUNTER_WARNING_AT && count >= 0

  const { containerSize, strokeWidth, fontSize, minLabelWidth } =
    getCharacterCounterSizeTokens(size)
  const { ringColor, warningColor, exceedColor, trackColor } =
    getCharacterCounterColorTokens(variant)

  const activeColor = isExceeded ? exceedColor : isWarning ? warningColor : ringColor
  const safeMax = max > 0 ? max : 1
  const used = Math.min(safeMax, Math.max(0, safeMax - count))
  const percentage = Math.min(1, Math.max(0, used / safeMax))
  const radius = (containerSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - percentage)
  const ariaLabel = getCharacterCounterAriaLabel(count)

  const containerStyle = {
    width: containerSize,
    height: containerSize,
  }

  const exceededTrackStyle = {
    stroke: ringColor,
    opacity: 0.35,
  }

  const textStyle = {
    fontSize: `${fontSize}px`,
    fontFamily: COUNTER_FONT_FAMILY,
    lineHeight: 1,
    color: activeColor,
    minWidth: `${minLabelWidth}px`,
  }

  if (isExceeded) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={ariaLabel}
        className={cn(characterCounterVariants({ size, variant }), className)}
        style={containerStyle}
      >
        <svg
          width={containerSize}
          height={containerSize}
          viewBox={`0 0 ${containerSize} ${containerSize}`}
          className="absolute inset-0 overflow-visible"
          aria-hidden="true"
        >
          <circle
            cx={containerSize / 2}
            cy={containerSize / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={exceededTrackStyle}
          />
          <circle
            cx={containerSize / 2}
            cy={containerSize / 2}
            r={radius}
            fill="none"
            stroke={activeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </svg>

        <span
          className="relative z-10 text-center font-medium tabular-nums"
          style={textStyle}
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
      aria-label={ariaLabel}
      className={cn(characterCounterVariants({ size, variant }), className)}
      style={containerStyle}
    >
      <svg
        width={containerSize}
        height={containerSize}
        viewBox={`0 0 ${containerSize} ${containerSize}`}
        className="absolute inset-0 overflow-visible"
        aria-hidden="true"
      >
        <circle
          cx={containerSize / 2}
          cy={containerSize / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />

        <circle
          cx={containerSize / 2}
          cy={containerSize / 2}
          r={radius}
          fill="none"
          stroke={activeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${containerSize / 2} ${containerSize / 2})`}
          style={{
            transition: 'stroke-dashoffset 0.18s ease, stroke 0.18s ease',
          }}
        />
      </svg>

      <span
        aria-hidden="true"
        className="pointer-events-none relative text-center font-normal tabular-nums select-none"
        style={{
          ...textStyle,
          opacity: isWarning ? 1 : 0,
          transform: isWarning ? 'scale(1)' : 'scale(0.6)',
          transition: 'opacity 0.15s ease, transform 0.15s ease, color 0.18s ease',
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
  ] as const

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
              size="md"
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
                size="xl"
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
