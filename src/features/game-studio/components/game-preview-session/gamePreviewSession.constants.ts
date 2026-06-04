/** Scroll target for the active gameplay segment inside a continuous preview session. */
export const GAME_PREVIEW_GAMEPLAY_ANCHOR_ATTR = 'data-if-else-gameplay-anchor'

export const GAME_PREVIEW_GAMEPLAY_ANCHOR_SELECTOR = `[${GAME_PREVIEW_GAMEPLAY_ANCHOR_ATTR}]`

/** Wrapper for a newly mounted segment (divider, branch node, full-game step, etc.). */
export const GAME_PREVIEW_SEGMENT_ANCHOR_ATTR = 'data-if-else-segment-anchor'

export const GAME_PREVIEW_SEGMENT_ANCHOR_SELECTOR = `[${GAME_PREVIEW_SEGMENT_ANCHOR_ATTR}]`

/** Trailing sentinel for follow-scroll to bottom of session content. */
export const GAME_PREVIEW_SCROLL_END_ATTR = 'data-if-else-scroll-end'

export const GAME_PREVIEW_SCROLL_END_SELECTOR = `[${GAME_PREVIEW_SCROLL_END_ATTR}]`

/** @deprecated Use GAME_PREVIEW_* names; kept for if-else re-exports. */
export const IF_ELSE_GAMEPLAY_ANCHOR_ATTR = GAME_PREVIEW_GAMEPLAY_ANCHOR_ATTR
export const IF_ELSE_GAMEPLAY_ANCHOR_SELECTOR = GAME_PREVIEW_GAMEPLAY_ANCHOR_SELECTOR
export const IF_ELSE_SEGMENT_ANCHOR_ATTR = GAME_PREVIEW_SEGMENT_ANCHOR_ATTR
export const IF_ELSE_SEGMENT_ANCHOR_SELECTOR = GAME_PREVIEW_SEGMENT_ANCHOR_SELECTOR
