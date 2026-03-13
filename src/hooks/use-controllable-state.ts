// hooks/use-controllable-state.ts
import { useCallback, useState } from 'react'

type UseControllableStateParams<T> = {
  value?: T
  defaultValue: T
  onChange?: (value: T) => void
}

export const useControllableState = <T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateParams<T>): [T, (next: T) => void] => {
  const [internalValue, setInternalValue] = useState<T>(defaultValue)
  const isControlled = value !== undefined
  const resolvedValue = isControlled ? value : internalValue

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternalValue(next)
      onChange?.(next)
    },
    [isControlled, onChange],
  )

  return [resolvedValue, setValue]
}
