import { AppShell } from '@/components/layout'
import { Text } from '@/components/ui/text'

export function TeacherFilesPage() {
  return (
    <AppShell role="teacher">
      <div className="container py-10">
        <Text
          as="h1"
          variant="h1"
          className="text-2xl font-bold"
        >
          Files
        </Text>
        <Text
          as="p"
          variant="body"
          color="muted"
          className="mt-2"
        >
          Coming soon.
        </Text>
      </div>
    </AppShell>
  )
}
