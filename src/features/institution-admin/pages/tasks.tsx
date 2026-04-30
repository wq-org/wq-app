import { Text } from '@/components/ui/text'

import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'

export function InstitutionAdminTasksPage() {
  return (
    <InstitutionAdminWorkspaceShell>
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
    </InstitutionAdminWorkspaceShell>
  )
}
