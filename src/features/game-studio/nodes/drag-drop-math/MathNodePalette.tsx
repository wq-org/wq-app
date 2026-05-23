import { useTranslation } from 'react-i18next'

import { Text } from '@/components/ui/text'

import { DraggableMathNode } from './DraggableMathNode'
import { MATH_NODE_PALETTE_DRAG_IDS } from './drag-drop-math-dnd.constants'
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
        {MATH_NODE_PALETTE_PRESETS.map((item) => (
          <DraggableMathNode
            key={item.variant}
            dragId={MATH_NODE_PALETTE_DRAG_IDS[item.variant]}
            dragData={{ source: 'palette', variant: item.variant, value: item.value }}
            variant={item.variant}
            value={item.value}
            onValueChange={() => {}}
            editable={false}
            editAriaLabel={t('dragDropMathEditor.paletteDragAriaLabel', {
              variant: item.variant,
            })}
          />
        ))}
      </div>
    </div>
  )
}
