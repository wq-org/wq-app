interface CircularDotPatternProps {
  number?: number
}

export function CircularDotPattern({ number = 1 }: CircularDotPatternProps) {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className="text-[20px] font-semibold leading-none"
        style={{
          background:
            'linear-gradient(to right, #00A6FB, #7B68EE, #9D4EDD, #E056FD, #FF6FB5, #FF8C7F, #FFA45B)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {number}
      </div>
    </div>
  )
}
