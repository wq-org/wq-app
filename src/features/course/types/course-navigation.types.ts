export type WorkspaceInitialTab = 'editor' | 'preview' | 'settings'

export type WorkspaceNavigationState = {
  initialTab?: WorkspaceInitialTab
}

export function resolveWorkspaceInitialTab(state: unknown): WorkspaceInitialTab {
  const tab = (state as WorkspaceNavigationState | null)?.initialTab
  if (tab === 'preview') return 'preview'
  if (tab === 'settings') return 'settings'
  return 'editor'
}

export function workspacePreviewNavigationState(): WorkspaceNavigationState {
  return { initialTab: 'preview' }
}

export function workspaceSettingsNavigationState(): WorkspaceNavigationState {
  return { initialTab: 'settings' }
}
