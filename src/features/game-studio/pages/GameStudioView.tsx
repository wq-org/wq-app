import { AppWrapper } from '@/components/layout'
import GameEditorCanvas from '../components/GameEditorCanvas'

export default function GameStudioView() {
  return (
    <AppWrapper
      role="teacher"
      commandBarContext="game-studio"
      className="flex flex-col h-screen"
    >
      <div className="flex-1 w-full">
        <GameEditorCanvas />
      </div>
    </AppWrapper>
  )
}
