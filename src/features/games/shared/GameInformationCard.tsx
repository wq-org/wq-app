import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

const DEFAULT_TRUNCATE_LENGTH = 600

export interface GameInformationCardProps {
  title?: string
  description?: string
  truncateLength?: number
}

export default function GameInformationCard({
  title,
  description,
  truncateLength = DEFAULT_TRUNCATE_LENGTH,
}: GameInformationCardProps) {
  const { t } = useTranslation('features.games')
  const [expanded, setExpanded] = useState(false)

  const isLong = typeof description === 'string' && description.length > truncateLength
  const displayText =
    description && (isLong && !expanded ? `${description.slice(0, truncateLength)}…` : description)

  return (
    <div className="space-y-2">
      {title && (
        <Text
          as="h2"
          variant="h2"
          className="text-lg font-semibold"
        >
          {title}
        </Text>
      )}
      {description && (
        <div className="space-y-2">
          <Text
            as="p"
            variant="body"
            className="text-sm text-muted-foreground"
          >
            {displayText}
          </Text>
          {isLong && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? (
                <>
                  <ChevronUp
                    className="size-4"
                    aria-hidden
                  />
                  {t('gameInformationCard.showLess')}
                </>
              ) : (
                <>
                  <ChevronDown
                    className="size-4"
                    aria-hidden
                  />
                  {t('gameInformationCard.showMore')}
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
