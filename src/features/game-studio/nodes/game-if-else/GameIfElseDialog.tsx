import { useTranslation } from 'react-i18next'

import { GameNodeDialogShell } from '../../components/GameNodeDialogShell'
import { GameLayout } from '../../components/GameDialogLayout'
import type { GameNodeDialogProps } from '../_registry/game-node-registry.types'
import type { GameIfElseNodeData } from './game-if-else.schema'
import { GameIfElsePreview } from './GameIfElsePreview'
import { GameIfElseSettings } from './GameIfElseSettings'

export function GameIfElseDialog(props: GameNodeDialogProps) {
  const {
    nodeId,
    nodeData,
    onPatchNodeData,
    onClose,
    onDelete,
    onNavigateToNode,
    flowNodes = [],
    flowEdges = [],
  } = props
  const { t } = useTranslation('features.gameStudio')
  const ifElseNodeData = nodeData as GameIfElseNodeData

  return (
    <GameNodeDialogShell
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title={t('ifElseDialog.title')}
      description={t('ifElseDialog.description')}
    >
      <GameLayout
        hiddenTabIds={['editor']}
        initialTab="settings"
        previewContent={
          <GameIfElsePreview
            nodeId={nodeId}
            nodeData={ifElseNodeData}
            flowNodes={flowNodes}
            flowEdges={flowEdges}
          />
        }
        settingsContent={
          <GameIfElseSettings
            nodeId={nodeId}
            onDelete={onDelete}
            onClose={onClose}
            onNavigateToNode={onNavigateToNode}
            onPatchNodeData={onPatchNodeData}
            nodeData={ifElseNodeData}
            flowNodes={flowNodes}
            flowEdges={flowEdges}
          />
        }
      />
    </GameNodeDialogShell>
  )
}
