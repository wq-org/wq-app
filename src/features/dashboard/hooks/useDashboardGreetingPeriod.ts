import { useEffect, useState } from 'react'

export type DashboardGreetingPeriod = 'morning' | 'midday' | 'evening'

export function getDashboardGreetingPeriod(date: Date): DashboardGreetingPeriod {
  const hour = date.getHours()

  if (hour < 11) return 'morning'
  if (hour < 17) return 'midday'
  return 'evening'
}

export function useDashboardGreetingPeriod(): DashboardGreetingPeriod {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const updateNow = () => setNow(new Date())
    const msUntilNextMinute = 60_000 - (Date.now() % 60_000)
    let intervalId: number | null = null

    const timeoutId = window.setTimeout(() => {
      updateNow()
      intervalId = window.setInterval(updateNow, 60_000)
    }, msUntilNextMinute)

    return () => {
      window.clearTimeout(timeoutId)
      if (intervalId !== null) window.clearInterval(intervalId)
    }
  }, [])

  return getDashboardGreetingPeriod(now)
}
