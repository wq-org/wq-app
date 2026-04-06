import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Building2, Plus } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useUser } from '@/contexts/user'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Logo } from '@/components/ui/logo'
import { DEFAULT_INSTITUTION_IMAGE } from '@/lib/constants'

import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'
import { useInstitutions } from '../hooks/useInstitutions'
import type { InstitutionStatus } from '../types/institution.types'

const STATUS_VARIANT: Record<
  InstitutionStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  active: 'default',
  pending: 'outline',
  inactive: 'secondary',
  suspended: 'destructive',
}

const AdminInstitution = () => {
  const navigate = useNavigate()
  const { getRole } = useUser()
  const { t } = useTranslation('features.admin')
  const { institutions, isLoading, error } = useInstitutions()

  const role = getRole()

  useEffect(() => {
    if (error) {
      toast.error(t('institutions.toasts.loadError'), { description: error })
    }
  }, [error, t])

  return (
    <AdminWorkspaceShell>
      <div className="flex flex-col gap-6 py-8 px-4 animate-in fade-in-0 slide-in-from-bottom-4">
        <div className="flex items-center justify-between animate-in fade-in-0 slide-in-from-bottom-3">
          <h1 className="text-2xl font-semibold text-gray-900">{t('institutions.pageTitle')}</h1>
          <Button
            variant="outline"
            onClick={() => navigate(`/${role}/institution/new-institution`)}
            className="active:animate-in active:zoom-in-95"
          >
            <Plus className="size-4" />
            {t('institutions.newButton')}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Spinner
              variant="gray"
              size="sm"
              speed={1750}
            />
          </div>
        ) : institutions.length === 0 ? (
          <Empty>
            <EmptyMedia variant="icon">
              <Building2 />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{t('institutions.empty.title')}</EmptyTitle>
              <EmptyDescription>{t('institutions.empty.description')}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="outline"
                onClick={() => navigate(`/${role}/institution/new-institution`)}
                className="active:animate-in active:zoom-in-95"
              >
                {t('institutions.empty.action')}
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="rounded-lg border animate-in fade-in-0 slide-in-from-bottom-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('institutions.table.name')}</TableHead>
                  <TableHead>{t('institutions.table.slug')}</TableHead>
                  <TableHead>{t('institutions.table.type')}</TableHead>
                  <TableHead>{t('institutions.table.email')}</TableHead>
                  <TableHead>{t('institutions.table.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {institutions.map((inst) => (
                  <TableRow
                    key={inst.id}
                    className="animate-in fade-in-0 slide-in-from-bottom-2"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={inst.imageUrl ?? DEFAULT_INSTITUTION_IMAGE}
                            alt={`${inst.name} logo`}
                          />
                          <AvatarFallback>
                            <Logo
                              showText={false}
                              className="h-5 w-5"
                            />
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{inst.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[320px] truncate">{inst.slug ?? '—'}</TableCell>
                    <TableCell className="capitalize">{inst.type ?? '—'}</TableCell>
                    <TableCell>{inst.email ?? '—'}</TableCell>
                    <TableCell>
                      {inst.status ? (
                        <Badge variant={STATUS_VARIANT[inst.status] ?? 'outline'}>
                          {t(`form.statuses.${inst.status}`)}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminWorkspaceShell>
  )
}

export { AdminInstitution }
