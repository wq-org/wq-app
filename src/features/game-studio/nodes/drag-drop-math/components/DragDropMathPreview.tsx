import { Text } from '@/components/ui/text'

export type DragDropMathPreviewProps = {
  nodeId: string
}

export function DragDropMathPreview({ nodeId }: DragDropMathPreviewProps) {
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
