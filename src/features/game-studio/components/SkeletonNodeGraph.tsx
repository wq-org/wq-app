import { cn } from '@/lib/utils'

interface SkeletonNodeGraphProps {
  className?: string
  title?: string
}

export default function SkeletonNodeGraph({
  className,
  title = 'Flowchart skeleton',
}: SkeletonNodeGraphProps) {
  return (
    <div className={cn('bg-zinc-100', className)}>
      <svg
        viewBox="0 0 1200 450"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={title}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter
            id="softShadow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feDropShadow
              dx="0"
              dy="8"
              stdDeviation="10"
              floodColor="rgba(15,23,42,0.08)"
              floodOpacity="1"
            />
          </filter>
        </defs>

        <g
          fill="none"
          stroke="#6b7280"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.75"
        >
          <path d="M 180 250 L 220 250 Q 240 250 240 230 L 240 135 Q 240 115 260 115 L 350 115" />
          <path d="M 515 135 L 590 135 Q 610 135 610 155 L 610 215 Q 610 235 590 235 L 470 235" />
          <path d="M 560 235 L 620 235 Q 640 235 640 215 L 640 170 Q 640 150 660 150 L 760 150" />
          <path d="M 925 150 L 995 150 Q 1015 150 1015 130 L 1015 90 Q 1015 70 1035 70 L 1060 70" />
          <path d="M 560 235 L 620 235 Q 640 235 640 255 L 640 325 Q 640 345 660 345 L 760 345" />
          <path d="M 925 345 L 980 345 Q 1000 345 1000 325 L 1000 285 Q 1000 265 1020 265 L 1060 265" />
        </g>

        <g fill="#22c55e">
          <circle
            cx="180"
            cy="250"
            r="4.5"
          />
          <circle
            cx="350"
            cy="115"
            r="4.5"
          />
          <circle
            cx="515"
            cy="135"
            r="4.5"
          />
          <circle
            cx="470"
            cy="235"
            r="4.5"
          />
          <circle
            cx="560"
            cy="235"
            r="4.5"
          />
          <circle
            cx="760"
            cy="150"
            r="4.5"
          />
          <circle
            cx="925"
            cy="150"
            r="4.5"
          />
          <circle
            cx="1060"
            cy="70"
            r="4.5"
          />
          <circle
            cx="760"
            cy="345"
            r="4.5"
          />
          <circle
            cx="925"
            cy="345"
            r="4.5"
          />
          <circle
            cx="1060"
            cy="265"
            r="4.5"
          />
        </g>

        <g
          fill="#fff"
          stroke="#e5e7eb"
          strokeWidth="1"
          filter="url(#softShadow)"
        >
          <rect
            x="50"
            y="220"
            rx="26"
            ry="26"
            width="170"
            height="60"
          />
          <rect
            x="370"
            y="101"
            rx="14"
            ry="14"
            width="32"
            height="32"
          />

          <rect
            x="350"
            y="85"
            rx="26"
            ry="26"
            width="220"
            height="60"
          />
          <rect
            x="70"
            y="236"
            rx="14"
            ry="14"
            width="32"
            height="32"
          />

          <rect
            x="380"
            y="205"
            rx="26"
            ry="26"
            width="260"
            height="60"
          />
          <rect
            x="400"
            y="221"
            rx="14"
            ry="14"
            width="32"
            height="32"
          />

          <rect
            x="760"
            y="120"
            rx="26"
            ry="26"
            width="220"
            height="60"
          />
          <rect
            x="780"
            y="136"
            rx="14"
            ry="14"
            width="32"
            height="32"
          />

          <rect
            x="1060"
            y="40"
            rx="26"
            ry="26"
            width="220"
            height="60"
          />
          <rect
            x="1080"
            y="56"
            rx="14"
            ry="14"
            width="32"
            height="32"
          />

          <rect
            x="760"
            y="315"
            rx="26"
            ry="26"
            width="220"
            height="60"
          />
          <rect
            x="780"
            y="331"
            rx="14"
            ry="14"
            width="32"
            height="32"
          />

          <rect
            x="1060"
            y="235"
            rx="26"
            ry="26"
            width="220"
            height="60"
          />
          <rect
            x="1080"
            y="251"
            rx="14"
            ry="14"
            width="32"
            height="32"
          />
        </g>

        <g opacity="0.65">
          <rect
            x="115"
            y="240"
            rx="6"
            ry="6"
            width="80"
            height="10"
            fill="#d1d5db"
          />
          <rect
            x="115"
            y="256"
            rx="6"
            ry="6"
            width="110"
            height="10"
            fill="#e5e7eb"
          />

          <rect
            x="415"
            y="105"
            rx="6"
            ry="6"
            width="120"
            height="10"
            fill="#d1d5db"
          />
          <rect
            x="415"
            y="121"
            rx="6"
            ry="6"
            width="160"
            height="10"
            fill="#e5e7eb"
          />

          <rect
            x="412"
            y="233"
            width="8"
            height="8"
            rx="1"
            transform="rotate(45 416 237)"
            fill="#d1d5db"
          />
          <text
            x="450"
            y="244"
            fill="#6b7280"
            style={{
              font: '14px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
            }}
          >
            if / else
          </text>
          <rect
            x="450"
            y="252"
            rx="6"
            ry="6"
            width="120"
            height="8"
            fill="#e5e7eb"
          />

          <rect
            x="825"
            y="140"
            rx="6"
            ry="6"
            width="120"
            height="10"
            fill="#d1d5db"
          />
          <rect
            x="825"
            y="156"
            rx="6"
            ry="6"
            width="160"
            height="10"
            fill="#e5e7eb"
          />

          <rect
            x="1125"
            y="60"
            rx="6"
            ry="6"
            width="120"
            height="10"
            fill="#d1d5db"
          />
          <rect
            x="1125"
            y="76"
            rx="6"
            ry="6"
            width="160"
            height="10"
            fill="#e5e7eb"
          />

          <rect
            x="825"
            y="335"
            rx="6"
            ry="6"
            width="120"
            height="10"
            fill="#d1d5db"
          />
          <rect
            x="825"
            y="351"
            rx="6"
            ry="6"
            width="160"
            height="10"
            fill="#e5e7eb"
          />

          <rect
            x="1125"
            y="255"
            rx="6"
            ry="6"
            width="120"
            height="10"
            fill="#d1d5db"
          />
          <rect
            x="1125"
            y="271"
            rx="6"
            ry="6"
            width="160"
            height="10"
            fill="#e5e7eb"
          />
        </g>
      </svg>
    </div>
  )
}
