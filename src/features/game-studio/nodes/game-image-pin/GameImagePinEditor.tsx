import { Text } from '@/components/ui/text'

export type GameImagePinEditorProps = {
  nodeId: string
}

export function GameImagePinEditor({ nodeId }: GameImagePinEditorProps) {
  return (
    <Text
      as="p"
      variant="body"
      className="text-sm text-muted-foreground"
    >
      Editor – {nodeId}
    </Text>
  )
}
