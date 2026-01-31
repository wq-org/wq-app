import { createContext, useContext } from 'react';

interface GameNodePointsContextValue {
  points?: number;
  onPointsChange?: (points: number) => void;
}

export const GameNodePointsContext = createContext<GameNodePointsContextValue>({
  points: undefined,
  onPointsChange: undefined,
});

export const useGameNodePoints = () => useContext(GameNodePointsContext);
