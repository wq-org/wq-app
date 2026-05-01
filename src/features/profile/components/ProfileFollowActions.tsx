import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type ProfileFollowActionsProps = {
  userName: string
  handleFollowClick?: () => void
  connectButtonLabel?: string
}

export function ProfileFollowActions({
  userName,
  handleFollowClick,
  connectButtonLabel,
}: ProfileFollowActionsProps) {
  const { t } = useTranslation('features.teacher')

  if (!handleFollowClick) return null

  return (
    <div className="container pb-4">
      <div className="flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              className="gap-2"
              data-follow-button
              onClick={handleFollowClick}
            >
              {connectButtonLabel ?? t('actions.connect')}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('actions.connectWith', { userName })}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
