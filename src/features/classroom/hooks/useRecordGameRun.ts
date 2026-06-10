import { useCallback, useState } from 'react'

import { recordClassroomGameRun } from '../api/classroomGamesApi'
import type { RecordClassroomGameRunInput } from '../types/classroom-game.types'

export function useRecordGameRun() {
  const [isSaving, setIsSaving] = useState(false)
  const [savedRunId, setSavedRunId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const saveRun = useCallback(
    async (input: RecordClassroomGameRunInput): Promise<string | null> => {
      setIsSaving(true)
      setError(null)

      try {
        const runId = await recordClassroomGameRun(input)
        setSavedRunId(runId)
        return runId
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to save game run')
        return null
      } finally {
        setIsSaving(false)
      }
    },
    [],
  )

  return { saveRun, isSaving, savedRunId, error }
}
