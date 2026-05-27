import { Text } from '@/components/ui/text'

export type OpenQuestionPreviewProps = {
  nodeId: string
}

export function OpenQuestionPreview({ nodeId }: OpenQuestionPreviewProps) {
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
