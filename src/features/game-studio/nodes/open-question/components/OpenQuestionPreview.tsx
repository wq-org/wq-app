'use client'

import { useCallback, useMemo, useState } from 'react'
import { Check, CircleQuestionMark, HandHelping } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  AiPromptBadgeList,
  aiPromptBadgeListEnterAnimation,
  type Ai02PromptSuggestion,
} from '@/components/shared/ai-components'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { useUser } from '@/contexts/user'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'

import type { GameOpenQuestionNodeData } from '../types/open-question.schema'
import { resolveGameOpenQuestionPoints } from '../utils'
import { OpenQuestionChatInput } from './OpenQuestionChatInput'
import {
  OpenQuestionPreviewChatHistory,
  type OpenQuestionPreviewChatMessage,
} from './OpenQuestionPreviewChatHistory'

export type OpenQuestionPreviewProps = {
  nodeId: string
  nodeData?: GameOpenQuestionNodeData
}

export function OpenQuestionPreview({ nodeId, nodeData }: OpenQuestionPreviewProps) {
  const { t } = useTranslation('features.gameStudio')
  const { profile } = useUser()
  const { url: userAvatarUrl } = useAvatarUrl(profile?.avatar_url ?? null)
  const pin = useMemo(() => nodeData ?? {}, [nodeData])
  const maxScore = resolveGameOpenQuestionPoints(pin.points)

  const title = pin.title?.trim() || pin.label?.trim() || ''
  const showTitle = title.length > 0

  const [composerValue, setComposerValue] = useState('')
  const [previewMessages, setPreviewMessages] = useState<OpenQuestionPreviewChatMessage[]>([])
  const earnedScore = 0

  const avatarFallback =
    profile?.display_name?.trim().charAt(0).toUpperCase() ??
    profile?.username?.trim().charAt(0).toUpperCase() ??
    profile?.email?.trim().charAt(0).toUpperCase() ??
    'U'

  const submitAnswerPrompt = t('openQuestionGamePreview.submitAnswerPrompt')
  const hintPrompt = t('openQuestionGamePreview.hintPrompt')
  const howToPlayPrompt = t('openQuestionGamePreview.howToPlayPrompt')

  const howToPlayResponse = t('openQuestionGamePreview.howToPlayResponse')

  const prompts = [
    {
      icon: Check,
      text: t('openQuestionGamePreview.badgeSubmitAnswer'),
      prompt: submitAnswerPrompt,
    },
    {
      icon: HandHelping,
      text: t('openQuestionGamePreview.badgeHint'),
      prompt: hintPrompt,
      disabled: true,
    },
    {
      icon: CircleQuestionMark,
      text: t('openQuestionGamePreview.badgeHowToPlay'),
      prompt: howToPlayPrompt,
    },
  ] as const satisfies readonly Ai02PromptSuggestion[]

  const appendMessage = useCallback((message: OpenQuestionPreviewChatMessage) => {
    setPreviewMessages((prev) => [...prev, message])
  }, [])

  const handlePromptClick = useCallback(
    (message: string) => {
      if (message === submitAnswerPrompt) {
        appendMessage({
          id: `${nodeId}-submit-prompt-${Date.now()}`,
          direction: 'sending',
          text: submitAnswerPrompt,
        })
        return
      }
      if (message === howToPlayPrompt) {
        appendMessage({
          id: `${nodeId}-how-to-play-prompt-${Date.now()}`,
          direction: 'sending',
          text: howToPlayPrompt,
        })
        appendMessage({
          id: `${nodeId}-how-to-play-reply-${Date.now()}`,
          direction: 'receiving',
          text: howToPlayResponse,
        })
      }
    },
    [appendMessage, howToPlayPrompt, howToPlayResponse, nodeId, submitAnswerPrompt],
  )

  const handleComposerSubmit = useCallback(
    (text: string) => {
      appendMessage({
        id: `${nodeId}-answer-${Date.now()}`,
        direction: 'sending',
        text,
      })
    },
    [appendMessage, nodeId],
  )

  return (
    <div className="flex h-full flex-col gap-3">
      <Text
        as="p"
        variant="small"
        color="orange"
        className="shrink-0"
      >
        {t('openQuestionGamePreview.previewNotice')}
      </Text>

      <OpenQuestionPreviewChatHistory
        nodeId={nodeId}
        title={title}
        showTitle={showTitle}
        previewMessages={previewMessages}
        incomingAvatarUrl={userAvatarUrl ?? undefined}
        incomingAvatarFallback={avatarFallback}
        incomingBubbleVariant="default"
        receivingBubbleVariant="orange"
        className="min-h-0 flex-1"
      />

      <AiPromptBadgeList
        prompts={prompts}
        onPromptClick={handlePromptClick}
      />

      <OpenQuestionChatInput
        className={cn('shrink-0', aiPromptBadgeListEnterAnimation)}
        score={earnedScore}
        maxScore={maxScore}
        placeholder={t('openQuestionGamePreview.composerPlaceholder')}
        value={composerValue}
        onValueChange={setComposerValue}
        onSubmit={handleComposerSubmit}
      />
    </div>
  )
}
