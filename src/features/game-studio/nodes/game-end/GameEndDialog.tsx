import { GameNodeDialogShell } from '../../components/GameNodeDialogShell'
import { GameLayout } from '../../components/GameDialogLayout'
import { GameNodeBetaNotice } from '../../components/GameNodeBetaNotice'
import type { GameNodeDialogProps } from '../_registry/game-node-registry.types'

export function GameEndDialog(props: GameNodeDialogProps) {
  const { onClose } = props
  return (
    <GameNodeDialogShell
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title="End"
    >
      <GameLayout
        tabsDisabled
        editorContent={<GameNodeBetaNotice nodeLabel="End" />}
      />
    </GameNodeDialogShell>
  )
}
