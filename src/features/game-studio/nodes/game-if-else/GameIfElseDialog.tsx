import { useTranslation } from 'react-i18next'

import { GameNodeDialogShell } from '../../components/GameNodeDialogShell'
import { GameLayout } from '../../components/GameDialogLayout'
import { GameNodeBetaNotice } from '../../components/GameNodeBetaNotice'
import type { GameNodeDialogProps } from '../_registry/game-node-registry.types'
import type { GameIfElseNodeData } from './game-if-else.schema'
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
    >
      <GameLayout
        initialTab="settings"
        disabledTabIds={['editor', 'preview']}
        editorContent={<GameNodeBetaNotice nodeLabel={t('sidebar.logic.ifElse')} />}
        previewContent={null}
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
