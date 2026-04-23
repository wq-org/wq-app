import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getToolbarButtonClassName } from './editorToolbarActions'

type ToolbarIconButtonProps = {
  icon: LucideIcon
  isActive?: boolean
  label: string
  onClick: () => void
}

export const ToolbarIconButton = ({
  icon: Icon,
  isActive = false,
  label,
  onClick,
}: ToolbarIconButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={getToolbarButtonClassName(isActive)}
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClick}
        >
          <Icon className="size-4" />
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}
