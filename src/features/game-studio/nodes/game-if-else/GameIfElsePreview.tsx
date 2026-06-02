import { Text } from '@/components/ui/text'

export type GameIfElsePreviewProps = {
  nodeId: string
}

export function GameIfElsePreview({ nodeId }: GameIfElsePreviewProps) {
  return (
    <Text
      as="p"
      variant="body"
      className="text-sm text-muted-foreground"
    >
      Preview – {nodeId}
    </Text>
  )
}
