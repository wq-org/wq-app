import { useState } from 'react'

import { createAndSendClassroomStudentInvite, useTeacherClassrooms } from '@/features/classroom'
import { useUser } from '@/contexts/user'

/**
 * Flow — classroom pre-supplied (from classroom panel button):
 *   email → result
 *
 * Flow — opened from the palette type selector (no classroomId):
 *   email → classroom → result
 */
export type InviteStudentStep = 'email' | 'classroom' | 'result'

export type InviteStudentResult =
  | { kind: 'success'; email: string }
  | { kind: 'error'; email: string; message: string }

export type ClassroomOption = { id: string; title: string }

export type UseCommandInviteStudentParams = {
  classroomId: string | undefined
  onRequestClose?: () => void
  onInvited?: () => void
}

export type UseCommandInviteStudentResult = {
  step: InviteStudentStep
  stepNumber: number
  totalSteps: number
  email: string
  setEmail: (value: string) => void
  isSubmitting: boolean
  result: InviteStudentResult | null
  canAdvanceFromEmail: boolean
  canSubmit: boolean
  resolvedClassroomId: string | null
  resolvedClassroomTitle: string | null
  classroomOptions: ClassroomOption[]
  classroomsLoading: boolean
  needsClassroomPicker: boolean
  advanceFromEmail: () => void
  selectClassroom: (id: string, title: string) => void
  handleSubmit: () => Promise<void>
  handleInviteAnother: () => void
  handleClose: () => void
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

export function useCommandInviteStudent({
  classroomId,
  onRequestClose,
  onInvited,
}: UseCommandInviteStudentParams): UseCommandInviteStudentResult {
  const { profile } = useUser()
  const institutionName = profile?.institution?.name ?? null

  const preSupplied = classroomId?.trim() ?? null
  const needsClassroomPicker = !preSupplied

  const { rows: classroomRows, loading: classroomsLoading } =
    useTeacherClassrooms(needsClassroomPicker)
  const classroomOptions: ClassroomOption[] = classroomRows.map((r) => ({
    id: r.id,
    title: r.title,
  }))

  const totalSteps = needsClassroomPicker ? 3 : 2

  const [step, setStep] = useState<InviteStudentStep>('email')
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null)
  const [selectedClassroomTitle, setSelectedClassroomTitle] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<InviteStudentResult | null>(null)

  const resolvedClassroomId = preSupplied ?? selectedClassroomId
  const resolvedClassroomTitle = preSupplied ? null : selectedClassroomTitle

  const canAdvanceFromEmail = isValidEmail(email)
  const canSubmit = Boolean(resolvedClassroomId) && isValidEmail(email) && !isSubmitting

  // 1-based step number for the progress bar
  const stepNumber: number = step === 'email' ? 1 : step === 'classroom' ? 2 : totalSteps

  function advanceFromEmail() {
    if (!canAdvanceFromEmail) return
    if (needsClassroomPicker) {
      setStep('classroom')
    } else {
      void doSend(email.trim())
    }
  }

  function selectClassroom(id: string, title: string) {
    setSelectedClassroomId(id)
    setSelectedClassroomTitle(title)
    void doSend(email.trim(), id)
  }

  async function doSend(trimmedEmail: string, classroomOverride?: string) {
    const cid = classroomOverride ?? resolvedClassroomId
    if (!cid) return

    setIsSubmitting(true)
    try {
      await createAndSendClassroomStudentInvite({
        classroomId: cid,
        email: trimmedEmail,
        institutionName,
      })
      setResult({ kind: 'success', email: trimmedEmail })
      onInvited?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send invite'
      setResult({ kind: 'error', email: trimmedEmail, message })
    } finally {
      setIsSubmitting(false)
      setStep('result')
    }
  }

  async function handleSubmit() {
    if (!canSubmit) return
    await doSend(email.trim())
  }

  function handleInviteAnother() {
    setEmail('')
    setResult(null)
    setSelectedClassroomId(null)
    setSelectedClassroomTitle(null)
    setStep('email')
  }

  function handleClose() {
    handleInviteAnother()
    onRequestClose?.()
  }

  return {
    step,
    stepNumber,
    totalSteps,
    email,
    setEmail,
    isSubmitting,
    result,
    canAdvanceFromEmail,
    canSubmit,
    resolvedClassroomId,
    resolvedClassroomTitle,
    classroomOptions,
    classroomsLoading,
    needsClassroomPicker,
    advanceFromEmail,
    selectClassroom,
    handleSubmit,
    handleInviteAnother,
    handleClose,
  }
}
