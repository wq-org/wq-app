'use client'

import { useState } from 'react'
import { MessageCircleOff, Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { ChatImageList } from '@/components/shared/chat/ChatImageList'
import { ChatBubbleLexicalContent } from '@/components/shared/chat/ChatBubbleLexicalContent'
import {
  chatBubbleEnterAnimation,
  chatBubbleVariants,
  getChatBubbleTailClass,
  resolveDotWaveLoaderVariant,
} from '@/components/shared/chat/chat-bubble-variants'
import {
  isMathChatMessageBubble,
  isLexicalChatMessageBubble,
  type ChatMessageBubbleProps,
} from '@/components/shared/chat/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import DotWaveLoader from '@/components/ui/dot-wave-loader'
import { cn } from '@/lib/utils'

export type SendingChatMessageBubbleProps = ChatMessageBubbleProps & {
  /** Transparent fill + dashed outline (e.g. message being edited in composer). */
  dashed?: boolean
  /** Shows edit/delete controls to the left of the bubble on hover/focus. */
  showHoverActions?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export function SendingChatMessageBubble(props: SendingChatMessageBubbleProps) {
  const { t } = useTranslation('common')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const {
    time,
    images,
    className,
    avatarUrl,
    avatarFallback = '/favicon.ico',
    hideAvatar = false,
    variant = 'dark',
    rounded = 'lg',
    status,
    messageId,
    textBold,
    dashed = false,
    showHoverActions = false,
    onEdit,
    onDelete,
  } = props

  const isLexical = isLexicalChatMessageBubble(props)
  const isMath = isMathChatMessageBubble(props)
  const text = isLexical || isMath ? '' : props.text
  const lexicalContent = isLexical ? props.lexicalContent : null
  const lexicalHydrationKey = isLexical ? props.lexicalHydrationKey : ''
  const mathContent = isMath ? props.mathContent : null

  const resolvedStatus = status ?? 'ready'
  const bubbleStateKey = isLexical
    ? `${lexicalHydrationKey}-${resolvedStatus}`
    : messageId != null
      ? `${messageId}-${resolvedStatus}`
      : `${text}-${time}-${resolvedStatus}`
  const showImages = Boolean(images?.length) && resolvedStatus !== 'loading'

  const canShowActions =
    showHoverActions &&
    resolvedStatus === 'ready' &&
    !isLexical &&
    !isMath &&
    (onEdit != null || onDelete != null)

  const handleConfirmDelete = () => {
    onDelete?.()
    setDeleteDialogOpen(false)
  }

  return (
    <>
      <div
        className={cn(
          'group/sending-bubble flex items-end justify-end gap-2',
          isLexical || isMath ? 'max-w-full w-full' : 'max-w-[88%]',
          className,
        )}
      >
        {canShowActions ? (
          <div
            className={cn(
              'mb-1 flex flex-col gap-0.5 opacity-0 transition-opacity',
              'group-hover/sending-bubble:opacity-100 group-focus-within/sending-bubble:opacity-100',
            )}
          >
            {onEdit ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                aria-label={t('chatBubble.editMessageAria')}
                onClick={onEdit}
              >
                <Pencil className="size-4" />
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-destructive hover:text-destructive"
                aria-label={t('chatBubble.deleteMessageAria')}
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="size-4" />
              </Button>
            ) : null}
          </div>
        ) : null}

        <div
          className={cn(
            'flex min-w-0 flex-col items-end',
            isLexical || isMath ? 'w-full max-w-full' : 'max-w-[78%]',
          )}
        >
          {showImages ? (
            <ChatImageList
              images={images}
              className="mb-2"
            />
          ) : null}
          <div
            key={bubbleStateKey}
            className={cn(
              chatBubbleVariants({ variant, rounded, dashed }),
              getChatBubbleTailClass('sending', rounded),
              chatBubbleEnterAnimation,
              (isLexical || isMath) && 'w-full max-w-full',
            )}
          >
            {resolvedStatus === 'loading' ? (
              <div className="flex min-h-9 items-center justify-center py-0.5 text-inherit">
                <DotWaveLoader variant={resolveDotWaveLoaderVariant(variant)} />
              </div>
            ) : isMath ? (
              <>
                {mathContent}
                {time ? <p className="mt-1 text-right text-[10px] opacity-70">{time}</p> : null}
              </>
            ) : isLexical ? (
              <>
                <ChatBubbleLexicalContent
                  content={lexicalContent}
                  hydrationKey={lexicalHydrationKey}
                />
                {time ? <p className="mt-1 text-right text-[10px] opacity-70">{time}</p> : null}
              </>
            ) : (
              <>
                <p className={cn('whitespace-pre-line text-inherit', textBold && 'font-bold')}>
                  {text}
                </p>
                {time ? <p className="mt-1 text-right text-[10px] opacity-70">{time}</p> : null}
              </>
            )}
          </div>
        </div>

        {hideAvatar ? (
          <div
            aria-hidden="true"
            className="mb-1 size-7 shrink-0"
          />
        ) : (
          <Avatar
            size="sm"
            className="mb-1 shrink-0 border border-neutral-300/80"
          >
            <AvatarImage
              src={avatarUrl}
              alt="Sent message avatar"
            />
            <AvatarFallback className="bg-neutral-200 text-[11px] text-neutral-600">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {onDelete ? (
        <Dialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        >
          <DialogContent showCloseButton={false}>
            <DialogHeader className="text-left">
              <div className="flex gap-4">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                  aria-hidden
                >
                  <MessageCircleOff className="size-5" />
                </div>
                <div className="flex min-w-0 flex-col gap-2">
                  <DialogTitle>{t('chatBubble.deleteMessageDialogTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('chatBubble.deleteMessageDialogDescription')}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                {t('buttons.cancel')}
              </Button>
              <Button
                type="button"
                variant="delete"
                onClick={handleConfirmDelete}
              >
                {t('buttons.delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  )
}
