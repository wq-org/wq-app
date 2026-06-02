import { Text } from '@/components/ui/text'

export type OpenQuestionEditorProps = {
  nodeId: string
}

export function OpenQuestionEditor({ nodeId }: OpenQuestionEditorProps) {
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
