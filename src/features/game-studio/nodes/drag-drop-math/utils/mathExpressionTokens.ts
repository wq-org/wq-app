/** Maps display/badge glyphs to mathjs-safe tokens (per-token). */
export const MATH_BADGE_MAP: Record<string, string> = {
  '€': '',
  ',': '.',
  '·': '*',
  '×': '*',
  '÷': '/',
  '−': '-',
}

const CURRENCY_SYMBOLS = new Set(['€', '$', '£', '¥'])
const MULTI_CHAR_OPS = ['×', '÷', '·', '−'] as const
const SINGLE_CHAR_TOKENS = new Set(['+', '-', '*', '/', '(', ')', '.', ',', '€'])

const NUMBER_TOKEN_PATTERN = /^\d+(?:[.,]\d+)?$/

function mapTokenForEval(token: string): string {
  if (token in MATH_BADGE_MAP) return MATH_BADGE_MAP[token]
  if (/^\d+,\d+$/.test(token)) return token.replace(',', '.')
  return token
}

/** Turns canvas/display tokens into a spaced expression for `mathjs.evaluate`. */
export function toMathExpr(tokens: readonly string[]): string {
  return tokens
    .map(mapTokenForEval)
    .filter((token) => token !== '')
    .join(' ')
}

export function tokenizeMathInput(raw: string): string[] {
  const normalized = raw.replace(/\u00a0/g, ' ').trim()
  const tokens: string[] = []
  let index = 0

  while (index < normalized.length) {
    const char = normalized[index]
    if (/\s/.test(char)) {
      index += 1
      continue
    }

    if (/\d/.test(char)) {
      let end = index + 1
      while (end < normalized.length && /\d/.test(normalized[end])) {
        end += 1
      }
      const separator = normalized[end]
      if (
        (separator === ',' || separator === '.') &&
        end + 1 < normalized.length &&
        /\d/.test(normalized[end + 1])
      ) {
        end += 1
        while (end < normalized.length && /\d/.test(normalized[end])) {
          end += 1
        }
      }
      tokens.push(normalized.slice(index, end))
      index = end
      continue
    }

    const multiCharOp = MULTI_CHAR_OPS.find((op) => normalized.startsWith(op, index))
    if (multiCharOp) {
      tokens.push(multiCharOp)
      index += multiCharOp.length
      continue
    }

    if (SINGLE_CHAR_TOKENS.has(char)) {
      tokens.push(char)
      index += 1
      continue
    }

    tokens.push(char)
    index += 1
  }

  return tokens
}

export function containsCurrency(tokens: readonly string[]): boolean {
  return tokens.some((token) => CURRENCY_SYMBOLS.has(token))
}

export function isKnownMathToken(token: string): boolean {
  if (NUMBER_TOKEN_PATTERN.test(token)) return true
  if (SINGLE_CHAR_TOKENS.has(token)) return true
  if ((MULTI_CHAR_OPS as readonly string[]).includes(token)) return true
  return false
}

export function hasUnknownMathTokens(tokens: readonly string[]): boolean {
  return tokens.some((token) => !isKnownMathToken(token))
}

/** Human-readable equation with spaces (display / re-edit); strips currency badges. */
export function formatPrettyMathExpression(tokens: readonly string[]): string {
  const visible = tokens.filter((token) => token !== '€' && token !== '')
  const spaced = visible.join(' ')
  return spaced.replace(/\( /g, '(').replace(/ \)/g, ')').trim()
}
