import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { Text } from '@/components/ui/text'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import ImageTermMatchGame from '@/features/games/image-term-match/ImageTermMatchGame'
import ImagePinMarkGame from '../../games/image-pin-mark/ImagePinMarkGame'
import ParagraphLineSelectGame from '@/features/games/paragraph-line-select/ParagraphLineSelectGame'
import type { GameNodeDialogProps } from '../types/game-studio.types'
import { GameNodeLayout } from './GameNodeLayout'
import { GameEditorProvider } from '@/contexts/game-studio'
import { logColor } from '@/lib/utils'
import { toast } from 'sonner'
import Spinner from '@/components/ui/spinner'
import { useTranslation } from 'react-i18next'

// Map node types to game components and titles (components may accept initialData)
const nodeTypeToGame: Record<
  string,
  { component: React.ComponentType<{ initialData?: unknown }>; titleKey: string }
> = {
  gameParagraph: {
    component: ParagraphLineSelectGame,
    titleKey: 'gameNodeDialog.gameTitles.paragraphLineSelect',
  },
  gameImageTerms: {
    component: ImageTermMatchGame,
    titleKey: 'gameNodeDialog.gameTitles.imageTermMatch',
  },
  gameImagePin: {
    component: ImagePinMarkGame,
    titleKey: 'gameNodeDialog.gameTitles.imagePinMark',
  },
}

export default function GameNodeDialog({
  open,
  onOpenChange,
  nodeType,
  nodeId,
  initialData,
  onSave,
  onDelete,
  onUploadImage,
  onRemoveImage,
}: GameNodeDialogProps) {
  const { t } = useTranslation('features.gameStudio')
  const [points, setPoints] = useState(100)
  const [saving, setSaving] = useState(false)
  const [isRendering, setIsRendering] = useState(false)
  const getGameDataRef = useRef<(() => unknown) | null>(null)

  const providerKey = open ? `${nodeType ?? 'node'}-${nodeId ?? 'none'}` : 'closed'

  const handleRenderReady = useCallback(() => {
    setIsRendering(false)
  }, [])

  useEffect(() => {
    if (!open) {
      setPoints(100)
    }
  }, [open])

  useLayoutEffect(() => {
    if (open) {
      setIsRendering(true)
    } else {
      setIsRendering(false)
    }
  }, [open, nodeId, nodeType])

  if (!nodeType) return null

  const gameConfig = nodeTypeToGame[nodeType]
  if (!gameConfig) return null

  const GameComponent = gameConfig.component

  const SAVE_ERROR_MESSAGE = t('gameNodeDialog.saveError')

  const handleSave = async () => {
    try {
      const gameData = getGameDataRef.current?.()

      if (nodeType === 'gameParagraph' && gameData && typeof gameData === 'object') {
        const data = gameData as {
          title?: string
          description?: string
          paragraphText?: string
          sentenceConfigs?: Array<{
            sentenceNumber: number
            sentenceText: string
            options: Array<{
              id: string
              text: string
              isCorrect: boolean
              points?: number
              pointsWhenWrong?: number
            }>
            pointsWhenCorrect?: number
            feedbackWhenCorrect?: string
            feedbackWhenWrong?: string
          }>
          selectedAnswers?: Array<{ sentenceNumber: number; optionId: string }>
        }

        const gamesPayload = {
          title: data.title ?? '',
          description: data.description ?? '',
          game_type: 'paragraph_line_select',
          game_config: {
            paragraphText: data.paragraphText ?? '',
            questions: (data.sentenceConfigs ?? []).map((q) => ({
              sentenceNumber: q.sentenceNumber,
              sentenceText: q.sentenceText,
              options: q.options.map((o) => ({
                id: o.id,
                text: o.text,
                isCorrect: o.isCorrect,
                points: o.points,
                pointsWhenWrong: o.pointsWhenWrong,
              })),
              pointsWhenCorrect: q.pointsWhenCorrect,
              feedbackWhenCorrect: q.feedbackWhenCorrect,
              feedbackWhenWrong: q.feedbackWhenWrong,
            })),
          },
          // Placeholders for DB fields
          id: '(uuid)',
          teacher_id: '(uuid)',
          topic_id: '(uuid)',
          status: 'draft',
          version: 1,
        }

        const gameSessionsPayload = {
          game_id: '(uuid)',
          student_id: '(uuid)',
          score: 0,
          completed: false,
          session_data: {
            selectedAnswers: data.selectedAnswers ?? [],
          },
          progress_data: null,
        }

        logColor('games', gamesPayload, 'db')
        logColor('game_sessions', gameSessionsPayload, 'react')
        onSave?.({ points, paragraphGameData: gameData }, nodeId)
        onOpenChange(false)
        return
      }

      if (nodeType === 'gameImageTerms' && gameData && typeof gameData === 'object') {
        const data = gameData as {
          imageFile?: File | null
          imagePreview?: string | null
          [key: string]: unknown
        }
        let imageTermGameData = { ...data }
        if (data.imageFile && nodeId && onUploadImage) {
          setSaving(true)
          try {
            const result = await onUploadImage(data.imageFile, nodeId)
            if (!result) {
              toast.error(SAVE_ERROR_MESSAGE)
              return
            }
            imageTermGameData = {
              ...data,
              imagePreview: result.publicUrl,
              filepath: result.path,
            }
            delete imageTermGameData.imageFile
          } catch {
            toast.error(SAVE_ERROR_MESSAGE)
            return
          } finally {
            setSaving(false)
          }
        } else if (data.imageFile) {
          delete imageTermGameData.imageFile
        }
        onSave?.({ points, imageTermGameData }, nodeId)
        onOpenChange(false)
        return
      }

      if (nodeType === 'gameImagePin' && gameData && typeof gameData === 'object') {
        const data = gameData as {
          imageFile?: File | null
          imagePreview?: string | null
          [key: string]: unknown
        }
        let imagePinGameData = { ...data }
        if (data.imageFile && nodeId && onUploadImage) {
          setSaving(true)
          try {
            const result = await onUploadImage(data.imageFile, nodeId)
            if (!result) {
              toast.error(SAVE_ERROR_MESSAGE)
              return
            }
            imagePinGameData = {
              ...data,
              imagePreview: result.publicUrl,
              filepath: result.path,
            }
            delete imagePinGameData.imageFile
          } catch {
            toast.error(SAVE_ERROR_MESSAGE)
            return
          } finally {
            setSaving(false)
          }
        } else if (data.imageFile) {
          delete imagePinGameData.imageFile
        }
        onSave?.({ points, imagePinGameData }, nodeId)
        onOpenChange(false)
        return
      }

      onSave?.({ points }, nodeId)
      onOpenChange(false)
    } catch {
      toast.error(SAVE_ERROR_MESSAGE)
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setPoints(100)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[90vw]! max-w-[1080px]!">
        <DialogHeader>
          <DialogTitle>{t(gameConfig.titleKey)}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('gameNodeDialog.description', { gameTitle: t(gameConfig.titleKey) })}
          </DialogDescription>
        </DialogHeader>
        <GameEditorProvider
          key={providerKey}
          getGameDataRef={getGameDataRef}
          onReady={handleRenderReady}
        >
          <GameNodeLayout
            key={open ? (nodeId ?? 'none') : 'closed'}
            nodeId={nodeId}
            gameComponent={GameComponent}
            initialData={initialData}
            points={points}
            onPointsChange={setPoints}
            hideSettingsTab={true}
            onDelete={onDelete}
            onRemoveImage={onRemoveImage}
          />
        </GameEditorProvider>
        {isRendering && (
          <div className="absolute inset-0 z-20 flex items-center justify-center gap-3 bg-background/80">
            <Spinner
              variant="gray"
              size="md"
              speed={1750}
            />
            <Text
              as="p"
              variant="body"
              className="text-sm text-gray-500"
            >
              {t('gameNodeDialog.loading')}
            </Text>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="darkblue"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
