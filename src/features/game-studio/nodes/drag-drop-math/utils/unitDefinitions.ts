// ─── Unit Categories ─────────────────────────────────────────────────────────

export type UnitCategory =
  | 'dimensionless' // pure numbers, multipliers
  | 'length'
  | 'area'
  | 'volume'
  | 'capacity'
  | 'mass'
  | 'time'
  | 'money'
  | 'percentage'
  | 'ratio' // efficiency, dimensionless ratio (η, phi)
  | 'angle'
  | 'temperature'
  | 'count' // Stück, Einheit, Paar (BWL-critical)
  | 'speed'
  | 'acceleration'
  | 'force'
  | 'pressure'
  | 'frequency'
  | 'density'
  | 'power'
  | 'energy'
  | 'rate' // derived price/quantity ratios (€/kg, €/m², …)
  | 'function'

// ─── Unit Definition ─────────────────────────────────────────────────────────

export type UnitDefinition = {
  readonly symbol: string
  readonly aliases?: readonly string[]
  readonly category: UnitCategory
  /** SI or reference base symbol for this quantity. */
  readonly baseSymbol: string
  /** Human-readable glyph used in UI chips. */
  readonly displaySymbol: string
  /** True when this unit is derived (result-only; can't be entered standalone). */
  readonly isDerived?: boolean
}

// ─── Unit Registry ────────────────────────────────────────────────────────────

export const UNIT_DEFINITIONS: readonly UnitDefinition[] = [
  // length
  { symbol: 'mm', category: 'length', baseSymbol: 'm', displaySymbol: 'mm' },
  { symbol: 'cm', category: 'length', baseSymbol: 'm', displaySymbol: 'cm' },
  { symbol: 'dm', category: 'length', baseSymbol: 'm', displaySymbol: 'dm' },
  { symbol: 'm', category: 'length', baseSymbol: 'm', displaySymbol: 'm' },
  { symbol: 'km', category: 'length', baseSymbol: 'm', displaySymbol: 'km' },
  {
    symbol: 'lfdm',
    aliases: ['lfm'],
    category: 'length',
    baseSymbol: 'm',
    displaySymbol: 'lfdm',
  },

  // area
  {
    symbol: 'mm2',
    aliases: ['mm²'],
    category: 'area',
    baseSymbol: 'm2',
    displaySymbol: 'mm²',
  },
  {
    symbol: 'cm2',
    aliases: ['cm²'],
    category: 'area',
    baseSymbol: 'm2',
    displaySymbol: 'cm²',
  },
  {
    symbol: 'dm2',
    aliases: ['dm²'],
    category: 'area',
    baseSymbol: 'm2',
    displaySymbol: 'dm²',
  },
  {
    symbol: 'm2',
    aliases: ['m²'],
    category: 'area',
    baseSymbol: 'm2',
    displaySymbol: 'm²',
  },
  { symbol: 'a', category: 'area', baseSymbol: 'm2', displaySymbol: 'a' },
  { symbol: 'ha', category: 'area', baseSymbol: 'm2', displaySymbol: 'ha' },
  {
    symbol: 'km2',
    aliases: ['km²'],
    category: 'area',
    baseSymbol: 'm2',
    displaySymbol: 'km²',
  },

  // volume
  {
    symbol: 'mm3',
    aliases: ['mm³'],
    category: 'volume',
    baseSymbol: 'm3',
    displaySymbol: 'mm³',
  },
  {
    symbol: 'cm3',
    aliases: ['cm³'],
    category: 'volume',
    baseSymbol: 'm3',
    displaySymbol: 'cm³',
  },
  {
    symbol: 'dm3',
    aliases: ['dm³'],
    category: 'volume',
    baseSymbol: 'm3',
    displaySymbol: 'dm³',
  },
  {
    symbol: 'm3',
    aliases: ['m³'],
    category: 'volume',
    baseSymbol: 'm3',
    displaySymbol: 'm³',
  },

  // capacity (liquid)
  { symbol: 'ml', category: 'capacity', baseSymbol: 'l', displaySymbol: 'ml' },
  { symbol: 'cl', category: 'capacity', baseSymbol: 'l', displaySymbol: 'cl' },
  { symbol: 'dl', category: 'capacity', baseSymbol: 'l', displaySymbol: 'dl' },
  { symbol: 'l', category: 'capacity', baseSymbol: 'l', displaySymbol: 'l' },

  // mass
  { symbol: 'mg', category: 'mass', baseSymbol: 'kg', displaySymbol: 'mg' },
  { symbol: 'g', category: 'mass', baseSymbol: 'kg', displaySymbol: 'g' },
  { symbol: 'kg', category: 'mass', baseSymbol: 'kg', displaySymbol: 'kg' },
  {
    symbol: 'tonne',
    aliases: ['t'],
    category: 'mass',
    baseSymbol: 'kg',
    displaySymbol: 't',
  },

  // time
  { symbol: 's', category: 'time', baseSymbol: 's', displaySymbol: 's' },
  { symbol: 'min', category: 'time', baseSymbol: 's', displaySymbol: 'min' },
  { symbol: 'h', category: 'time', baseSymbol: 's', displaySymbol: 'h' },
  { symbol: 'd', category: 'time', baseSymbol: 's', displaySymbol: 'd' },
  {
    symbol: 'week',
    aliases: ['Woche', 'Wo'],
    category: 'time',
    baseSymbol: 's',
    displaySymbol: 'Wo',
  },
  {
    symbol: 'month',
    aliases: ['Monat', 'Mo'],
    category: 'time',
    baseSymbol: 's',
    displaySymbol: 'Mon',
  },

  // energy
  { symbol: 'J', category: 'energy', baseSymbol: 'J', displaySymbol: 'J' },
  { symbol: 'kJ', category: 'energy', baseSymbol: 'J', displaySymbol: 'kJ' },
  { symbol: 'MJ', category: 'energy', baseSymbol: 'J', displaySymbol: 'MJ' },
  { symbol: 'Wh', category: 'energy', baseSymbol: 'J', displaySymbol: 'Wh' },
  { symbol: 'kWh', category: 'energy', baseSymbol: 'J', displaySymbol: 'kWh' },

  // power
  { symbol: 'W', category: 'power', baseSymbol: 'W', displaySymbol: 'W' },
  { symbol: 'kW', category: 'power', baseSymbol: 'W', displaySymbol: 'kW' },

  // temperature
  {
    symbol: 'celsius',
    aliases: ['°C'],
    category: 'temperature',
    baseSymbol: 'K',
    displaySymbol: '°C',
  },
  { symbol: 'K', category: 'temperature', baseSymbol: 'K', displaySymbol: 'K' },

  // money
  {
    symbol: 'EUR',
    aliases: ['€'],
    category: 'money',
    baseSymbol: 'EUR',
    displaySymbol: '€',
  },
  {
    symbol: 'ct',
    aliases: ['cent'],
    category: 'money',
    baseSymbol: 'EUR',
    displaySymbol: 'ct',
  },
  { symbol: 'USD', category: 'money', baseSymbol: 'USD', displaySymbol: '$' },

  // percentage
  {
    symbol: 'percent',
    aliases: ['%'],
    category: 'percentage',
    baseSymbol: 'number',
    displaySymbol: '%',
  },
  {
    symbol: 'permille',
    aliases: ['‰'],
    category: 'percentage',
    baseSymbol: 'number',
    displaySymbol: '‰',
  },

  // angle
  {
    symbol: 'deg',
    aliases: ['°'],
    category: 'angle',
    baseSymbol: 'rad',
    displaySymbol: '°',
  },
  { symbol: 'rad', category: 'angle', baseSymbol: 'rad', displaySymbol: 'rad' },

  // speed
  {
    symbol: 'km/h',
    category: 'speed',
    baseSymbol: 'm/s',
    displaySymbol: 'km/h',
    isDerived: true,
  },
  { symbol: 'm/s', category: 'speed', baseSymbol: 'm/s', displaySymbol: 'm/s' },

  // density (derived — result only)
  {
    symbol: 'kg/m3',
    aliases: ['kg/m³'],
    category: 'density',
    baseSymbol: 'kg/m3',
    displaySymbol: 'kg/m³',
    isDerived: true,
  },
  {
    symbol: 'g/cm3',
    aliases: ['g/cm³'],
    category: 'density',
    baseSymbol: 'kg/m3',
    displaySymbol: 'g/cm³',
    isDerived: true,
  },

  // count (BWL: Stück, Einheit, Paar, Dutzend)
  {
    symbol: 'Stueck',
    aliases: ['Stück', 'stk', 'STK'],
    category: 'count',
    baseSymbol: 'Stueck',
    displaySymbol: 'Stück',
  },
  {
    symbol: 'Paar',
    aliases: ['paar'],
    category: 'count',
    baseSymbol: 'Stueck',
    displaySymbol: 'Paar',
  },
  {
    symbol: 'Einheit',
    aliases: ['Einh', 'LE'],
    category: 'count',
    baseSymbol: 'Stueck',
    displaySymbol: 'Einheit',
  },
  {
    symbol: 'Dutzend',
    category: 'count',
    baseSymbol: 'Stueck',
    displaySymbol: 'Dutzend',
  },

  // ratio (efficiency factor η, phi, …)
  {
    symbol: 'ratio',
    aliases: ['η', 'phi'],
    category: 'ratio',
    baseSymbol: 'number',
    displaySymbol: 'η',
  },

  // rate — derived price ratios
  {
    symbol: 'EUR/kg',
    category: 'rate',
    baseSymbol: 'EUR/kg',
    displaySymbol: '€/kg',
    isDerived: true,
  },
  {
    symbol: 'EUR/m2',
    category: 'rate',
    baseSymbol: 'EUR/m2',
    displaySymbol: '€/m²',
    isDerived: true,
  },
  {
    symbol: 'EUR/kWh',
    category: 'rate',
    baseSymbol: 'EUR/kWh',
    displaySymbol: '€/kWh',
    isDerived: true,
  },
  {
    symbol: 'EUR/lfdm',
    category: 'rate',
    baseSymbol: 'EUR/m',
    displaySymbol: '€/lfdm',
    isDerived: true,
  },
  {
    symbol: 'EUR/Stueck',
    aliases: ['€/Stück', 'EUR/stk'],
    category: 'rate',
    baseSymbol: 'EUR/Stueck',
    displaySymbol: '€/Stück',
    isDerived: true,
  },
  {
    symbol: 'EUR/h',
    aliases: ['€/h'],
    category: 'rate',
    baseSymbol: 'EUR/h',
    displaySymbol: '€/h',
    isDerived: true,
  },
  {
    symbol: 'EUR/t',
    aliases: ['€/t'],
    category: 'rate',
    baseSymbol: 'EUR/kg',
    displaySymbol: '€/t',
    isDerived: true,
  },
  {
    symbol: 'EUR/l',
    aliases: ['€/l'],
    category: 'rate',
    baseSymbol: 'EUR/l',
    displaySymbol: '€/l',
    isDerived: true,
  },
  {
    symbol: 'EUR/m',
    aliases: ['€/m'],
    category: 'rate',
    baseSymbol: 'EUR/m',
    displaySymbol: '€/m',
    isDerived: true,
  },
  {
    symbol: 'EUR/km',
    aliases: ['€/km'],
    category: 'rate',
    baseSymbol: 'EUR/m',
    displaySymbol: '€/km',
    isDerived: true,
  },
  {
    symbol: 'EUR/min',
    aliases: ['€/min'],
    category: 'rate',
    baseSymbol: 'EUR/s',
    displaySymbol: '€/min',
    isDerived: true,
  },
]

// ─── Lookup index (built once at module load) ─────────────────────────────────

const SUPERSCRIPT_TO_ASCII: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
}

function normalizeSuperscripts(raw: string): string {
  return raw.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (char) => SUPERSCRIPT_TO_ASCII[char] ?? char)
}

const UNIT_BY_LOOKUP_KEY = new Map<string, UnitDefinition>()

function registerLookupKey(key: string, def: UnitDefinition): void {
  if (key.length === 0) return
  UNIT_BY_LOOKUP_KEY.set(key, def)
  const normalized = normalizeSuperscripts(key)
  if (normalized !== key) UNIT_BY_LOOKUP_KEY.set(normalized, def)
}

for (const def of UNIT_DEFINITIONS) {
  registerLookupKey(def.symbol, def)
  registerLookupKey(def.displaySymbol, def)
  for (const alias of def.aliases ?? []) {
    registerLookupKey(alias, def)
  }
}

/** O(1) lookup by symbol, alias, or displaySymbol (e.g. `€/kg`). */
export function lookupUnit(raw: string): UnitDefinition | null {
  const trimmed = raw.trim()
  if (trimmed.length === 0) return null
  return UNIT_BY_LOOKUP_KEY.get(trimmed) ?? null
}

/** Registry match for dropped palette badges and tokenized input. */
export function findUnitDefinition(raw: string): UnitDefinition | null {
  const trimmed = raw.trim()
  if (trimmed.length === 0) return null
  return lookupUnit(trimmed) ?? lookupUnit(normalizeSuperscripts(trimmed))
}

export function findUnitDefinitionBySymbol(symbol: string): UnitDefinition | undefined {
  return UNIT_DEFINITIONS.find((def) => def.symbol === symbol)
}

// ─── Binary Operator ─────────────────────────────────────────────────────────

export type BinaryOperator = '+' | '-' | '*' | '/'

export function isBinaryOperator(value: string): value is BinaryOperator {
  return value === '+' || value === '-' || value === '*' || value === '/'
}

// ─── Binary Rules ─────────────────────────────────────────────────────────────

/**
 * [left, operator, right, result]
 * Entries are checked in order; first match wins.
 */
export type BinaryRule = readonly [
  left: UnitCategory,
  operator: BinaryOperator,
  right: UnitCategory,
  result: UnitCategory,
]

export const ALLOWED_BINARY_RULES: readonly BinaryRule[] = [
  // ── Pure numbers (dimensionless) ────────────────────────────────────────────
  ['dimensionless', '+', 'dimensionless', 'dimensionless'],
  ['dimensionless', '-', 'dimensionless', 'dimensionless'],
  ['dimensionless', '*', 'dimensionless', 'dimensionless'],
  ['dimensionless', '/', 'dimensionless', 'dimensionless'],

  // ── Geometry ────────────────────────────────────────────────────────────────
  ['length', '*', 'length', 'area'], // 4 m × 3 m → 12 m²
  ['area', '*', 'length', 'volume'], // 6 m² × 2 m → 12 m³
  ['length', '*', 'area', 'volume'], // 2 m × 6 m² → 12 m³
  ['area', '/', 'length', 'length'], // 12 m² / 3 m → 4 m
  ['volume', '/', 'length', 'area'], // 12 m³ / 3 m → 4 m²
  ['volume', '/', 'area', 'length'], // 12 m³ / 4 m² → 3 m

  // ── Density ─────────────────────────────────────────────────────────────────
  ['mass', '/', 'volume', 'density'], // 8 kg / 2 m³ → 4 kg/m³
  ['mass', '/', 'capacity', 'density'], // 8 kg / 2 l  → 4 kg/l
  ['density', '*', 'volume', 'mass'], // 4 kg/m³ × 2 m³ → 8 kg
  ['density', '*', 'capacity', 'mass'], // 4 kg/l  × 2 l  → 8 kg
  ['volume', '*', 'density', 'mass'], // 2 m³ × 4 kg/m³ → 8 kg
  ['mass', '/', 'density', 'volume'], // 8 kg / 4 kg/m³ → 2 m³

  // ── Kinematics ──────────────────────────────────────────────────────────────
  ['length', '/', 'time', 'speed'], // 120 km / 2 h → 60 km/h
  ['speed', '*', 'time', 'length'], // 60 km/h × 2 h → 120 km
  ['time', '*', 'speed', 'length'], // 2 h × 60 km/h → 120 km

  // ── Power / Energy ──────────────────────────────────────────────────────────
  ['power', '*', 'time', 'energy'], // 5 kW × 3 h → 15 kWh
  ['time', '*', 'power', 'energy'], // 3 h × 5 kW → 15 kWh
  ['energy', '/', 'time', 'power'], // 15 kWh / 3 h → 5 kW

  // ── Capacity ↔ Volume (explicitly compatible for addition) ─────────────────
  ['capacity', '+', 'volume', 'volume'], // 500 ml + 0.5 l → volume
  ['volume', '+', 'capacity', 'volume'],

  // ── Money ÷ Quantity → Rate ─────────────────────────────────────────────────
  ['money', '/', 'mass', 'rate'], // 540 € / 90 kg  → €/kg
  ['money', '/', 'area', 'rate'], // 300 € / 50 m²  → €/m²
  ['money', '/', 'capacity', 'rate'], // 120 € / 40 l   → €/l
  ['money', '/', 'energy', 'rate'], // 80 € / 100 kWh → €/kWh
  ['money', '/', 'length', 'rate'], // 60 € / 10 m    → €/m
  ['money', '/', 'time', 'rate'], // 200 € / 8 h    → €/h
  ['money', '/', 'count', 'rate'], // 540 € / 15 Stk → €/Stk
  ['money', '/', 'volume', 'rate'], // 300 € / 60 m³  → €/m³

  // ── Rate × Quantity → Money ─────────────────────────────────────────────────
  ['rate', '*', 'mass', 'money'], // 6 €/kg  × 90 kg  → 540 €
  ['rate', '*', 'area', 'money'], // 6 €/m²  × 50 m²  → 300 €
  ['rate', '*', 'capacity', 'money'], // 3 €/l   × 40 l   → 120 €
  ['rate', '*', 'energy', 'money'], // 0.8 €/kWh × 100 → 80 €
  ['rate', '*', 'length', 'money'], // 6 €/m   × 10 m   → 60 €
  ['rate', '*', 'time', 'money'], // 25 €/h  × 8 h    → 200 €
  ['rate', '*', 'count', 'money'], // 8.5 €/Stk × 15   → 127.5 €
  ['rate', '*', 'volume', 'money'], // 5 €/m³  × 60 m³  → 300 €
  // mirror: quantity × rate → money (BWL: Menge × Preis)
  ['length', '*', 'rate', 'money'],
  ['time', '*', 'rate', 'money'],
  ['count', '*', 'rate', 'money'], // 15 Stk × 8.50 €/Stk → 127.5 €
  ['mass', '*', 'rate', 'money'], // 90 kg × 6 €/kg → 540 €
  ['area', '*', 'rate', 'money'], // 14 m² × 45 €/m² → 630 €
  ['volume', '*', 'rate', 'money'],
  ['capacity', '*', 'rate', 'money'],
  ['energy', '*', 'rate', 'money'], // 280.5 kWh × 0.26 €/kWh → 72.93 €

  // ── Count / Productivity ────────────────────────────────────────────────────
  ['count', '/', 'time', 'rate'], // 120 Stk / 8 h  → rate (15 Stk/h)

  // ── Scalar × quantity (BWL: 40 × 8.50 € → 340 €; 15 h × 30 → 450 h) ────────
  ['dimensionless', '*', 'money', 'money'],
  ['money', '*', 'dimensionless', 'money'],
  ['dimensionless', '*', 'length', 'length'],
  ['length', '*', 'dimensionless', 'length'],
  ['dimensionless', '*', 'area', 'area'],
  ['area', '*', 'dimensionless', 'area'],
  ['dimensionless', '*', 'volume', 'volume'],
  ['volume', '*', 'dimensionless', 'volume'],
  ['dimensionless', '*', 'capacity', 'capacity'],
  ['capacity', '*', 'dimensionless', 'capacity'],
  ['dimensionless', '*', 'mass', 'mass'],
  ['mass', '*', 'dimensionless', 'mass'],
  ['dimensionless', '*', 'time', 'time'],
  ['time', '*', 'dimensionless', 'time'],
  ['dimensionless', '*', 'count', 'count'],
  ['count', '*', 'dimensionless', 'count'],
  ['dimensionless', '*', 'power', 'power'],
  ['power', '*', 'dimensionless', 'power'],
  ['dimensionless', '*', 'energy', 'energy'],
  ['energy', '*', 'dimensionless', 'energy'],
  // ── Quantity ÷ scalar → quantity (100 km / 2 → 50 km) ──────────────────────
  ['money', '/', 'dimensionless', 'money'],
  ['length', '/', 'dimensionless', 'length'],
  ['area', '/', 'dimensionless', 'area'],
  ['volume', '/', 'dimensionless', 'volume'],
  ['capacity', '/', 'dimensionless', 'capacity'],
  ['mass', '/', 'dimensionless', 'mass'],
  ['time', '/', 'dimensionless', 'time'],
  ['count', '/', 'dimensionless', 'count'],
  ['power', '/', 'dimensionless', 'power'],
  ['energy', '/', 'dimensionless', 'energy'],

  // ── Percentage scaling ──────────────────────────────────────────────────────
  ['money', '*', 'percentage', 'money'], // 400 € × 24%  → 96 €
  ['percentage', '*', 'money', 'money'], // commutative: % × € → €
  ['dimensionless', '*', 'percentage', 'dimensionless'], // 320 × 19% → 60.8
  ['percentage', '*', 'dimensionless', 'dimensionless'], // commutative

  // ── Ratio / dimensionless scaling ───────────────────────────────────────────
  ['money', '*', 'ratio', 'money'], // 400 € × 1.24      → 496 €
  ['ratio', '*', 'money', 'money'], // 1.24 × 400 €      → 496 €
  ['mass', '*', 'ratio', 'mass'], // 500 kg × 0.8      → 400 kg
  ['ratio', '*', 'mass', 'mass'], // 0.8 × 500 kg      → 400 kg
  ['length', '*', 'ratio', 'length'], // 20 m × 0.5        → 10 m
  ['ratio', '*', 'length', 'length'], // 0.5 × 20 m        → 10 m
  ['area', '*', 'ratio', 'area'], // 100 m² × 0.2      → 20 m²
  ['ratio', '*', 'area', 'area'], // 0.2 × 100 m²      → 20 m²
  ['count', '*', 'ratio', 'count'], // 50 pcs × 0.1      → 5 pcs
  ['ratio', '*', 'count', 'count'], // 0.1 × 50 pcs      → 5 pcs
  ['power', '*', 'ratio', 'power'], // 10 kW × 0.8       → 8 kW
  ['ratio', '*', 'power', 'power'], // 0.8 × 10 kW       → 8 kW
  ['energy', '*', 'ratio', 'energy'], // 200 kWh × 0.75    → 150 kWh
  ['ratio', '*', 'energy', 'energy'], // 0.75 × 200 kWh    → 150 kWh
]
/**
 * Returns the result category when applying `operator` to `left` and `right`,
 * or null when no rule matches (invalid combination).
 */
export function applyBinaryRule(
  left: UnitCategory,
  operator: BinaryOperator,
  right: UnitCategory,
): UnitCategory | null {
  // Same-category additive ops always produce same category (4 kg + 2 kg = 6 kg).
  if (left === right && (operator === '+' || operator === '-')) return left

  for (const rule of ALLOWED_BINARY_RULES) {
    if (rule[0] === left && rule[1] === operator && rule[2] === right) {
      return rule[3]
    }
  }
  return null
}
