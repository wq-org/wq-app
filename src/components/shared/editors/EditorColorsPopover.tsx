import { useCallback, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { Palette, type LucideIcon, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { COLORS, COLOR_IDS, type ColorId } from '@/lib/themes'
import { useTranslation } from 'react-i18next'
import { applyEditorColor, type EditorColorSelection } from './editorColors'

type ColorTileProps = {
  colorId: ColorId
  onClick: () => void
}

const getColorTileClassName = () => cn('editor-colorTile', 'editor-colorTileText')

const ColorTile = ({ colorId, onClick }: ColorTileProps) => {
  const { label, value } = COLORS[colorId]
  const Icon: LucideIcon = Type
  const tileStyle = {
    color: `oklch(${value})`,
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={getColorTileClassName()}
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClick}
          style={tileStyle}
        >
          <Icon className="size-4 font-bold" />
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

type ColorSectionProps = {
  activeColorId: ColorId | null
  onApplyColor: (colorId: ColorId | null) => void
  onClear: () => void
  title: string
  resetLabel: string
  selectedLabel: string
}

type RecentSwatchesSectionProps = {
  recentSelections: EditorColorSelection[]
  onApplyColor: (colorId: ColorId | null) => void
  title: string
}

const RecentSwatchesSection = ({
  recentSelections,
  onApplyColor,
  title,
}: RecentSwatchesSectionProps) => {
  if (!recentSelections.length) return null

  return (
    <section className="editor-colorSection">
      <Text
        as="span"
        variant="small"
        className="font-medium text-muted-foreground"
      >
        {title}
      </Text>

      <div className="editor-colorGrid">
        {recentSelections.map((selection) => (
          <ColorTile
            key={selection.colorId}
            colorId={selection.colorId}
            onClick={() => onApplyColor(selection.colorId)}
          />
        ))}
      </div>
    </section>
  )
}

const ColorSection = ({
  activeColorId,
  onApplyColor,
  onClear,
  title,
  resetLabel,
  selectedLabel,
}: ColorSectionProps) => {
  return (
    <section className="editor-colorSection">
      <div className="flex items-center justify-between gap-3">
        <Text
          as="span"
          variant="small"
          className="font-medium text-muted-foreground"
        >
          {title}
        </Text>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 rounded-full px-2 text-xs"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClear}
        >
          {resetLabel}
        </Button>
      </div>

      <div className="editor-colorGrid">
        {COLOR_IDS.map((colorId) => (
          <ColorTile
            key={colorId}
            colorId={colorId}
            onClick={() => onApplyColor(colorId)}
          />
        ))}
      </div>

      {activeColorId ? (
        <Text
          as="span"
          variant="small"
          className="text-muted-foreground"
        >
          {selectedLabel}: {COLORS[activeColorId].label}
        </Text>
      ) : null}
    </section>
  )
}

export const EditorColorsPopover = () => {
  const [editor] = useLexicalComposerContext()
  const { t } = useTranslation('shared.editorColors')
  const [isOpen, setIsOpen] = useState(false)
  const [recentSelections, setRecentSelections] = useState<EditorColorSelection[]>([])
  const [textColorId, setTextColorId] = useState<ColorId | null>('black')

  const pushRecentSelection = useCallback((selection: EditorColorSelection) => {
    setRecentSelections((currentSelections) => {
      const nextSelections = [
        selection,
        ...currentSelections.filter((item) => item.colorId !== selection.colorId),
      ]

      return nextSelections.slice(0, 5)
    })
  }, [])

  const handleApplyColor = useCallback(
    (colorId: ColorId | null) => {
      applyEditorColor(editor, colorId)
      setTextColorId(colorId)

      if (colorId !== null) {
        pushRecentSelection({ colorId })
      }

      setIsOpen(false)
    },
    [editor, pushRecentSelection],
  )

  const handleClearColor = useCallback(() => {
    applyEditorColor(editor, 'black')
    setTextColorId('black')
    setIsOpen(false)
  }, [editor])

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className={cn(
                'editor-toolbarButton',
                isOpen && 'editor-toolbarButtonActive',
                Boolean(textColorId) && 'editor-toolbarButtonActive',
              )}
              onMouseDown={(event) => event.preventDefault()}
            >
              <Palette className="size-4" />
              <span className="sr-only">{t('triggerLabel')}</span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t('triggerLabel')}</TooltipContent>
      </Tooltip>

      <PopoverContent
        align="start"
        className="editor-toolbarPopover editor-colorPopover rounded-4xl"
      >
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle>
              <Text
                as="span"
                variant="small"
                className="font-semibold"
              >
                {t('popoverTitle')}
              </Text>
            </CardTitle>
            <CardDescription>
              <Text
                as="span"
                variant="small"
                className="text-muted-foreground"
              >
                {t('popoverDescription')}
              </Text>
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0 pb-0">
            <div className="flex flex-col gap-4">
              <RecentSwatchesSection
                recentSelections={recentSelections.slice(0, 3)}
                onApplyColor={handleApplyColor}
                title={t('recentlyUsed')}
              />

              {recentSelections.length ? <Separator /> : null}

              <ColorSection
                activeColorId={textColorId}
                onApplyColor={handleApplyColor}
                onClear={handleClearColor}
                title={t('textColor')}
                resetLabel={t('reset')}
                selectedLabel={t('selected')}
              />
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
