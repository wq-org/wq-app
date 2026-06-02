import { DateInput, DateSegment, TimeField } from 'react-aria-components'

import { cn } from '@/lib/utils'

import type { Ref } from 'react'
import type { TimeFieldProps, TimeValue } from 'react-aria-components'

export type TimeInputValue = {
  hour: number
  minute: number
}

export type TimeInputProps = Omit<
  TimeFieldProps<TimeValue>,
  'isDisabled' | 'isInvalid' | 'value' | 'onChange'
> & {
  ref?: Ref<HTMLDivElement>
  value?: TimeInputValue | null
  onChange?: (value: TimeInputValue | null) => void
  dateInputClassName?: string
  segmentClassName?: string
  disabled?: boolean
  'data-invalid'?: boolean
}

export function TimeInput({
  ref,
  className,
  dateInputClassName,
  segmentClassName,
  disabled,
  'data-invalid': dataInvalid,
  value,
  onChange,
  ...props
}: TimeInputProps) {
  return (
    <TimeField
      ref={ref}
      className={cn('relative', className)}
      isDisabled={disabled}
      isInvalid={dataInvalid}
      value={value as TimeValue | null | undefined}
      onChange={(nextValue) => onChange?.(nextValue)}
      {...props}
      aria-label="Time"
      shouldForceLeadingZeros
    >
      <DateInput
        className={cn(
          'peer inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-md border bg-background px-3 py-2 text-sm shadow-black',
          'data-[focus-within]:outline-none data-[focus-within]:ring-1 data-[focus-within]:ring-ring',
          'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
          dateInputClassName,
        )}
      >
        {(segment) => (
          <DateSegment
            segment={segment}
            className={cn(
              'inline rounded p-0.5 caret-transparent outline outline-0',
              'data-[focused]:bg-foreground/10 data-[focused]:text-foreground',
              'data-[placeholder]:text-muted-foreground',
              'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
              segmentClassName,
            )}
          />
        )}
      </DateInput>
    </TimeField>
  )
}
