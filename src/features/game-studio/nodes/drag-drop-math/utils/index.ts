// ─── Unit definitions ─────────────────────────────────────────────────────────
export type { UnitCategory, UnitDefinition, BinaryOperator, BinaryRule } from './unitDefinitions'
export {
  UNIT_DEFINITIONS,
  ALLOWED_BINARY_RULES,
  lookupUnit,
  findUnitDefinition,
  findUnitDefinitionBySymbol,
  applyBinaryRule,
  isBinaryOperator,
} from './unitDefinitions'

// ─── Token layer ──────────────────────────────────────────────────────────────
export type {
  MathToken,
  NumberToken,
  OperatorToken,
  ParenToken,
  UnitToken,
  UnknownToken,
} from './tokenLayer'
export {
  classifyBadge,
  buildTokens,
  isNumberToken,
  isOperatorToken,
  isParenToken,
  isUnitToken,
  isUnknownToken,
  isOperandToken,
} from './tokenLayer'

// ─── Validation layer ─────────────────────────────────────────────────────────
export type {
  ValidationResult,
  ValidationSuccess,
  ValidationFailure,
  ValidationFailureReason,
} from './validationLayer'
export { validateTokens } from './validationLayer'

// ─── Equation evaluation (TokenLayer → ValidationLayer → mathjs) ─────────────
export { evaluateMathEquation } from './evaluateMathEquation'

// ─── Arithmetic evaluation ────────────────────────────────────────────────────
export { evaluateMathExpression, formatMathResult } from './evaluateMathExpression'
export type {
  MathExpressionEvaluateResult,
  MathExpressionEvaluateSuccess,
  MathExpressionEvaluateFailure,
} from './evaluateMathExpression'
export {
  MATH_BADGE_MAP,
  toMathExpr,
  tokenizeMathInput,
  tokenizeEquationInput,
  formatPrettyMathExpression,
  formatDisplayEquation,
  resolveResultDisplaySuffix,
  containsCurrency,
  hasUnknownMathTokens,
} from './mathExpressionTokens'
export {
  MATH_EQUALS_DISPLAY,
  applyMathEquationCommitToRow,
  applyMathEquationCommitToRows,
  collectEquationGroupTokenIds,
  createMathEqualsToken,
  createMathResultToken,
  createMathEquationFromResult,
  isEditableEquationToken,
  isFixedMathSuffixToken,
  rowHasEquationToken,
  removeTokensById,
  extractEquationGroupTokens,
} from './mathEquationRow'
export type { MathEquationCommitPayload } from './mathEquationRow'
export { snapCenterToCursor } from './snapCenterToCursor'
export {
  createCanvasRowId,
  createCanvasTokenId,
  insertTokenAt,
  insertSigmaRowAt,
  insertTokenGroupAt,
  reorderRowsByIndex,
  pruneEmptyRows,
  reorderTokenWithinRow,
} from './canvasDnd.utils'
export { formatGroupedNumber, MATH_DISPLAY_NUMBER_LOCALE } from './numberDisplay'
export {
  createEmptySigmaRow,
  normalizeSigmaRow,
  formatSigmaItemDisplay,
  formatSigmaResultDisplay,
  parseResultChipValue,
  isSigmaDropAllowed,
  dropOnSigmaRow,
  resetSigma,
  computeSigmaResult,
} from './sigmaRow'
export type { ParsedResultChip, SigmaDropDecision } from './sigmaRow'
export {
  CANVAS_ROW_MAX_TOKENS,
  resolveCanvasDropInsertTarget,
  resolveResultDuplicateInsertTarget,
  resolveSigmaDropTarget,
} from './canvasDropTarget.utils'
export { canvasCollisionDetection } from './canvasCollisionDetection'
