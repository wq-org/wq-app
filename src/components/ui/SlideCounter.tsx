import { useEffect, useRef, useState } from 'react'

type SlideCounterProps = {
  value: number
  className?: string
}

function toDigits(value: number): string[] {
  return String(Math.round(value)).split('')
}

type DigitSlotProps = {
  digit: string
  prev: string
  animKey: number
  goingUp: boolean
}

function DigitSlot({ digit, prev, animKey, goingUp }: DigitSlotProps) {
  const [phase, setPhase] = useState<'idle' | 'animating'>('idle')
  const [displayed, setDisplayed] = useState(digit)
  const [incoming, setIncoming] = useState(digit)
  const prevAnimKey = useRef(animKey)

  useEffect(() => {
    if (animKey === prevAnimKey.current) return
    prevAnimKey.current = animKey

    if (digit === prev) return

    setIncoming(digit)
    setPhase('animating')

    const timeout = window.setTimeout(() => {
      setDisplayed(digit)
      setPhase('idle')
    }, 320)

    return () => window.clearTimeout(timeout)
  }, [animKey, digit, prev])

  const exitY = goingUp ? '-100%' : '100%'
  const enterY = goingUp ? '100%' : '-100%'

  return (
    <span
      className="relative inline-block overflow-hidden"
      style={{ width: '0.62em', lineHeight: 1 }}
    >
      <span
        key={`out-${animKey}`}
        className="block"
        style={{
          transform: phase === 'animating' ? `translateY(${exitY})` : 'translateY(0)',
          transition:
            phase === 'animating' ? 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          willChange: 'transform',
        }}
      >
        {displayed}
      </span>

      {phase === 'animating' ? (
        <span
          key={`in-${animKey}`}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: phase === 'animating' ? 'translateY(0)' : `translateY(${enterY})`,
            animation: `slideIn-${goingUp ? 'up' : 'down'} 0.28s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
            willChange: 'transform',
          }}
        >
          {incoming}
        </span>
      ) : null}
    </span>
  )
}

export function SlideCounter({ value, className = '' }: SlideCounterProps) {
  const [animKey, setAnimKey] = useState(0)
  const prevValue = useRef(value)
  const [prevDigits, setPrevDigits] = useState(() => toDigits(value))
  const [currDigits, setCurrDigits] = useState(() => toDigits(value))
  const goingUp = value >= prevValue.current

  useEffect(() => {
    if (value === prevValue.current) return

    const prev = toDigits(prevValue.current)
    const curr = toDigits(value)
    const maxLen = Math.max(prev.length, curr.length)
    const padded = (digits: string[]) => [...Array(maxLen - digits.length).fill('0'), ...digits]

    setPrevDigits(padded(prev))
    setCurrDigits(padded(curr))
    setAnimKey((current) => current + 1)
    prevValue.current = value
  }, [value])

  return (
    <>
      <style>{`
        @keyframes slideIn-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        @keyframes slideIn-down {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      <span
        className={`inline-flex items-center tabular-nums ${className}`}
        aria-live="polite"
        aria-atomic="true"
        aria-label={String(value)}
      >
        {currDigits.map((digit, index) => (
          <DigitSlot
            key={index}
            digit={digit}
            prev={prevDigits[index] ?? '0'}
            animKey={animKey}
            goingUp={goingUp}
          />
        ))}
      </span>
    </>
  )
}
