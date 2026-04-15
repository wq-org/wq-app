'use client'

import { useContext } from 'react'

import { StepItemContext, StepperContext } from './stepper-context'

export function useStepper() {
  const context = useContext(StepperContext)
  if (!context) throw new Error('useStepper must be used within a Stepper')
  return context
}

export function useStepItem() {
  const context = useContext(StepItemContext)
  if (!context) throw new Error('useStepItem must be used within a StepperItem')
  return context
}
