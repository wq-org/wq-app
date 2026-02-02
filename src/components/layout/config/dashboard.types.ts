export type Roles = 'superAdmin' | 'institutionAdmin' | 'teacher' | 'student'

/**
 * View-specific command bar contexts.
 * Extend when adding a new view with its own bar: add the id here, add the group in commandBarGroups, and add it to COMMAND_BAR_VIEW_IDS in CommandPalette.
 */
export type CommandBarView = 'game-studio'

/** Role-based or view-based context for the command bar. Use role for default bar, view for screen-specific bar. */
export type CommandBarContext = Roles | CommandBarView
