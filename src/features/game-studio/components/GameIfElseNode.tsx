import { Handle, Position } from '@xyflow/react'
import { Split } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { GameIfElseNodeProps } from '../types/game-studio.types'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

const MAX_LABEL_LENGTH = 24

export function GameIfElseNode({ data, selected }: GameIfElseNodeProps) {
  const { t } = useTranslation('features.gameStudio')
  const fullLabel = data?.label || (data as GameIfElseNodeProps['data'])?.title || 'If / else'
  const displayLabel =
    fullLabel.length > MAX_LABEL_LENGTH ? `${fullLabel.slice(0, MAX_LABEL_LENGTH)}…` : fullLabel
  const routeLabel =
    data?.correctPath === 'B'
      ? t('common.nodeB')
      : data?.correctPath === 'A'
        ? t('common.nodeA')
        : null

  return (
    <div
      className={`relative flex items-center gap-3 px-4 py-3 bg-white rounded-3xl min-w-[180px] cursor-pointer hover:shadow-md transition-shadow animate-in fade-in-0 slide-in-from-bottom-2 ${
        selected ? 'border-2 border-gray-300 animate-in zoom-in-95' : ''
      }`}
      onClick={data?.onClick}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3! h-3! bg-orange-500! border-2! border-white!"
        id="left"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="p-2 rounded-lg border border-blue-500/20 bg-orange-500/10 flex items-center justify-center shrink-0">
        <Split className="w-4 h-4 text-orange-500" />
      </div>
      <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
        <Tooltip>
          <TooltipTrigger asChild>
            <Text
              as="span"
              variant="small"
              className="text-gray-900 font-medium truncate block"
              title={fullLabel}
            >
              {displayLabel}
            </Text>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            sideOffset={6}
          >
            {fullLabel}
          </TooltipContent>
        </Tooltip>
        {routeLabel && (
          <Text
            as="span"
            variant="small"
            className="text-xs text-gray-500 truncate block"
          >
            {t('ifElseDialog.correctRouteLabel', { node: routeLabel })}
          </Text>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3! h-3! bg-orange-500! border-2! border-white!"
        id="right-top"
        onClick={(e) => e.stopPropagation()}
        style={{ top: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3! h-3! bg-orange-500! border-2! border-white!"
        id="right-bottom"
        onClick={(e) => e.stopPropagation()}
        style={{ top: '70%' }}
      />
    </div>
  )
}
