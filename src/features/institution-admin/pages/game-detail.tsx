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

import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'

const GAMES_BASE_PATH = '/institution_admin/games'

export function InstitutionAdminGameDetailPage() {
  const { gameId } = useParams<{ gameId: string }>()

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8">
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
    </InstitutionAdminWorkspaceShell>
  )
}
