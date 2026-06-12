import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import {
  CurvedImage,
  CurvedScrollbar,
  CurvedScrollbarContent,
  CurvedScrollbarFooter,
  CurvedScrollbarHeader,
  CurvedScrollbarViewport,
  CurvedText,
  CurvedTitle,
} from '@/components/shared/curved-scrollbar'
import { getColorCss, isThemeId, type ThemeId } from '@/lib/themes'
import type { Note } from '../types/note.types'
import { formatNoteTime } from '../utils/noteTime'

type NoteCardProps = {
  note: Note
  index: number
  onClick: (noteId: string) => void
}

const FALLBACK_THEME: ThemeId = 'blue'

export function NoteCard({ note, index, onClick }: NoteCardProps) {
  const { i18n, t } = useTranslation('features.notes')

  const resolvedThemeId: ThemeId =
    note.themeId && isThemeId(note.themeId) ? note.themeId : FALLBACK_THEME
  const scrollbarColor = getColorCss(resolvedThemeId)
  const title = note.title || t('card.untitled')
  const description = note.description.trim()
  const previewText = note.contentPreview?.text?.trim() ?? ''
  const previewImageUrl = note.contentPreview?.imageUrl ?? null
  const updatedText = formatNoteTime(note.updatedAt, i18n.language)
  const staggerDelay = Math.min(index * 55, 400)

  const handleClick = useCallback(() => {
    onClick(note.id)
  }, [onClick, note.id])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onClick(note.id)
      }
    },
    [onClick, note.id],
  )

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={title}
      className="group relative w-full min-w-0 cursor-pointer"
      style={{ animationDelay: `${staggerDelay}ms`, animationFillMode: 'backwards' }}
    >
      <CurvedScrollbar
        theme="system"
        color={scrollbarColor}
        width="100%"
        height={400}
        className="curved-scrollbar--interactive"
      >
        <CurvedScrollbarViewport>
          <CurvedScrollbarHeader>
            <CurvedTitle>{title}</CurvedTitle>
            {description ? <CurvedText variant="intro">{description}</CurvedText> : null}
            {previewImageUrl ? (
              <CurvedImage
                placement="hero"
                src={previewImageUrl}
                alt=""
                loading="lazy"
              />
            ) : null}
          </CurvedScrollbarHeader>

          {previewText ? (
            <CurvedScrollbarContent>
              <CurvedText>{previewText}</CurvedText>
            </CurvedScrollbarContent>
          ) : null}

          <CurvedScrollbarFooter>
            <CurvedText variant="footer">{updatedText}</CurvedText>
          </CurvedScrollbarFooter>
        </CurvedScrollbarViewport>
      </CurvedScrollbar>
    </div>
  )
}
