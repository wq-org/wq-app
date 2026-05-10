import { Text } from '@/components/ui/text'

export type GameEndEditorProps = {
  nodeId: string
}

export function GameEndEditor({ nodeId }: GameEndEditorProps) {
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
