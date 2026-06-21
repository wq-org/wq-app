import { Link, useParams } from 'react-router-dom'

import { GameReadOnlyDetail } from '@/features/game-studio'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'

const GAMES_BASE_PATH = '/super_admin/games'

export function AdminGameDetailPage() {
  const { gameId } = useParams<{ gameId: string }>()

  return (
    <AdminWorkspaceShell>
      <div className="flex w-full flex-col gap-4 px-4 py-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={GAMES_BASE_PATH}>Games</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Game</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <GameReadOnlyDetail gameId={gameId} />
      </div>
    </AdminWorkspaceShell>
  )
}
