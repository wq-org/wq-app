import { cn } from '@/lib/utils'
import React from 'react'

interface DotWaveLoaderProps {
  variant?: 'default' | 'gray' | 'white'
  size?: number // optional customization
}

const DotWaveLoader: React.FC<DotWaveLoaderProps> = ({ variant = 'default', size = 48 }) => {
  const colorClasses = {
    default: 'bg-black',
    gray: 'bg-gray-500',
    white: 'bg-white',
  }

  const dotClass = cn('rounded-full transition-colors duration-300', colorClasses[variant])

  return (
    <div
      className="flex items-end justify-between"
      style={{
        height: `${size * 0.5}px`,
        width: `${size}px`,
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={dotClass}
          style={{
            width: `${size * 0.17}px`,
            height: `${size * 0.17}px`,
            animation: `jump 1s ease-in-out calc(-${i * 0.15}s) infinite`,
          }}
        ></div>
      ))}

      <style>{`
        @keyframes jump {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-200%); }
        }
      `}</style>
    </div>
  )
}

export default DotWaveLoader
