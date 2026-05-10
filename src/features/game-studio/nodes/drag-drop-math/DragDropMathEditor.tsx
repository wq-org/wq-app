import { Text } from '@/components/ui/text'

export type DragDropMathEditorProps = {
  nodeId: string
}

export function DragDropMathEditor({ nodeId }: DragDropMathEditorProps) {
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
