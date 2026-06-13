import { useParams } from 'react-router-dom'

import { GameReadOnlyDetail } from '@/features/game-studio'

import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'

export function InstitutionAdminGameDetailPage() {
  const { gameId } = useParams<{ gameId: string }>()

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
        <GameReadOnlyDetail gameId={gameId} />
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}
