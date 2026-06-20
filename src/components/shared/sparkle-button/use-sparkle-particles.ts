import { useMemo } from 'react'

export type SparkleParticleStyle = {
  '--x': number
  '--y': number
  '--duration': number
  '--delay': number
  '--alpha': number
  '--origin-x': string
  '--origin-y': string
  '--size': number
}

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min)

export function useSparkleParticles(count: number): SparkleParticleStyle[] {
  return useMemo(
    () =>
      Array.from({ length: count }, () => ({
        '--x': random(20, 80),
        '--y': random(20, 80),
        '--duration': random(6, 20),
        '--delay': random(1, 10),
        '--alpha': random(40, 90) / 100,
        '--origin-x': Math.random() > 0.5 ? `${random(300, 800) * -1}%` : `${random(300, 800)}%`,
        '--origin-y': Math.random() > 0.5 ? `${random(300, 800) * -1}%` : `${random(300, 800)}%`,
        '--size': random(40, 90) / 100,
      })),
    [count],
  )
}
