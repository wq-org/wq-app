import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import StatsProgress, { type StatsProgressItem } from '@/components/shared/StatsProgress'
import StatsSegmentedProgress, {
  type StatsSegmentedProgressSegment,
} from '@/components/shared/StatsSegmentedProgress'

import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { useInstitutionLicensing } from '../hooks/useInstitutionLicensing'

function formatGB(bytes: number): number {
  return Math.round((bytes / 1_073_741_824) * 10) / 10
}

function pct(used: number, cap: number | null | undefined): number {
  if (!cap || cap <= 0) return 0
  return Math.min(100, Math.round((used / cap) * 1000) / 10)
}

const InstitutionUsage = () => {
  const { t } = useTranslation('features.institution-admin')
  const { quotas, isLoading, error } = useInstitutionLicensing()

  const seatMetricItems = useMemo((): StatsProgressItem[] => {
    if (!quotas) return []
    return [
      {
        name: t('licenseUsage.metrics.students.title'),
        stat: String(quotas.studentsUsed),
        limit:
          quotas.studentsCap != null
            ? String(quotas.studentsCap)
            : t('licenseUsage.metrics.unlimited'),
        percentage: pct(quotas.studentsUsed, quotas.studentsCap),
      },
      {
        name: t('licenseUsage.metrics.teachers.title'),
        stat: String(quotas.teachersUsed),
        limit:
          quotas.teachersCap != null
            ? String(quotas.teachersCap)
            : t('licenseUsage.metrics.unlimited'),
        percentage: pct(quotas.teachersUsed, quotas.teachersCap),
      },
      {
        name: t('licenseUsage.metrics.classrooms.title'),
        stat: String(quotas.classroomsUsed),
        limit:
          quotas.classroomsCap != null
            ? String(quotas.classroomsCap)
            : t('licenseUsage.metrics.unlimited'),
        percentage: pct(quotas.classroomsUsed, quotas.classroomsCap),
      },
    ]
  }, [quotas, t])

  const storageSegments = useMemo((): StatsSegmentedProgressSegment[] => {
    if (!quotas) return []
    return [
      {
        label: t('licenseUsage.metrics.storage.used'),
        value: formatGB(quotas.storageUsedBytes),
        color: 'bg-blue-500',
      },
    ]
  }, [quotas, t])

  const storageCapBytes = quotas?.storageBytesCap ? Number(quotas.storageBytesCap) : null
  const storageCapGB =
    storageCapBytes != null && storageCapBytes > 0 ? formatGB(storageCapBytes) : null
  const storageUsedGB = quotas ? formatGB(quotas.storageUsedBytes) : 0

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="flex flex-col gap-8">
        <div>
          <Text
            as="h1"
            variant="h1"
            className="text-2xl font-bold"
          >
            {t('licenseUsage.title')}
          </Text>
          <Text
            as="p"
            variant="body"
            color="muted"
          >
            {t('licenseUsage.subtitle')}
          </Text>
        </div>

        {isLoading ? (
          <div className="flex min-h-60 items-center justify-center">
            <Spinner
              variant="gray"
              size="sm"
              speed={1750}
            />
          </div>
        ) : error ? (
          <Text
            as="p"
            variant="small"
            color="danger"
          >
            {t('licenseUsage.loadError')}: {error}
          </Text>
        ) : !quotas ? (
          <div className="rounded-2xl border bg-card p-6">
            <Text
              as="p"
              variant="body"
              color="muted"
            >
              {t('licenseUsage.empty')}
            </Text>
          </div>
        ) : (
          <>
            <StatsProgress
              items={seatMetricItems}
              className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
            />

            <div className="flex flex-col gap-2">
              <Text
                as="h2"
                variant="h2"
                className="text-base font-semibold"
              >
                {t('licenseUsage.metrics.storage.title')}
              </Text>
              {storageCapGB != null ? (
                <StatsSegmentedProgress
                  title={t('licenseUsage.metrics.storage.using')}
                  used={storageUsedGB}
                  total={storageCapGB}
                  usedLabel="GB"
                  totalLabel="GB"
                  segments={storageSegments}
                />
              ) : (
                <Card className="max-w-4xl shadow-sm">
                  <CardContent className="py-6">
                    <Text
                      as="p"
                      variant="small"
                      color="muted"
                      className="mb-1"
                    >
                      {t('licenseUsage.metrics.storage.using')}
                    </Text>
                    <Text
                      as="p"
                      className="tabular-nums text-2xl font-semibold text-foreground"
                    >
                      {storageUsedGB} GB
                    </Text>
                    <Text
                      as="p"
                      variant="small"
                      color="muted"
                      className="mt-2"
                    >
                      {t('licenseUsage.metrics.storage.unmetered')}
                    </Text>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}

export { InstitutionUsage }
