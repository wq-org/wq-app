import { useTranslation } from 'react-i18next'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Separator } from '@/components/ui/separator'
import { AnimatedBeamHub, BeamHubBadge } from '@/components/shared'
import { Calculator, Square, MapPin } from 'lucide-react'
import { Text } from '@/components/ui/text'

export type GameImagePinSettingsProps = {
  nodeId: string
  onDelete: () => void
}

export function GameImagePinSettings({ onDelete }: GameImagePinSettingsProps) {
  const { t } = useTranslation('features.gameStudio')

  function onGameDescriptionValueChange(value: string) {
    console.log('value :>> ', value)
  }

  return (
    <div className="flex flex-col gap-4">
      <FieldTextarea
        value={''}
        rows={3}
        placeholder="tell us what is the game about"
        onValueChange={onGameDescriptionValueChange}
        label={'Game Description'}
      />
      <HoldToDeleteButton
        className="self-start"
        onDelete={onDelete}
      >
        {t('imagePinSettings.holdToDeleteNode')}
      </HoldToDeleteButton>

      <Separator />
      <div className="self-start w-full">
        <Text
          as="p"
          variant="h2"
        >
          {' '}
          Eine übersicht{' '}
        </Text>
        <AnimatedBeamHub
          className="h-40 w-full  "
          center={
            <BeamHubBadge
              Icon={Square}
              theme="blue"
            />
          }
          nodes={[
            {
              direction: 'left',
              content: (
                <BeamHubBadge
                  Icon={Calculator}
                  theme="blue"
                />
              ),
              gradientStartColor: 'darkblue',
              gradientStopColor: 'lime',
            },
            {
              direction: 'right',
              content: (
                <BeamHubBadge
                  Icon={MapPin}
                  theme="blue"
                />
              ),
              gradientStartColor: 'pink',
              gradientStopColor: 'orange',
              reverse: true,
            },
          ]}
        />
      </div>
    </div>
  )
}
