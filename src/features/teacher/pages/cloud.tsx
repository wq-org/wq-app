import { AppShell } from '@/components/layout'
import { CloudGallery } from '@/features/cloud'

export function TeacherCloudPage() {
  return (
    <AppShell
      role="teacher"
      className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-bottom-4"
    >
      <div className="container mx-auto w-full max-w-7xl py-6">
        <CloudGallery />
      </div>
    </AppShell>
  )
}
