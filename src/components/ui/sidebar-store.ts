import * as React from 'react'

export type SidebarContextValue = {
  open: boolean
  toggleSidebar: () => void
}

export const SidebarContext = React.createContext<SidebarContextValue | null>(null)
