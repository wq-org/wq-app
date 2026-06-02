import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect, useRef } from 'react'

import { refreshCloudImagesInEditor } from '../utils/refreshCloudImagesInEditor'

type LexicalCloudImageHydrationPluginProps = {
  /** When false, skip refresh (e.g. parent still loading initial content). */
  enabled: boolean
  /** Bumps when persisted content is applied so images re-resolve after hydrate. */
  hydrationGeneration: number
  /** Called after image nodes are refreshed (e.g. persist backfilled cloud refs to parent). */
  onAfterRefresh?: () => void
}

/**
 * After editor content is hydrated from JSON, refresh image nodes from cloud storage
 * so expired signed URLs in `src` are replaced using durable `filepath` / `cloudFileId`.
 */
export function LexicalCloudImageHydrationPlugin({
  enabled,
  hydrationGeneration,
  onAfterRefresh,
}: LexicalCloudImageHydrationPluginProps): null {
  const [editor] = useLexicalComposerContext()
  const lastGenerationRef = useRef(-1)

  useEffect(() => {
    if (!enabled || hydrationGeneration < 0) return
    if (lastGenerationRef.current === hydrationGeneration) return
    lastGenerationRef.current = hydrationGeneration

    void refreshCloudImagesInEditor(editor)
      .then(() => {
        onAfterRefresh?.()
      })
      .catch((error) => {
        console.error('[LexicalCloudImageHydrationPlugin] refresh failed', error)
      })
  }, [editor, enabled, hydrationGeneration, onAfterRefresh])

  return null
}
