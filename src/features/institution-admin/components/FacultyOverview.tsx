import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { FieldInput } from '@/components/ui/field-input'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

import type { FacultyProgrammeListItem } from './FacultyProgrammeCardList'
import { FacultyProgrammeCardList } from './FacultyProgrammeCardList'

type FacultyOverviewProps = {
  facultyName: string
  facultyDescription: string
  isLoading: boolean
  loadError: string | null
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  items: readonly FacultyProgrammeListItem[]
  isSearchActive: boolean
  onAddProgramme: () => void
  onOpenProgramme: (programmeId: string) => void
}

export function FacultyOverview({
  facultyName,
  facultyDescription,
  isLoading,
  loadError,
  searchQuery,
  onSearchQueryChange,
  items,
  isSearchActive,
  onAddProgramme,
  onOpenProgramme,
}: FacultyOverviewProps) {
  const { t } = useTranslation('features.institution-admin')

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner
          variant="gray"
          size="sm"
          speed={1750}
        />
      </div>
    )
  }

  if (loadError) {
    return (
      <Text
        as="p"
        variant="small"
        color="danger"
      >
        {loadError}
      </Text>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <Text
            as="h2"
            variant="h2"
            className="text-xl font-semibold"
          >
            {facultyName}
          </Text>
          <Text
            as="p"
            variant="body"
            color="muted"
          >
            {facultyDescription}
          </Text>
        </div>
        <Button
          variant="darkblue"
          type="button"
          className="gap-2"
          onClick={onAddProgramme}
        >
          <Plus className="size-4" />
          <Text as="span">{t('faculties.pages.facultyProgrammes.addProgramme')}</Text>
        </Button>
      </div>

      <FieldInput
        label={t('faculties.pages.facultyProgrammes.searchLabel')}
        placeholder={t('faculties.pages.facultyProgrammes.searchPlaceholder')}
        value={searchQuery}
        onValueChange={onSearchQueryChange}
        className="max-w-xl"
        disabled={isLoading}
      />

      {items.length === 0 ? (
        isSearchActive ? (
          <Text
            as="p"
            variant="body"
            color="muted"
            className="animate-in fade-in-0 slide-in-from-bottom-2"
          >
            {t('faculties.pages.facultyProgrammes.noSearchResults')}
          </Text>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Plus className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t('faculties.pages.facultyProgrammes.emptyTitle')}</EmptyTitle>
              <EmptyDescription>
                {t('faculties.pages.facultyProgrammes.emptyDescription')}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="outline"
                type="button"
                className="gap-2"
                onClick={onAddProgramme}
              >
                <Plus className="size-4" />
                <Text as="span">{t('faculties.pages.facultyProgrammes.addProgramme')}</Text>
              </Button>
            </EmptyContent>
          </Empty>
        )
      ) : (
        <FacultyProgrammeCardList
          items={items}
          onOpenProgramme={onOpenProgramme}
        />
      )}
    </div>
  )
}
