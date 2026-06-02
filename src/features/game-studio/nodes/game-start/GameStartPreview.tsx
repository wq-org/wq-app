import { Text } from '@/components/ui/text'

export type GameStartPreviewProps = {
  nodeId: string
}

export function GameStartPreview({ nodeId }: GameStartPreviewProps) {
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
