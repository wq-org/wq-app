export type FloatingToolbarFeatureKey =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'code'
  | 'link'
  | 'comment'
  | 'highlight'

export type FloatingToolbarFeatures = Record<FloatingToolbarFeatureKey, boolean>

export const DEFAULT_FLOATING_TOOLBAR_FEATURES: FloatingToolbarFeatures = {
  bold: true,
  italic: true,
  underline: true,
  strikethrough: true,
  code: true,
  link: true,
  comment: true,
  highlight: true,
}

/** Game node / embedded surfaces: no lesson comment marks. */
export const EMBEDDED_FLOATING_TOOLBAR_FEATURES: FloatingToolbarFeatures = {
  ...DEFAULT_FLOATING_TOOLBAR_FEATURES,
  comment: false,
}

export function resolveFloatingToolbarFeatures(
  partial?: Partial<FloatingToolbarFeatures>,
): FloatingToolbarFeatures {
  return { ...DEFAULT_FLOATING_TOOLBAR_FEATURES, ...partial }
}
