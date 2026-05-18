import { format, parseISO } from 'date-fns'
import { Calendar, Clock, Text, User } from 'lucide-react'

import { useCalendar } from '../../contexts/useCalendar'

import { Button } from '@/components/ui/button'
import { EditEventDialog } from './EditEventDialog'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import type { ReactNode } from 'react'
import type { IEvent } from '../../types/calendar.types'

type EventDetailsDialogProps = {
  event: IEvent
  children: ReactNode
}

export function EventDetailsDialog({ event, children }: EventDetailsDialogProps) {
  const { onEventDelete } = useCalendar()

  const startDate = parseISO(event.startDate)
  const endDate = parseISO(event.endDate)

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <User className="mt-1 size-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">Responsible</p>
              <p className="text-sm text-muted-foreground">{event.user.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="mt-1 size-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">Start Date</p>
              <p className="text-sm text-muted-foreground">
                {format(startDate, 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="mt-1 size-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">End Date</p>
              <p className="text-sm text-muted-foreground">
                {format(endDate, 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Text className="mt-1 size-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          {onEventDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => onEventDelete(event.id)}
            >
              Delete
            </Button>
          )}
          <EditEventDialog event={event}>
            <Button
              type="button"
              variant="outline"
            >
              Edit
            </Button>
          </EditEventDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
