import { useCallback, useRef, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { ChartLine, EllipsisVertical, Gamepad2, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Text } from '@/components/ui/text'
import { useDisclosure } from '@/hooks/use-disclosure'
import { COLORS, isThemeId, type ThemeId } from '@/lib/themes'
import { useAccentClasses } from '@/hooks/useAccentClasses'
import { lineClampClassName } from '@/lib/text-clamp'
import { cn } from '@/lib/utils'

import {
  buildClassroomGameAnalyticsRoute,
  buildClassroomGamePlayRoute,
} from '../utils/classroomGameRoute.utils'

const THEME_ICON_SURFACE: Record<ThemeId, string> = {
  violet: 'border-violet-500/20 bg-violet-500/10',
  indigo: 'border-indigo-500/20 bg-indigo-500/10',
  blue: 'border-blue-500/20 bg-blue-500/10',
  cyan: 'border-cyan-500/20 bg-cyan-500/10',
  teal: 'border-teal-500/20 bg-teal-500/10',
  green: 'border-green-500/20 bg-green-500/10',
  lime: 'border-lime-500/20 bg-lime-500/10',
  orange: 'border-orange-500/20 bg-orange-500/10',
  pink: 'border-pink-500/20 bg-pink-500/10',
  darkblue: 'border-blue-800/30 bg-blue-950/15',
}

const THEME_ICON_FG: Record<ThemeId, string> = {
  violet: 'text-violet-500',
  indigo: 'text-indigo-500',
  blue: 'text-blue-500',
  cyan: 'text-cyan-600',
  teal: 'text-teal-500',
  green: 'text-green-600',
  lime: 'text-lime-600',
  orange: 'text-orange-500',
  pink: 'text-pink-500',
  darkblue: 'text-blue-700',
}

type ClassroomGameCardProps = {
  classroomId: string
  id: string
  title?: string
  description?: string
  themeId?: ThemeId
  className?: string
}

export function ClassroomGameCard({
  classroomId,
  id,
  title,
  description,
  themeId,
  className,
}: ClassroomGameCardProps) {
  const { t } = useTranslation('features.teacher')
  const navigate = useNavigate()
  const popover = useDisclosure()
  const ignoreNextCardClickRef = useRef(false)

  const resolvedTheme: ThemeId = themeId && isThemeId(themeId) ? themeId : 'blue'
  const themeLabel = themeId && isThemeId(themeId) ? COLORS[themeId].label : COLORS.blue.label
  const iconSurfaceClass = THEME_ICON_SURFACE[resolvedTheme]
  const iconFgClass = THEME_ICON_FG[resolvedTheme]
  const accentClasses = useAccentClasses()

  const resolvedTitle = title?.trim() ? title : t('pages.classroomDetail.sections.gamesUntitled')
  const resolvedDescription = description?.trim()
    ? description
    : t('pages.classroomDetail.sections.gamesNoDescription')

  const handleViewAnalytics = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation()
      event.preventDefault()
      ignoreNextCardClickRef.current = true
      popover.onClose()
      window.requestAnimationFrame(() => {
        navigate(buildClassroomGameAnalyticsRoute(classroomId, id))
      })
    },
    [classroomId, id, navigate, popover],
  )

  const handlePlay = useCallback(() => {
    popover.onClose()
    navigate(buildClassroomGamePlayRoute(classroomId, id))
  }, [classroomId, id, navigate, popover])

  const handleCardClick = useCallback(() => {
    if (ignoreNextCardClickRef.current) {
      ignoreNextCardClickRef.current = false
      return
    }
    handlePlay()
  }, [handlePlay])

  return (
    <Card
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleCardClick()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={t('pages.classroomDetail.sections.gamesPlayAriaLabel', { title: resolvedTitle })}
      className={cn(
        className,
        'relative w-53 h-35 cursor-pointer rounded-3xl duration-200 ease-in-out animate-in fade-in-0 slide-in-from-left-4',
        accentClasses.hoverBorder,
      )}
    >
      <Popover
        open={popover.isOpen}
        onOpenChange={popover.onToggle}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute top-3 right-3 z-10 size-8 rounded-full bg-background/80 shadow-sm backdrop-blur-sm hover:bg-background"
            aria-label={t('pages.classroomDetail.sections.gamesMenuAriaLabel')}
            onClick={(event) => event.stopPropagation()}
          >
            <EllipsisVertical className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="w-48 rounded-lg bg-popover/80 p-2 backdrop-blur-md dark:bg-zinc-900/80"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={(event) => {
              event.stopPropagation()
              handlePlay()
            }}
          >
            <Play className="size-4" />
            {t('pages.classroomDetail.sections.gamesPlay')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={handleViewAnalytics}
          >
            <ChartLine className="size-4" />
            {t('pages.classroomDetail.sections.gamesViewAnalytics')}
          </Button>
        </PopoverContent>
      </Popover>

      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pr-12">
        <div
          className={cn('rounded-lg border p-2', iconSurfaceClass)}
          aria-label={themeLabel}
        >
          <Gamepad2
            className={cn('h-5 w-5', iconFgClass)}
            strokeWidth={1.5}
            aria-hidden
          />
        </div>
        <CardTitle
          clampLines={2}
          title={resolvedTitle}
          className="font-semibold"
        >
          {resolvedTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-w-0 justify-between">
        <Text
          variant="small"
          muted
          className={lineClampClassName(2, { flex: true })}
        >
          {resolvedDescription}
        </Text>
      </CardContent>
    </Card>
  )
}
