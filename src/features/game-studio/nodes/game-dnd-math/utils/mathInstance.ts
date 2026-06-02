/**
 * Scoped mathjs instance for the drag-drop-math evaluator.
 *
 * Security contract:
 *  - Students NEVER send free strings directly to math.evaluate().
 *    The TokenLayer + ValidationLayer whitelist and classify every badge
 *    before the arithmetic string is assembled. Only digits and the four
 *    operators (+, -, *, /) reach this instance.
 *  - Custom units are registered here once at module load so that mathjs
 *    recognises EUR, ha, permille, Stück, €/kg, etc.
 *  - Expression-injection and XSS are prevented upstream: the evaluator
 *    receives only the already-validated numeric expression, not raw DOM
 *    input.
 *
 * Do NOT use the global `mathjs` singleton (imported directly from 'mathjs').
 * Always import `mathEvaluate` from this file.
 */

import { create, all, type CreateUnitOptions } from 'mathjs'

import { UNIT_DEFINITIONS, type UnitDefinition } from './unitDefinitions'

const math = create(all)

type DefineUnitOptions = Pick<CreateUnitOptions, 'aliases'>

function defineIfMissing(name: string, definition?: string, options?: DefineUnitOptions): void {
  try {
    if (definition !== undefined) {
      math.createUnit(name, definition, options)
      return
    }
    math.createUnit(name, options)
  } catch {
    // Unit already exists — safe to ignore in dev HMR cycles.
  }
}

/** math.js unit names cannot contain `/` or `²`; map registry symbols to safe keys. */
function toMathJsUnitName(symbol: string): string {
  return symbol.replace(/\//g, '_per_').replace(/²/g, '2').replace(/³/g, '3').replace(/°/g, 'deg')
}

function toMathJsExponentPart(part: string): string {
  return part.replace(/m3$/i, 'm^3').replace(/m2$/i, 'm^2').replace(/cm3$/i, 'cm^3')
}

function buildCompositeDefinition(symbol: string): string | undefined {
  if (!symbol.includes('/')) return undefined
  const [numerator, denominator] = symbol.split('/')
  if (!numerator || !denominator) return undefined
  return `${numerator} / ${toMathJsExponentPart(denominator)}`
}

function collectRegistryAliases(def: UnitDefinition, mathName: string): string[] {
  const keys = new Set<string>()
  keys.add(def.symbol)
  keys.add(def.displaySymbol)
  for (const alias of def.aliases ?? []) keys.add(alias)

  return [...keys].filter((key) => key !== mathName && toMathJsUnitName(key) !== mathName)
}

function registerRegistryUnit(def: UnitDefinition): void {
  const mathName = toMathJsUnitName(def.symbol)
  const aliases = collectRegistryAliases(def, mathName)
  const aliasOptions = aliases.length > 0 ? { aliases } : undefined
  const compositeDefinition = buildCompositeDefinition(def.symbol)

  if (compositeDefinition) {
    defineIfMissing(mathName, compositeDefinition, aliasOptions)
    return
  }

  defineIfMissing(mathName, undefined, aliasOptions)
}

// Base units math.js does not ship (or we override for pedagogy).
defineIfMissing('EUR')
defineIfMissing('ct', '0.01 EUR', { aliases: ['cent'] })
defineIfMissing('USD', '0.92 EUR')
defineIfMissing('a', '100 m^2')
defineIfMissing('ha', '10000 m^2')
defineIfMissing('permille', '0.001', { aliases: ['‰'] })

// All registry entries (Stück, €/kg, km/h, …) — aliases include displaySymbol.
for (const def of UNIT_DEFINITIONS) {
  registerRegistryUnit(def)
}

/**
 * Safe evaluate wrapper. Receives ONLY a pre-validated numeric string
 * (digits + operators). Throws on parse errors — callers must catch.
 */
export function mathEvaluate(expression: string): unknown {
  return math.evaluate(expression)
}
