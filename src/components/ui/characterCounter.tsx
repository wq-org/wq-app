import { MAX_DESCRIPTION_LENGTH } from '@/lib/constants'
import { getThemeCssVar, type ThemeId } from '@/lib/themes'

export type CharacterCounterProps = {
  count: number
  max?: number
  size?: number
  themeId?: ThemeId
}

const WARN_AT = 20
const DANGER_AT = 0
const TRACK_COLOR = 'oklch(var(--border))'

function getThemeColor(themeId: ThemeId) {
  return `oklch(var(${getThemeCssVar(themeId)}))`
}

function getColor(remaining: number, override?: ThemeId) {
  if (override) {
    return getThemeColor(override)
  }

  if (remaining <= DANGER_AT) {
    return getThemeColor('pink')
  }

  if (remaining <= WARN_AT) {
    return getThemeColor('orange')
  }

  return getThemeColor('blue')
}

export function CharacterCounter({
  count,
  max = MAX_DESCRIPTION_LENGTH,
  size = 20,
  themeId,
}: CharacterCounterProps) {
  const safeMax = Math.max(1, max)
  const isWarning = count <= WARN_AT
  const color = getColor(count, themeId)

  const strokeWidth = size * 0.12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const used = Math.min(safeMax, safeMax - count)
  const percentage = Math.min(1, Math.max(0, used / safeMax))
  const dashOffset = circumference * (1 - percentage)
  const fontSize = Math.max(9, size * 0.55)

  return (
    <div
      role="meter"
      aria-valuenow={count}
      aria-valuemax={safeMax}
      aria-label={`${Math.abs(count)} characters ${count >= 0 ? 'remaining' : 'over limit'}`}
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
          fontFamily:
            "var(--font-family-satoshi), -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
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
