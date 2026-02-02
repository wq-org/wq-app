import { createContext } from 'react'

export interface GameEditorContextValue {
  registerGetGameData: (getData: () => unknown) => void
}

export type GetGameDataRef = React.MutableRefObject<(() => unknown) | null>

export const GameEditorContext = createContext<GameEditorContextValue | null>(null)
