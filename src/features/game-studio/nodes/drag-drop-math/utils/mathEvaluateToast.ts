import { toast } from 'sonner'

import type {
  MathExpressionEvaluateFailure,
  MathExpressionEvaluateFailureReason,
} from './evaluateMathExpression'

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

type EvaluateFailureLike = MathExpressionEvaluateFailureReason | MathExpressionEvaluateFailure

function resolveFailure(input: EvaluateFailureLike): {
  reason: MathExpressionEvaluateFailureReason
  message?: string
} {
  return typeof input === 'string'
    ? { reason: input }
    : { reason: input.reason, message: input.message }
}

/**
 * Shows a Sonner error toast for a failed equation evaluation (skips `empty`).
 *
 * Accepts either a bare reason (legacy callers) or a full failure object. When
 * the failure carries a specific `message` (e.g. locked-combination block), it
 * is shown verbatim — otherwise the matching i18n key is used as fallback.
 */
export function notifyMathExpressionEvaluateFailure(
  input: EvaluateFailureLike,
  t: TranslateFn,
): void {
  const { reason, message } = resolveFailure(input)
  if (reason === 'empty') return

  const description = message ?? t(EVALUATE_TOAST_MESSAGE_KEY[reason])
  toast.error(t('dragDropMathEditor.evaluateToastTitle'), {
    description,
  })
}
