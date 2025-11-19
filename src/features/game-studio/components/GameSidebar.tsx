import { useState } from 'react';
import {
  Search,
  Square,
  StickyNote,
  Image as ImageIcon,
  MapPin,
  GitBranch,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'node' | 'logic';
  nodeType: string;
}

const nodeItems: SidebarItem[] = [
  {
    id: 'end',
    label: 'End Node',
    icon: Square,
    category: 'node',
    nodeType: 'gameEnd',
  },
  {
    id: 'paragraph',
    label: 'Paragraph',
    icon: StickyNote,
    category: 'node',
    nodeType: 'gameParagraph',
  },
  {
    id: 'image-terms',
    label: 'Image and Terms',
    icon: ImageIcon,
    category: 'node',
    nodeType: 'gameImageTerms',
  },
  {
    id: 'image-pin',
    label: 'Image and Pin',
    icon: MapPin,
    category: 'node',
    nodeType: 'gameImagePin',
  },
];

const logicItems: SidebarItem[] = [
  {
    id: 'if-else',
    label: 'If / else',
    icon: GitBranch,
    category: 'logic',
    nodeType: 'gameIfElse',
  },
];

export default function GameSidebar() {
  const [searchQuery, setSearchQuery] = useState('');

  const onDragStart = (event: React.DragEvent, item: SidebarItem) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: item.nodeType,
      label: item.label,
      nodeId: item.id,
    }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredNodeItems = nodeItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogicItems = logicItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="absolute left-4 top-4 z-10 w-64">
      <div className="flex flex-col w-full bg-white border border-border rounded-2xl shadow-lg">
        {/* Search Bar */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Insert node..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Nodes Section */}
          {filteredNodeItems.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Nodes
              </h3>
              <div className="space-y-1">
                {filteredNodeItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, item)}
                      className={cn(
                        'w-full justify-start gap-3 px-3 py-2 rounded-lg text-sm h-auto',
                        'cursor-grab active:cursor-grabbing hover:bg-accent transition-colors',
                        'flex items-center'
                      )}
                    >
                      <div className={cn(
                        'flex items-center justify-center h-8 w-8 rounded-full border',
                        'text-gray-500 bg-gray-500/10 border-gray-500/20'
                      )}>
                        <Icon className="h-4 w-4 flex-shrink-0" />
                      </div>
                      <span className="text-foreground">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Logic Section */}
          {filteredLogicItems.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Logic
              </h3>
              <div className="space-y-1">
                {filteredLogicItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, item)}
                      className={cn(
                        'w-full justify-start gap-3 px-3 py-2 rounded-lg text-sm h-auto',
                        'cursor-grab active:cursor-grabbing hover:bg-accent transition-colors',
                        'flex items-center'
                      )}
                    >
                      <div className={cn(
                        'flex items-center justify-center h-8 w-8 rounded-full border',
                        'text-orange-500 bg-orange-500/10 border-orange-500/20'
                      )}>
                        <Icon className="h-4 w-4 flex-shrink-0" />
                      </div>
                      <span className="text-foreground">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Results */}
          {filteredNodeItems.length === 0 && filteredLogicItems.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No results found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
