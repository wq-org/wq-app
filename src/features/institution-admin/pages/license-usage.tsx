import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

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

const InstitutionLicenseUsage = () => {
  const { t } = useTranslation('features.institution-admin')
  const { quotas, isLoading, error } = useInstitutionLicensing()

  const studentItem = useMemo((): StatsProgressItem[] => {
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
    ]
  }, [quotas, t])

  const teacherItem = useMemo((): StatsProgressItem[] => {
    if (!quotas) return []
    return [
      {
        name: t('licenseUsage.metrics.teachers.title'),
        stat: String(quotas.teachersUsed),
        limit:
          quotas.teachersCap != null
            ? String(quotas.teachersCap)
            : t('licenseUsage.metrics.unlimited'),
        percentage: pct(quotas.teachersUsed, quotas.teachersCap),
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

  const storageCapGB = quotas?.storageBytesCap ? formatGB(Number(quotas.storageBytesCap)) : 0
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
          <div className="flex min-h-[240px] items-center justify-center">
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
            <div className="flex gap-6">
              <div className="flex-1">
                <StatsProgress
                  items={studentItem}
                  className="sm:!grid-cols-1 lg:!grid-cols-1"
                />
              </div>
              <div className="flex-1">
                <StatsProgress
                  items={teacherItem}
                  className="sm:!grid-cols-1 lg:!grid-cols-1"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Text
                as="h2"
                variant="h2"
                className="text-base font-semibold"
              >
                {t('licenseUsage.metrics.storage.title')}
              </Text>
              <StatsSegmentedProgress
                title={t('licenseUsage.metrics.storage.using')}
                used={storageUsedGB}
                total={storageCapGB || 10}
                usedLabel="GB"
                totalLabel="GB"
                segments={storageSegments}
              />
            </div>
          </>
        )}
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}

export { InstitutionLicenseUsage }
