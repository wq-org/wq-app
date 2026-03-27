import { useParams } from 'react-router-dom'
import { CommandPalette } from '@/features/command-palette'
import { useUser } from '@/contexts/user'
import { ProfileInstitutionView } from '@/features/profile'
import { useTranslation } from 'react-i18next'

export function InstitutionViewPage() {
  const { t } = useTranslation('features.institution')
  const { id } = useParams<{ id: string }>()
  const { getRole } = useUser()
  const role = getRole() || 'student'

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">{t('view.notFound')}</p>
      </div>
    )
  }

  return (
    <>
      <ProfileInstitutionView institutionId={id} />
      <CommandPalette commandBarContext={role} />
    </>
  )
}
