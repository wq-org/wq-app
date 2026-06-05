export type WorkspaceInitialTab = 'editor' | 'preview'

export type WorkspaceNavigationState = {
  initialTab?: WorkspaceInitialTab
}

export function resolveWorkspaceInitialTab(state: unknown): WorkspaceInitialTab {
  const tab = (state as WorkspaceNavigationState | null)?.initialTab
  return tab === 'preview' ? 'preview' : 'editor'
}

export function workspacePreviewNavigationState(): WorkspaceNavigationState {
  return { initialTab: 'preview' }
}
