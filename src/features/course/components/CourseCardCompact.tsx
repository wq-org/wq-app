import { useCallback, useMemo } from 'react'
import { BookOpen } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { COLORS, isThemeId, type ThemeId } from '@/lib/themes'
import { cn } from '@/lib/utils'
import type { CourseCardProps } from '../types/course.types'

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

export function CourseCardCompact({
  id,
  title,
  description,
  themeId,
  className,
  onView = () => {},
}: CourseCardProps) {
  const resolvedTheme: ThemeId = themeId && isThemeId(themeId) ? themeId : 'blue'

  const themeLabel = useMemo(
    () => (themeId && isThemeId(themeId) ? COLORS[themeId].label : COLORS.blue.label),
    [themeId],
  )

  const iconSurfaceClass = THEME_ICON_SURFACE[resolvedTheme]
  const iconFgClass = THEME_ICON_FG[resolvedTheme]

  const handleClick = useCallback(() => {
    onView(id)
  }, [id, onView])

  return (
    <Card
      onClick={handleClick}
      className={cn(
        className,
        'w-53 h-35 rounded-3xl hover:border-blue-500 duration-200 ease-in-out cursor',
      )}
    >
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <div
          className={cn('rounded-lg border p-2', iconSurfaceClass)}
          aria-label={themeLabel}
        >
          <BookOpen
            className={cn('h-5 w-5', iconFgClass)}
            strokeWidth={1.5}
            aria-hidden
          />
        </div>
        <CardTitle className=" font-semibold line-clamp-1 overflow-hidden text-ellipsis flex-1 min-w-0">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-w-0 justify-between">
        <Text
          variant="small"
          muted
          className="line-clamp-2 overflow-hidden text-ellipsis flex-1 min-w-0"
        >
          {description}
        </Text>
      </CardContent>
    </Card>
  )
}
