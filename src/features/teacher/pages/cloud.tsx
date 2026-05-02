import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppShell } from '@/components/layout'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useUser } from '@/contexts/user'
import { CloudTableView, useTeacherCloudFiles } from '@/features/files'

export function TeacherCloudPage() {
  const { t } = useTranslation('features.teacher')
  const { profile } = useUser()
  const { fileItems, loading, error, refetch } = useTeacherCloudFiles()

  useEffect(() => {
    if (error) {
      toast.error(t('pages.cloud.loadError'))
    }
  }, [error, t])

  const showSpinner = loading && profile?.user_id

  return (
    <AppShell
      role="teacher"
      className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-bottom-4"
    >
      <div className="container py-6">
        <div className="max-w-xl flex flex-col space-y-2">
          <Text variant="h1">{t('pages.cloud.title')}</Text>
        </div>

        <div className="mt-8">
          {showSpinner ? (
            <div className="flex justify-center py-16">
              <Spinner
                variant="gray"
                size="lg"
              />
            </div>
          ) : (
            <CloudTableView
              files={fileItems}
              onRefresh={() => void refetch()}
            />
          )}
        </div>
      </div>
    </AppShell>
  )
}
