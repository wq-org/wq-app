import { AppShell } from '@/components/layout'
import { GameEditorCanvas } from '../components/GameEditorCanvas'

export function GameStudioView() {
  return (
    <AppShell
      role="teacher"
      commandBarContext="game-studio"
      className="flex flex-col h-screen"
    >
      <div className="flex-1 w-full">
        <GameEditorCanvas />
      </div>
    </AppShell>
  )
}
