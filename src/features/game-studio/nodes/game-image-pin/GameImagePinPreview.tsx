import { Text } from '@/components/ui/text'

export type GameImagePinPreviewProps = {
  nodeId: string
}

export function GameImagePinPreview({ nodeId }: GameImagePinPreviewProps) {
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
