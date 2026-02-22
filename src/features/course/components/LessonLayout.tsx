import { useState } from 'react'
import { Eye, LayoutDashboard, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import SelectTabs, { type TabItem } from '@/components/shared/tabs/SelectTabs'

export type LessonTab = 'overview' | 'preview' | 'settings'

export interface LessonLayoutProps {
  lessonId: string
  children?: React.ReactNode
  overviewContent?: React.ReactNode
  previewContent?: React.ReactNode
  settingsContent?: React.ReactNode
  activeTab?: LessonTab
  onTabChange?: (tab: LessonTab) => void
}

export default function LessonLayout({
  children,
  overviewContent,
  previewContent,
  settingsContent,
  activeTab: controlledActiveTab,
  onTabChange,
}: LessonLayoutProps) {
  const { t } = useTranslation('features.lesson')
  const isControlled = controlledActiveTab !== undefined && onTabChange !== undefined
  const [internalTab, setInternalTab] = useState<LessonTab>('overview')
  const activeTab = isControlled ? controlledActiveTab : internalTab
  const setActiveTab = isControlled ? onTabChange : setInternalTab

  const lessonTabs: TabItem[] = [
    { id: 'overview', icon: LayoutDashboard, title: t('layout.tabs.overview') },
    { id: 'preview', icon: Eye, title: t('layout.tabs.preview') },
    { id: 'settings', icon: Settings, title: t('layout.tabs.settings') },
  ]

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in-0 slide-in-from-bottom-4">
      <SelectTabs
        tabs={lessonTabs}
        activeTabId={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as LessonTab)}
        className="border-b"
      />

      <div className="mt-6">
        {activeTab === 'overview' && <div>{overviewContent || children}</div>}
        {activeTab === 'preview' && <div>{previewContent}</div>}
        {activeTab === 'settings' && <div>{settingsContent}</div>}
      </div>
    </div>
  )
}
