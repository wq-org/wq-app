import { Text } from '@/components/ui/text'

export type GameIfElseEditorProps = {
  nodeId: string
}

export function GameIfElseEditor({ nodeId }: GameIfElseEditorProps) {
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
