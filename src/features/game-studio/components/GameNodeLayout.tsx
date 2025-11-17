import { useState } from 'react';
import { LayoutDashboard, Settings } from 'lucide-react';
import GameNodeSettings from './GameNodeSettings';

interface GameNodeLayoutProps {
  nodeId?: string;
  gameComponent: React.ComponentType | undefined;
  gameTitle: string;
  onBack: () => void;
}

export default function GameNodeLayout({
  nodeId,
  gameComponent: GameComponent,
  gameTitle,
  onBack,
}: GameNodeLayoutProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

  return (
    <div className="mt-4">
      <button
        onClick={onBack}
        className="mb-4 text-sm text-primary hover:underline"
      >
        ← Back to options
      </button>

      {/* Game Title */}
      <h2 className="text-2xl font-semibold mb-2">{gameTitle}</h2>

      {/* Tabs */}
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

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div>
            {GameComponent ? <GameComponent /> : <div>No game component selected</div>}
          </div>
        )}
        {activeTab === 'settings' && (
          <GameNodeSettings nodeId={nodeId} />
        )}
      </div>
    </div>
  );
}
