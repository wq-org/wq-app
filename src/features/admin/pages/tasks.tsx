import { Text } from '@/components/ui/text'

import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'

export function AdminTasksPage() {
  return (
    <AdminWorkspaceShell>
      <div className="container py-10">
        <Text
          as="h1"
          variant="h1"
          className="text-2xl font-bold"
        >
          Tasks
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
    </AdminWorkspaceShell>
  )
}
