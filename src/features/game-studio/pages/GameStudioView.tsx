import AppWrapper from '@/components/layout/AppWrapper'
import GameEditorCanvas from '../components/GameEditorCanvas'

export default function GameStudioView() {
  return (
    <AppWrapper
      role="teacher"
      commandPaletteRole="game-studio"
      className="flex flex-col h-screen"
    >
      <div className="flex-1 w-full">
        <GameEditorCanvas />
      </div>
    </AppWrapper>
  )
}
