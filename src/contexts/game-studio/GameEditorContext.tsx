import { createContext, useContext, useCallback } from 'react';

interface GameEditorContextValue {
  registerGetGameData: (getData: () => unknown) => void;
}

const GameEditorContext = createContext<GameEditorContextValue | null>(null);

export type GetGameDataRef = React.MutableRefObject<(() => unknown) | null>;

interface GameEditorProviderProps {
  children: React.ReactNode;
  getGameDataRef: GetGameDataRef;
}

export function GameEditorProvider({ children, getGameDataRef }: GameEditorProviderProps) {
  const registerGetGameData = useCallback(
    (getData: () => unknown) => {
      getGameDataRef.current = getData;
    },
    [getGameDataRef]
  );

  return (
    <GameEditorContext.Provider value={{ registerGetGameData }}>
      {children}
    </GameEditorContext.Provider>
  );
}

export function useGameEditorContext(): GameEditorContextValue | null {
  return useContext(GameEditorContext);
}
