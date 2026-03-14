import { useMemo, useRef, useState } from 'react'
import type { SettingsFormValues } from '../types/settings.types'

export function useSettingsProfileForm(initialValues: SettingsFormValues) {
  const initialValuesRef = useRef(initialValues)
  const [values, setValues] = useState<SettingsFormValues>(initialValues)

  const setField = <K extends keyof SettingsFormValues>(field: K, value: SettingsFormValues[K]) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const isDirty = useMemo(
    () =>
      values.displayName !== initialValuesRef.current.displayName ||
      values.linkedIn !== initialValuesRef.current.linkedIn ||
      values.aboutMe !== initialValuesRef.current.aboutMe,
    [values],
  )

  const reset = () => {
    setValues(initialValuesRef.current)
  }

  return {
    values,
    setField,
    isDirty,
    reset,
  }
}
