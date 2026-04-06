import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Building2, Plus } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { VariantProps } from 'class-variance-authority'

import { useUser } from '@/contexts/user'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { badgeVariants } from '@/components/ui/badge-variants'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DEFAULT_INSTITUTION_IMAGE } from '@/lib/constants'

import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'
import { useInstitutions } from '../hooks/useInstitutions'
import type { Institution, InstitutionStatus } from '../types/institution.types'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

const STATUS_VARIANT: Record<InstitutionStatus, BadgeVariant> = {
  active: 'outline',
  pending: 'orange',
  inactive: 'secondary',
  suspended: 'destructive',
}

const MOCK_INSTITUTIONS: Institution[] = [
  {
    id: 'mock-pending-berlin',
    name: 'Berlin Health Academy',
    slug: 'berlin-health-academy',
    type: 'school',
    status: 'pending',
    email: 'onboarding@berlin-health.example',
    imageUrl: null,
    createdAt: new Date('2026-04-06T08:30:00.000Z'),
  },
  {
    id: 'mock-active-hamburg',
    name: 'Hamburg Care Institute',
    slug: 'hamburg-care-institute',
    type: 'university',
    status: 'active',
    email: 'admin@hamburg-care.example',
    imageUrl: null,
    createdAt: new Date('2026-03-22T10:15:00.000Z'),
  },
]

const AdminInstitution = () => {
  const navigate = useNavigate()
  const { getRole } = useUser()
  const { t } = useTranslation('features.admin')
  const { institutions, isLoading, error } = useInstitutions()
  const institutionsForTable = institutions.length > 0 ? institutions : MOCK_INSTITUTIONS

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
            variant="darkblue"
            onClick={() => navigate(`/${role}/institution/new-institution`)}
            className="active:animate-in active:zoom-in-95"
          >
            <Plus className="size-4" />
            {t('institutions.empty.action')}
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
        ) : institutionsForTable.length === 0 ? (
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
          <div className="rounded-2xl border animate-in fade-in-0 slide-in-from-bottom-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('institutions.table.name')}</TableHead>
                  <TableHead>{t('institutions.table.type')}</TableHead>
                  <TableHead>{t('institutions.table.email')}</TableHead>
                  <TableHead>{t('institutions.table.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {institutionsForTable.map((inst) => (
                  <TableRow
                    key={inst.id}
                    className="animate-in fade-in-0 slide-in-from-bottom-2"
                  >
                    <TableCell>
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="flex max-w-full min-w-0 items-center gap-2 rounded-md p-0 text-left font-medium outline-none ring-offset-background hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <Avatar className="h-8 w-8 shrink-0">
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
                            <span className="truncate">{inst.name}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          sideOffset={6}
                          className="max-w-sm text-left"
                        >
                          <div className="flex flex-col gap-1.5">
                            <p>
                              <span className="mr-1.5 text-background/70">
                                {t('institutions.table.slug')}:
                              </span>
                              <span className="break-all font-medium">{inst.slug ?? '—'}</span>
                            </p>
                            <p>
                              <span className="mr-1.5 text-background/70">
                                {t('institutions.table.email')}:
                              </span>
                              <span className="break-all font-medium">{inst.email ?? '—'}</span>
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="capitalize">{inst.type ?? '—'}</TableCell>
                    <TableCell>{inst.email ?? '—'}</TableCell>
                    <TableCell>
                      {inst.status ? (
                        <Badge variant={STATUS_VARIANT[inst.status] ?? 'secondary'}>
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
