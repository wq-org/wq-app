import { useTranslation } from 'react-i18next'
import { Container } from '@/components/shared/container'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type DashboardActionsProps = {
  userName: string
  handleFollowClick?: () => void
  connectButtonLabel?: string
}

export function DashboardActions({
  userName,
  handleFollowClick,
  connectButtonLabel,
}: DashboardActionsProps) {
  const { t } = useTranslation('features.teacher')

  return (
    <Container className="pb-4">
      <div className="flex items-center gap-4">
        {handleFollowClick ? (
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
        ) : null}
      </div>
    </Container>
  )
}
