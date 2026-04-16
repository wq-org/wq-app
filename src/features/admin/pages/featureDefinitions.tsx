import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Blocks, Plus, SearchX } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { useSearchFilter } from '@/hooks/useSearchFilter'

import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'
import { FeatureDefinitionCardList } from '../components/FeatureDefinitionCardList'
import { useFeatureDefinitions } from '../hooks/useFeatureDefinitions'
import { useFeatureDefinitionsBasePath } from '../hooks/useFeatureDefinitionsBasePath'

const AdminFeatureDefinitions = () => {
  const navigate = useNavigate()
  const { t } = useTranslation('features.admin')
  const basePath = useFeatureDefinitionsBasePath()
  const { items, isLoading, error } = useFeatureDefinitions()
  const [filterQuery, setFilterQuery] = useState('')

  const searchableRows = useMemo(
    () => items.map((feature) => ({ feature, key: feature.key, name: feature.name ?? '' })),
    [items],
  )

  const filteredRows = useSearchFilter(searchableRows, filterQuery, ['key', 'name'])
  const filteredFeatures = useMemo(() => filteredRows.map((row) => row.feature), [filteredRows])

  const hasActiveFilter = filterQuery.trim().length > 0
  const showFilterEmpty =
    !isLoading && items.length > 0 && filteredFeatures.length === 0 && hasActiveFilter

  const handleEdit = useCallback(
    (featureId: string) => {
      navigate(`${basePath}/${featureId}`)
    },
    [navigate, basePath],
  )

  const handleAdd = useCallback(() => {
    navigate(`${basePath}/new`)
  }, [navigate, basePath])

  return (
    <AdminWorkspaceShell>
      <div className="flex flex-col gap-6 py-8 px-4">
        <div className="flex flex-col gap-2">
          <Text
            as="h1"
            variant="h3"
            className="font-semibold tracking-tight text-foreground"
          >
            {t('featureDefinitions.pageTitle')}
          </Text>
          <Text
            as="p"
            variant="small"
            color="muted"
            className="max-w-3xl text-balance leading-relaxed"
          >
            {t('featureDefinitions.pageDescription')}
          </Text>
        </div>

        {!isLoading && items.length > 0 ? (
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="darkblue"
                className="w-fit shrink-0 self-start"
                onClick={handleAdd}
              >
                <Plus className="size-4" />
                {t('featureDefinitions.addButton')}
              </Button>
            </div>
            <div className="w-full min-w-0 md:max-w-md">
              <FieldInput
                label={t('featureDefinitions.filterLabel')}
                placeholder={t('featureDefinitions.filterPlaceholder')}
                value={filterQuery}
                onValueChange={setFilterQuery}
                autoComplete="off"
              />
            </div>
          </div>
        ) : null}

        {error && !isLoading ? (
          <Text
            as="p"
            variant="small"
            color="danger"
            role="alert"
          >
            {t('featureDefinitions.loadError')}: {error}
          </Text>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <Spinner
              variant="gray"
              size="sm"
              speed={1750}
            />
          </div>
        ) : showFilterEmpty ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX aria-hidden />
              </EmptyMedia>
              <EmptyTitle>{t('featureDefinitions.filterEmptyTitle')}</EmptyTitle>
              <EmptyDescription>{t('featureDefinitions.filterEmpty')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : items.length === 0 ? (
          <Empty>
            <EmptyMedia variant="icon">
              <Blocks aria-hidden />
            </EmptyMedia>
            <EmptyHeader className="max-w-md gap-3">
              <Text
                as="h2"
                variant="h3"
                className="text-center font-semibold tracking-tight text-foreground"
              >
                {t('featureDefinitions.empty.title')}
              </Text>
              <Text
                as="p"
                variant="small"
                color="muted"
                className="text-center text-balance"
              >
                {t('featureDefinitions.empty.description')}
              </Text>
            </EmptyHeader>
            <EmptyContent className="max-w-md gap-5">
              <ul className="w-full list-disc space-y-2 pl-5 text-left marker:text-muted-foreground">
                <li>
                  <Text
                    as="span"
                    variant="small"
                    color="muted"
                  >
                    {t('featureDefinitions.empty.hintKeys')}
                  </Text>
                </li>
                <li>
                  <Text
                    as="span"
                    variant="small"
                    color="muted"
                  >
                    {t('featureDefinitions.empty.hintPlans')}
                  </Text>
                </li>
              </ul>
              <Button
                type="button"
                variant="darkblue"
                onClick={handleAdd}
              >
                <Plus className="size-4" />
                {t('featureDefinitions.addButton')}
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <FeatureDefinitionCardList
            items={filteredFeatures}
            onEdit={handleEdit}
          />
        )}
      </div>
    </AdminWorkspaceShell>
  )
}

export { AdminFeatureDefinitions }
