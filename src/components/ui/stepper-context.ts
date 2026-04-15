import { createContext, type ReactElement } from 'react'

export type StepperOrientation = 'horizontal' | 'vertical'
export type StepState = 'active' | 'completed' | 'inactive' | 'loading'
export type StepIndicators = {
  active?: React.ReactNode
  completed?: React.ReactNode
  inactive?: React.ReactNode
  loading?: React.ReactNode
}

export type StepperContextValue = {
  activeStep: number
  setActiveStep: (step: number) => void
  stepsCount: number
  orientation: StepperOrientation
  registerTrigger: (node: HTMLButtonElement | null) => void
  triggerNodes: HTMLButtonElement[]
  focusNext: (currentIdx: number) => void
  focusPrev: (currentIdx: number) => void
  focusFirst: () => void
  focusLast: () => void
  indicators: StepIndicators
}

export type StepItemContextValue = {
  step: number
  state: StepState
  isDisabled: boolean
  isLoading: boolean
}

export const StepperContext = createContext<StepperContextValue | undefined>(undefined)
export const StepItemContext = createContext<StepItemContextValue | undefined>(undefined)

export type StepperChildElement = ReactElement
