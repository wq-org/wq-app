import { GameNodeDialogShell } from '../../components/GameNodeDialogShell'
import { GameLayout } from '../../components/GameDialogLayout'
import type { GameNodeDialogProps } from '../_registry/game-node-registry.types'
import { OpenQuestionEditor } from './OpenQuestionEditor'
import { OpenQuestionPreview } from './OpenQuestionPreview'
import { OpenQuestionSettings } from './OpenQuestionSettings'

export function GameOpenQuestionDialog({ nodeId, onClose, onDelete }: GameNodeDialogProps) {
  return (
    <GameNodeDialogShell
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title="Open question"
    >
      <GameLayout
        editorContent={<OpenQuestionEditor nodeId={nodeId} />}
        previewContent={<OpenQuestionPreview nodeId={nodeId} />}
        settingsContent={
          <OpenQuestionSettings
            nodeId={nodeId}
            onDelete={onDelete}
          />
        }
      />
    </GameNodeDialogShell>
  )
}
