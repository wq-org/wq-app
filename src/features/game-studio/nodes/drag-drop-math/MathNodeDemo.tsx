import { useState } from 'react'

import { MathNode } from './MathNode'
import { MathNodeInlineSentence, MathNodeSentenceText } from './MathNodeInlineSentence'

export function MathNodeDemo() {
  const [quick, setQuick] = useState('quick')
  const [over, setOver] = useState('over')
  const [defaultSlot, setDefaultSlot] = useState('quick')
  const [ghostSlot, setGhostSlot] = useState('over')

  return (
    <div className="flex w-full max-w-3xl flex-col gap-8">
      <div className="space-y-2">
        <p className="font-mono text-xs text-muted-foreground">
          Inline sentence — ghost (bold, no fill) + default (secondary badge). Click a node to edit;
          press Enter to finish. Badges stay on one line (no mid-word breaks).
        </p>
        <MathNodeInlineSentence>
          <MathNodeSentenceText>The </MathNodeSentenceText>
          <MathNode
            variant="ghost"
            value={quick}
            onValueChange={setQuick}
            editAriaLabel="Edit ghost math node"
          />
          <MathNodeSentenceText> brown fox jumps </MathNodeSentenceText>
          <MathNode
            variant="default"
            value={over}
            onValueChange={setOver}
            editAriaLabel="Edit default math node"
          />
          <MathNodeSentenceText> the lazy dog.</MathNodeSentenceText>
        </MathNodeInlineSentence>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2 rounded-xl border bg-card p-4">
          <p className="font-mono text-xs text-muted-foreground">variant=&quot;default&quot;</p>
          <MathNodeInlineSentence>
            <MathNodeSentenceText>The </MathNodeSentenceText>
            <MathNode
              variant="default"
              value={defaultSlot}
              onValueChange={setDefaultSlot}
            />
            <MathNodeSentenceText> brown fox.</MathNodeSentenceText>
          </MathNodeInlineSentence>
        </div>
        <div className="space-y-2 rounded-xl border bg-card p-4">
          <p className="font-mono text-xs text-muted-foreground">variant=&quot;ghost&quot;</p>
          <MathNodeInlineSentence>
            <MathNodeSentenceText>Jumps </MathNodeSentenceText>
            <MathNode
              variant="ghost"
              value={ghostSlot}
              onValueChange={setGhostSlot}
            />
            <MathNodeSentenceText> the lazy dog.</MathNodeSentenceText>
          </MathNodeInlineSentence>
        </div>
      </div>
    </div>
  )
}
