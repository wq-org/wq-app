import { useTranslation } from 'react-i18next'

import { Text } from '@/components/ui/text'

import { DraggablePaletteNode } from './DraggablePaletteNode'
import { MathNode } from './MathNode'
import { MathTextNode } from './MathTextNode'
import { SigmaNode } from './SigmaNode'
import { MATH_NODE_PALETTE_DRAG_IDS } from '../constants/drag-drop-math-dnd.constants'
import { resolveDropNodeDefaultValue } from '../constants/math-node.defaults'
import { MATH_NODE_PALETTE_PRESETS } from '../constants/math-node-palette.constants'

export type MathNodePaletteProps = {
  showLabel?: boolean
}

export function MathNodePalette({ showLabel = true }: MathNodePaletteProps) {
  const { t } = useTranslation('features.gameStudio')

  return (
    <div className="flex flex-col gap-2">
      {showLabel ? (
        <Text
          as="p"
          variant="small"
          muted
        >
          {t('dragDropMathEditor.paletteLabel')}
        </Text>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        {MATH_NODE_PALETTE_PRESETS.map((item) => {
          const dropValue = resolveDropNodeDefaultValue(item.variant, item.value, t)
          const paletteLabel =
            item.variant === 'text'
              ? t('dragDropMathEditor.textBlockLabel')
              : item.variant === 'sigma'
                ? t('dragDropMathEditor.sigmaBlockLabel')
                : item.value

          return (
            <DraggablePaletteNode
              key={MATH_NODE_PALETTE_DRAG_IDS[item.variant]}
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
                />
              ) : item.variant === 'sigma' ? (
                <SigmaNode
                  paletteMode
                  label={paletteLabel}
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
