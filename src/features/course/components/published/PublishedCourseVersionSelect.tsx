import { useTranslation } from 'react-i18next'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { PublishedCourseVersionSummary } from '../../types/course-version.types'

type PublishedCourseVersionSelectProps = {
  versions: readonly PublishedCourseVersionSummary[]
  value: string | null
  onVersionChange: (courseVersionId: string) => void
}

export function PublishedCourseVersionSelect({
  versions,
  value,
  onVersionChange,
}: PublishedCourseVersionSelectProps) {
  const { t } = useTranslation('features.course')

  if (versions.length === 0) {
    return null
  }

  return (
    <Select
      value={value ?? undefined}
      onValueChange={onVersionChange}
    >
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder={t('published.versionSelectPlaceholder')} />
      </SelectTrigger>
      <SelectContent>
        {versions.map((version) => (
          <SelectItem
            key={version.id}
            value={version.id}
          >
            {t('published.versionOption', { version: version.versionNo })}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
