import { Calendar } from '@/components/ui/calendar'

import type { ComponentProps } from 'react'

type SingleCalendarProps = ComponentProps<typeof Calendar> & {
  initialFocus?: boolean
}

function SingleCalendar({ initialFocus, ...props }: SingleCalendarProps) {
  void initialFocus

  return <Calendar {...props} />
}

export { SingleCalendar }
