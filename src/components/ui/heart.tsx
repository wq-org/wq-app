import { useState, useRef, useCallback } from 'react'

interface FloatingHeart {
  id: number
  x: number
  y: number
  scale: number
  delay: number
}

const VIOLET = 'oklch(0.76 0.18 305)'
const VIOLET_STROKE = 'oklch(0.60 0.20 305)'
const VIOLET_LIGHT = 'oklch(0.86 0.12 305)'

const HEART_PATH =
  'M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.732 3.195 2 5.5 2c1.463 0 3.055.826 4.26 2.216C10.855 5.323 11.51 6 12 6s1.145-.677 2.24-1.784C15.445 2.826 17.037 2 18.5 2 20.805 2 23 3.732 23 7.191c0 4.105-5.37 8.863-11 14.402z'

export default function Heart() {
  const [isLiked, setIsLiked] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([])
  const counterRef = useRef(0)

  const spawnFloatingHearts = useCallback(() => {
    const count = 7
    const newHearts: FloatingHeart[] = Array.from({ length: count }, (_, i) => ({
      id: counterRef.current++,
      x: (Math.random() - 0.5) * 100,
      y: -(Math.random() * 70 + 30),
      scale: Math.random() * 0.5 + 0.3,
      delay: i * 40,
    }))
    setFloatingHearts((prev) => [...prev, ...newHearts])
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => !newHearts.find((n) => n.id === h.id)))
    }, 900)
  }, [])

  const handleClick = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setIsLiked((prev) => !prev)
    spawnFloatingHearts()
    setTimeout(() => setIsAnimating(false), 450)
  }, [isAnimating, spawnFloatingHearts])

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .scene {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #ffffff;
        }

        .heart-btn {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          padding: 28px;
          outline: none;
          -webkit-tap-highlight-color: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s ease;
        }

        .heart-btn:hover {
          background: ${VIOLET_LIGHT}22;
        }

        .heart-btn:focus-visible {
          box-shadow: 0 0 0 3px ${VIOLET_LIGHT};
        }

        .heart-svg {
          display: block;
          overflow: visible;
        }

        .heart-path {
          transition: fill 0.22s ease, stroke 0.22s ease;
        }

        .heart-btn.bounce .heart-svg {
          animation: heartBounce 0.42s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards;
        }

        @keyframes heartBounce {
          0%   { transform: scale(1); }
          18%  { transform: scale(0.82); }
          48%  { transform: scale(1.32); }
          72%  { transform: scale(0.96); }
          100% { transform: scale(1); }
        }

        .ripple {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid ${VIOLET};
          pointer-events: none;
          animation: rippleOut 0.48s ease-out forwards;
        }

        @keyframes rippleOut {
          0%   { transform: scale(0.5); opacity: 0.9; }
          100% { transform: scale(2.4); opacity: 0; }
        }

        .float-heart {
          position: absolute;
          top: 50%;
          left: 50%;
          pointer-events: none;
          animation: floatUp 0.82s ease-out forwards;
          will-change: transform, opacity;
        }

        @keyframes floatUp {
          0% {
            transform: translate(-50%, -50%) scale(var(--fs));
            opacity: 1;
          }
          70% { opacity: 0.7; }
          100% {
            transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(calc(var(--fs) * 0.4));
            opacity: 0;
          }
        }
      `}</style>

      <div className="scene">
        <button
          className={`heart-btn ${isAnimating ? 'bounce' : ''}`}
          onClick={handleClick}
          aria-label={isLiked ? 'Unlike' : 'Like'}
          aria-pressed={isLiked}
        >
          {isAnimating && <span className="ripple" />}

          {floatingHearts.map((h) => (
            <span
              key={h.id}
              className="float-heart"
              style={
                {
                  '--dx': `${h.x}px`,
                  '--dy': `${h.y}px`,
                  '--fs': h.scale,
                  animationDelay: `${h.delay}ms`,
                } as React.CSSProperties
              }
            >
              <svg
                width="20"
                height="18"
                viewBox="0 0 24 22"
                fill="none"
              >
                <path
                  d={HEART_PATH}
                  fill={VIOLET}
                />
              </svg>
            </span>
          ))}

          {/* Main heart — flat 2D */}
          <svg
            className="heart-svg"
            width="80"
            height="74"
            viewBox="0 0 24 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className="heart-path"
              d={HEART_PATH}
              fill={isLiked ? VIOLET : 'none'}
              stroke={isLiked ? VIOLET_STROKE : '#d1d5db'}
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </>
  )
}
