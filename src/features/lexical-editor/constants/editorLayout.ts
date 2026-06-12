/** TOC rail width in the note editor aside (`w-26`). */
export const NOTE_EDITOR_TOC_WIDTH = '6.5rem'

/** Horizontal padding on the note editor content shell (`px-4` × 2). */
export const NOTE_EDITOR_SHELL_PADDING = '2rem'

/** Primary prose column — scales with viewport, capped for readability. */
export const NOTE_EDITOR_PROSE_WIDTH = 'min(48rem, calc(100vw - 6rem))'

/** Max width for note editor shell: prose + optional TOC + shell padding. */
export const NOTE_EDITOR_SHELL_MAX_WIDTH = `min(100%, calc(${NOTE_EDITOR_PROSE_WIDTH} + ${NOTE_EDITOR_TOC_WIDTH} + ${NOTE_EDITOR_SHELL_PADDING}))`
