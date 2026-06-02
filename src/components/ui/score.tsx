'use client'

import { cn } from '@/lib/utils'

import {
  getScoreColorTokens,
  getScoreSizeTokens,
  scoreVariants,
  type ScoreSize,
  type ScoreVariant,
} from '@/components/ui/score-variants'

export type ScoreProps = {
  score: number
  max: number
  size?: ScoreSize
  variant?: ScoreVariant
  className?: string
}

const SCORE_FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif"

function formatCompactSegment(value: number, unit: 'k' | 'M') {
  const compactValue = value.toFixed(1).replace(/\.0$/, '')

  return `${compactValue}${unit}`
}

/** Formats values under 1k with up to one decimal place (e.g. 4, 4.5, 12.5). */
function formatDecimalScore(score: number) {
  const sign = score < 0 ? '-' : ''
  const absolute = Math.abs(score)
  const rounded = Math.round(absolute * 10) / 10
  const hasFraction = Math.abs(rounded - Math.trunc(rounded)) > 1e-9

  if (!hasFraction) {
    return `${sign}${Math.trunc(rounded)}`
  }

  return `${sign}${rounded.toFixed(1)}`
}

function formatScoreValue(score: number) {
  const absoluteScore = Math.abs(score)
  const prefix = score < 0 ? '-' : ''

  if (absoluteScore < 1_000) {
    return formatDecimalScore(score)
  }

  if (absoluteScore < 1_000_000) {
    return `${prefix}${formatCompactSegment(absoluteScore / 1_000, 'k')}`
  }

  return `${prefix}${formatCompactSegment(absoluteScore / 1_000_000, 'M')}`
}

function resolveScoreLayout(
  label: string,
  { containerSize, strokeWidth, fontSize, minLabelWidth }: ReturnType<typeof getScoreSizeTokens>,
) {
  const charWidth = fontSize * 0.58
  const labelWidth = Math.max(minLabelWidth, Math.ceil(label.length * charWidth))
  const innerMin = labelWidth + 4
  const resolvedContainer = Math.max(containerSize, innerMin + strokeWidth * 2)

  return {
    containerSize: resolvedContainer,
    strokeWidth,
    fontSize,
    minLabelWidth: labelWidth,
  }
}

function getScoreAriaLabel(score: number, max: number) {
  return `Score ${formatScoreValue(score)} out of ${formatScoreValue(max)}`
}

export function Score({ score, max, size = 'md', variant = 'default', className }: ScoreProps) {
  const sizeTokens = getScoreSizeTokens(size)
  const { ringColor, trackColor, labelColor } = getScoreColorTokens(variant)

  const safeMax = max > 0 ? max : 1
  const clampedScore = Math.min(safeMax, Math.max(0, score))
  const progress = Math.min(1, Math.max(0, clampedScore / safeMax))
  const label = formatScoreValue(score)
  const { containerSize, strokeWidth, fontSize, minLabelWidth } = resolveScoreLayout(
    label,
    sizeTokens,
  )
  const radius = (containerSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)
  const ariaLabel = getScoreAriaLabel(score, max)

  const containerStyle = {
    width: containerSize,
    height: containerSize,
  }

  const labelStyle = {
    fontSize: `${fontSize}px`,
    fontFamily: SCORE_FONT_FAMILY,
    lineHeight: 1,
    color: labelColor,
    minWidth: `${minLabelWidth}px`,
  }

  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={clampedScore}
      aria-label={ariaLabel}
      className={cn(scoreVariants({ size, variant }), className)}
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
          stroke={ringColor}
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
        className="pointer-events-none relative text-center font-medium tabular-nums select-none"
        style={labelStyle}
      >
        {label}
      </span>
    </div>
  )
}
