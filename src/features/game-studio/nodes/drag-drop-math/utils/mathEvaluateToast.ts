import { toast } from 'sonner'

import type { MathExpressionEvaluateFailureReason } from './evaluateMathExpression'

const EVALUATE_TOAST_MESSAGE_KEY: Record<
  Exclude<MathExpressionEvaluateFailureReason, 'empty'>,
  string
> = {
  incompatible_units: 'dragDropMathEditor.evaluateToastIncompatibleUnits',
  invalid_characters: 'dragDropMathEditor.evaluateToastInvalid',
  parse_error: 'dragDropMathEditor.evaluateToastParse',
  not_finite: 'dragDropMathEditor.evaluateToastNotFinite',
}

type TranslateFn = (key: string) => string

/** Shows a Sonner error toast for a failed equation evaluation (skips `empty`). */
export function notifyMathExpressionEvaluateFailure(
  reason: MathExpressionEvaluateFailureReason,
  t: TranslateFn,
): void {
  if (reason === 'empty') return

  const messageKey = EVALUATE_TOAST_MESSAGE_KEY[reason]
  toast.error(t('dragDropMathEditor.evaluateToastTitle'), {
    description: t(messageKey),
  })
}
