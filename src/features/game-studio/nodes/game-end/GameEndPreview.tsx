import { Text } from '@/components/ui/text'

export type GameEndPreviewProps = {
  nodeId: string
}

export function GameEndPreview({ nodeId }: GameEndPreviewProps) {
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
