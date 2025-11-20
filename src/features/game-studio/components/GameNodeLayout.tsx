import { useState } from 'react';
import { LayoutDashboard, Settings } from 'lucide-react';
import GameNodeSettings from './GameNodeSettings';
import { Button } from '@/components/ui/button';
import { GameNodePointsContext } from '../contexts/GameNodePointsContext';

interface GameNodeLayoutProps {
  nodeId?: string;
  gameComponent?: React.ComponentType;
  overviewContent?: React.ReactNode;
  onDelete?: () => void;
  showDelete?: boolean;
  points?: number;
  onPointsChange?: (points: number) => void;
  hideSettingsTab?: boolean;
}

export default function GameNodeLayout({
  nodeId,
  gameComponent: GameComponent,
  overviewContent,
  onDelete,
  showDelete = false,
  points,
  onPointsChange,
  hideSettingsTab = false,
}: GameNodeLayoutProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

  return (
    <div className="mt-4">
      {/* Tabs */}
      {!hideSettingsTab && (
        <div className="flex gap-12 border-b mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`text-xl border-b-2 flex gap-2 items-center pb-2 cursor-pointer transition-colors ${
              activeTab === 'overview'
                ? 'text-black border-black font-medium'
                : 'text-black/40 hover:text-black/60 border-transparent'
            }`}
          >
            <LayoutDashboard className={activeTab === 'overview' ? 'text-black' : 'text-black/40'} />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`text-xl border-b-2 flex gap-2 items-center pb-2 cursor-pointer transition-colors ${
              activeTab === 'settings'
                ? 'text-black border-black font-medium'
                : 'text-black/40 hover:text-black/60 border-transparent'
            }`}
          >
            <Settings className={activeTab === 'settings' ? 'text-black' : 'text-black/40'} />
            <span>Settings</span>
          </button>
        </div>
      )}

      {/* Tab Content */}
      <div>
        {(activeTab === 'overview' || hideSettingsTab) && (
          <div className="flex flex-col gap-6">
            {overviewContent && (
              <div>{overviewContent}</div>
            )}
            {GameComponent && (
              <div>
                {overviewContent && <div className="border-t pt-6 mt-6" />}
                <GameNodePointsContext.Provider value={{ points, onPointsChange }}>
                  <GameComponent />
                </GameNodePointsContext.Provider>
              </div>
            )}
            {!overviewContent && !GameComponent && (
              <div className="text-muted-foreground">No content available</div>
            )}
          </div>
        )}
        {!hideSettingsTab && activeTab === 'settings' && (
          <div className="flex flex-col gap-4">
            <GameNodeSettings nodeId={nodeId} />
          </div>
        )}
      </div>
    </div>
  );
}

