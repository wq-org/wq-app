import { useState } from 'react'
import { GameNodePointsContext } from '@/contexts/game-studio'
import { GameInformation } from '@/features/games/shared/GameInformation'
import { ImageTermMatchGame } from '../ImageTermMatchGame'

/**
 * Standalone page wrapper for Image Term Match game.
 * Fixes: use @/contexts/game-studio for GameNodePointsContext;
 * GameInformation only accepts title, description, onTitleChange, onDescriptionChange.
 */
export function ImageTermMatchGamePage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [points, setPoints] = useState(0)

  return (
    <GameNodePointsContext.Provider value={{ points, onPointsChange: setPoints }}>
      <div className="space-y-6">
        <GameInformation
          title={title}
          description={description}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
        />
        <ImageTermMatchGame />
      </div>
    </GameNodePointsContext.Provider>
  )
}
