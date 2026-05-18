import { useTranslation } from 'react-i18next'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Separator } from '@/components/ui/separator'
import {
  AnimatedBeamHub,
  BeamHubBadge,
  QuantityStepper,
  SliderSyncedNumberInput,
} from '@/components/shared'
import { Calculator, CircleQuestionMark, MapPin } from 'lucide-react'

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/ui/text'
import { useState } from 'react'

export type GameImagePinSettingsProps = {
  nodeId: string
  onDelete: () => void
}

export function GameImagePinSettings({ onDelete }: GameImagePinSettingsProps) {
  const { t } = useTranslation('features.gameStudio')

  const [opacityPercent, setOpacityPercent] = useState(50)

  const handleOpacityPercentChange = (value: number) => {
    setOpacityPercent(value)
  }

  function onGameDescriptionValueChange(value: string) {
    console.log('value :>> ', value)
  }
  function setQuantity() {}

  function setStatus() {}
  return (
    <div className="flex flex-col gap-8">
      <Text
        as="p"
        bold
      >
        {' '}
        Pädagogisches
      </Text>
      <div className="flex flex-col gap-4 self-start">
        <Label>Wähle das Lernfeld welches an dies in angriff nimmt</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="self-start"
              variant="outline"
            >
              Wähle Lernfeld aus
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start">
            <PopoverHeader>
              <PopoverTitle>Title</PopoverTitle>
              <PopoverDescription>Description text here.</PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      </div>

      <FieldTextarea
        value={''}
        rows={3}
        placeholder="tell us what is the game about"
        onValueChange={onGameDescriptionValueChange}
        label={'Game Description'}
      />

      <Text
        as="p"
        bold
      >
        {' '}
        Spieleinstellungen
      </Text>

      <div className="flex gap-8">
        <Label className="flex-1">
          Gebe die maximal punktzahl die es geben beim vollständigen korrektem durchlauf{' '}
        </Label>
        <QuantityStepper
          className="w-50 flex-1"
          value={100}
          min={0}
          max={999}
          step={1}
          onChange={setQuantity}
          label="Demo quantity"
        />
      </div>
      <div className="flex  gap-3  flex-1">
        <Label className="flex-1">
          Wie viel % werden bei jedem neuen Versuch abgezogen von dem in der Runde zu erreichenen
          Punkten?{' '}
        </Label>
        <QuantityStepper
          className="w-50 flex-1"
          value={10}
          min={0}
          max={50}
          step={1}
          onChange={setQuantity}
          label="Quanity"
        />
      </div>

      <div className="flex justify-between">
        <Text
          as="p"
          variant="small"
          className="flex-1"
        >
          Für die Starke spieler opitonal zeitlimit erlauben und den Schüler zu fordern
        </Text>
        <div className="w-full  flex justify-center flex-1">
          <Switch
            checked={status === 'active'}
            onCheckedChange={() => setStatus()}
          />
        </div>
      </div>

      <Separator />

      <div className="self-start w-full">
        <Label>
          {' '}
          Vorschau von vorherigen und nächster node welche anwählbar sind das der aktuelle knoten
          ist immer farbig markiert
        </Label>
        <AnimatedBeamHub
          className="h-40 w-full  "
          center={
            <BeamHubBadge
              Icon={MapPin}
              theme="blue"
            />
          }
          nodes={[
            {
              direction: 'left',
              content: (
                <BeamHubBadge
                  Icon={Calculator}
                  theme="default"
                />
              ),
              gradientStartColor: 'darkblue',
              gradientStopColor: 'violet',
            },
            {
              direction: 'right',
              content: (
                <BeamHubBadge
                  Icon={CircleQuestionMark}
                  theme="default"
                />
              ),
              gradientStartColor: 'pink',
              gradientStopColor: 'darkblue',
              reverse: true,
            },
          ]}
        />
      </div>

      <Separator />

      <Text
        as="p"
        variant="body"
      >
        Adaptive Funktionen
      </Text>

      <div className="flex w-full">
        <div className="flex flex-col gap-8 flex-1">
          <Text
            as="p"
            variant="small"
          >
            percentage of the image quality that can be decreased
          </Text>
          <SliderSyncedNumberInput
            label="Opacity"
            inputId="test-page-opacity-slider"
            value={opacityPercent}
            onValueChange={handleOpacityPercentChange}
            min={0}
            max={100}
            step={1}
            suffix="%"
          />
        </div>
        <div className="flex-1 flex  justify-center">
          <div className="bg-amber-300 w-70 h-30 border orange rounded-2xl">
            /* load real image and dcrease the image quality use aspect ratio*/
          </div>
        </div>
      </div>

      <Separator />
      <div className="flex w-full">
        <div className="flex flex-col gap-8 flex-1">
          <Text
            as="p"
            variant="small"
            className="flex-1"
          >
            percentage or image area that can be excluded
          </Text>
          <SliderSyncedNumberInput
            className=""
            label="Opacity"
            inputId="test-page-opacity-slider"
            value={opacityPercent}
            onValueChange={handleOpacityPercentChange}
            min={0}
            max={100}
            step={1}
            suffix="%"
          />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-blue-300 w-70 h-30 border orange rounded-2xl">
            /* load real image and dcrease the image quality use aspect ratio*/
          </div>
        </div>
      </div>

      <Separator />

      <HoldToDeleteButton
        className="self-start"
        onDelete={onDelete}
      >
        {t('imagePinSettings.holdToDeleteNode')}
      </HoldToDeleteButton>
    </div>
  )
}
