import { useState } from 'react';
import { LayoutDashboard, Settings } from 'lucide-react';
import GameNodeSettings from './GameNodeSettings';

interface GameNodeLayoutProps {
  nodeId?: string;
  gameComponent?: React.ComponentType;
  overviewContent?: React.ReactNode;
  onDelete?: () => void;
  showDelete?: boolean;
}

export default function GameNodeLayout({
  nodeId,
  gameComponent: GameComponent,
  overviewContent,
  onDelete,
  showDelete = false,
}: GameNodeLayoutProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

  return (
    <div className="mt-4">
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
            {overviewContent ? (
              overviewContent
            ) : GameComponent ? (
              <GameComponent />
            ) : (
              <div className="text-muted-foreground">No game component available</div>
            )}
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-4">
            <GameNodeSettings nodeId={nodeId} />
            {showDelete && onDelete && (
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={onDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete Node
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

