import { GameNodeDialogShell } from '../../components/GameNodeDialogShell'
import { GameLayout } from '../../components/GameDialogLayout'
import { GameNodeBetaNotice } from '../../components/GameNodeBetaNotice'
import type { GameNodeDialogProps } from '../_registry/game-node-registry.types'

export function GameStartDialog(props: GameNodeDialogProps) {
  const { onClose } = props
  return (
    <GameNodeDialogShell
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title="Start"
    >
      <GameLayout
        tabsDisabled
        editorContent={<GameNodeBetaNotice nodeLabel="Start" />}
      />
    </GameNodeDialogShell>
  )
}
