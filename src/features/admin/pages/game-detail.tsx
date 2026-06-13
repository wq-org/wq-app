import { useParams } from 'react-router-dom'

import { GameReadOnlyDetail } from '@/features/game-studio'

import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'

export function AdminGameDetailPage() {
  const { gameId } = useParams<{ gameId: string }>()

  return (
    <AdminWorkspaceShell>
      <div className="flex w-full flex-col gap-6 px-4 py-8">
        <GameReadOnlyDetail gameId={gameId} />
      </div>
    </AdminWorkspaceShell>
  )
}
