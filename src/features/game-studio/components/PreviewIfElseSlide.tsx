import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import GameInformationCard from '@/features/games/components/GameInformationCard'
import { cn } from '@/lib/utils'

interface PreviewIfElseSlideProps {
  title?: string
  description?: string
  condition?: string
  correctPath?: 'A' | 'B'
  branches?: {
    A?: string
    B?: string
  }
}

function BranchRow({
  label,
  destination,
  active,
}: {
  label: 'A' | 'B'
  destination?: string
  active: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg border px-3 py-2',
        active && 'border-primary/40 bg-primary/5',
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Badge variant={active ? 'default' : 'outline'}>Path {label}</Badge>
        <span className="text-sm text-foreground truncate">
          {destination && destination.trim() ? destination : 'Not connected'}
        </span>
      </div>
      {active && <Badge variant="secondary">Correct route</Badge>}
    </div>
  )
}

export function PreviewIfElseSlide({
  title,
  description,
  condition,
  correctPath = 'A',
  branches,
}: PreviewIfElseSlideProps) {
  const displayTitle = title?.trim() || 'If / else'
  const displayDescription = description?.trim() || ''
  const displayCondition = condition?.trim() || ''

  return (
    <div className="space-y-6">
      <GameInformationCard
        title={displayTitle}
        description={displayDescription}
      />
      <Card>
        <CardHeader className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Routing Logic
          </p>
          <p className="text-sm text-foreground">This node chooses the next slide based on:</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Condition</p>
            {displayCondition ? (
              <div className="rounded-md border bg-muted px-3 py-2 text-sm text-foreground">
                {displayCondition}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No condition set yet.</p>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Outgoing paths</p>
            <BranchRow
              label="A"
              destination={branches?.A}
              active={correctPath === 'A'}
            />
            <BranchRow
              label="B"
              destination={branches?.B}
              active={correctPath === 'B'}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
