import { Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

export function InstitutionUsersEmptyState() {
  const { t } = useTranslation('features.institution-admin')

  return (
    <Empty>
      <EmptyMedia variant="icon">
        <Users />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>{t('users.empty.title')}</EmptyTitle>
        <EmptyDescription>{t('users.empty.description')}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent />
    </Empty>
  )
}
