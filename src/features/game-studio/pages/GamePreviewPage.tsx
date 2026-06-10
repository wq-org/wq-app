'use client'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import type { Edge, Node } from '@xyflow/react'

import { Text } from '@/components/ui/text'

import { GamePreviewPlayFlow } from '../components/GamePreviewPlayFlow'
import { computePlayPreviewSessionMaxScore } from '../utils/playPreviewSessionScore'

type PreviewLocationState = {
  nodes?: Node[]
  edges?: Edge[]
}

/** Dedicated full-page game preview — in-memory play session, no persistence. */
export function GamePreviewPage() {
  const { t } = useTranslation('features.gameStudio')
  const location = useLocation()
  const state = (location.state ?? {}) as PreviewLocationState
  const nodes = state.nodes ?? []
  const edges = state.edges ?? []
  const sessionMaxScore = useMemo(() => computePlayPreviewSessionMaxScore(nodes), [nodes])

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden pt-4 pb-2">
      <Text
        as="h1"
        variant="h3"
        className="w-full shrink-0 pb-3 text-center text-lg font-semibold text-foreground"
      >
        {t('previewDrawer.title')}
      </Text>

      <div className="flex min-h-0 flex-1 flex-col">
        <GamePreviewPlayFlow
          nodes={nodes}
          edges={edges}
          sessionMaxScore={sessionMaxScore}
        />
      </div>
    </div>
  )
}
