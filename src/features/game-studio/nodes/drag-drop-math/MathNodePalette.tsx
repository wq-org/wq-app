import { useTranslation } from 'react-i18next'

import { Text } from '@/components/ui/text'

import { DraggablePaletteNode } from './DraggablePaletteNode'
import { MathNode } from './MathNode'
import { MathTextNode } from './MathTextNode'
import { MATH_NODE_PALETTE_DRAG_IDS } from './drag-drop-math-dnd.constants'
import { resolveDropNodeDefaultValue } from './math-node.defaults'
import { MATH_NODE_PALETTE_PRESETS } from './math-node-palette.constants'

export function MathNodePalette() {
  const { t } = useTranslation('features.gameStudio')

  return (
    <div className="flex flex-col gap-2">
      <Text
        as="p"
        variant="small"
        muted
      >
        {t('dragDropMathEditor.paletteLabel')}
      </Text>
      <div className="flex flex-wrap items-center gap-3">
        {MATH_NODE_PALETTE_PRESETS.map((item) => {
          const dropValue = resolveDropNodeDefaultValue(item.variant, item.value, t)
          const paletteLabel =
            item.variant === 'text' ? t('dragDropMathEditor.textBlockLabel') : item.value

          return (
            <DraggablePaletteNode
              key={item.variant}
              dragId={MATH_NODE_PALETTE_DRAG_IDS[item.variant]}
              dragData={{ source: 'palette', variant: item.variant, value: dropValue }}
            >
              {item.variant === 'math' ? (
                <MathNode
                  value={item.value}
                  onValueChange={() => {}}
                  editable={false}
                  showPaletteTemplate={item.showPaletteTemplate}
                  paletteTemplateLabel={t('dragDropMathEditor.mathBlockLabel')}
                  editAriaLabel={t('dragDropMathEditor.paletteDragAriaLabel', {
                    variant: item.variant,
                  })}
                  className=" bg-orange-100! text-orange-600! dark:bg-orange-950/80! dark:text-orange-400!"
                />
              ) : (
                <MathTextNode
                  value={paletteLabel}
                  showPaletteIcon
                />
              )}
            </DraggablePaletteNode>
          )
        })}
      </div>
    </div>
  )
}
