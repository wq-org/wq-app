import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DropMathNode } from './DropMathNode'
import { DropTextNode } from './DropTextNode'
import { MathNode } from './MathNode'
import { MathNodeInlineSentence, MathNodeSentenceText } from './MathNodeInlineSentence'
import { MathTextNode } from './MathTextNode'

export function MathNodeDemo() {
  const { t } = useTranslation('features.gameStudio')
  const [textSlot, setTextSlot] = useState('quick')
  const [mathSlot, setMathSlot] = useState(t('dragDropMathEditor.mathNodeDefaultValue'))
  const [mathCanvas, setMathCanvas] = useState('10km + 20€')
  const [textCanvas, setTextCanvas] = useState('× 50')

  return (
    <div className="flex w-full max-w-3xl flex-col gap-8">
      <div className="space-y-2">
        <p className="font-mono text-xs text-muted-foreground">
          Palette chips (inactive) and canvas drop nodes (default / editing / disabled).
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <MathNode
            value=""
            onValueChange={() => {}}
            editable={false}
            showPaletteTemplate
            paletteTemplateLabel={t('dragDropMathEditor.mathBlockLabel')}
          />
          <MathTextNode
            value={t('dragDropMathEditor.textBlockLabel')}
            onValueChange={() => {}}
            editable={false}
            showPaletteIcon
          />
        </div>
        <MathNodeInlineSentence>
          <MathNodeSentenceText>The </MathNodeSentenceText>
          <DropTextNode
            value={textSlot}
            onValueChange={setTextSlot}
            editAriaLabel="Edit text node"
          />
          <MathNodeSentenceText> brown fox jumps </MathNodeSentenceText>
          <DropMathNode
            value={mathSlot}
            onValueChange={setMathSlot}
            editAriaLabel="Edit math node"
          />
          <MathNodeSentenceText> the lazy dog.</MathNodeSentenceText>
        </MathNodeInlineSentence>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2 rounded-xl border bg-card p-4">
          <p className="font-mono text-xs text-muted-foreground">DropMathNode</p>
          <DropMathNode
            value={mathCanvas}
            onValueChange={setMathCanvas}
          />
          <DropMathNode
            value={mathCanvas}
            onValueChange={() => {}}
            disabled
          />
        </div>
        <div className="space-y-2 rounded-xl border bg-card p-4">
          <p className="font-mono text-xs text-muted-foreground">DropTextNode</p>
          <MathNodeInlineSentence>
            <MathNodeSentenceText>Jumps </MathNodeSentenceText>
            <DropTextNode
              value={textCanvas}
              onValueChange={setTextCanvas}
            />
            <MathNodeSentenceText> the lazy dog.</MathNodeSentenceText>
          </MathNodeInlineSentence>
        </div>
      </div>
    </div>
  )
}
