import { useState } from 'react'
import { Eye, LayoutDashboard, Settings } from 'lucide-react'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

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

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in-0 slide-in-from-bottom-4">
      <div className="flex gap-12 border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`text-xl border-b-2 flex gap-2 items-center pb-2 cursor-pointer transition-colors ${
            activeTab === 'overview'
              ? 'text-black border-black font-medium'
              : 'text-black/40 hover:text-black/60 border-transparent'
          }`}
        >
          <LayoutDashboard className={activeTab === 'overview' ? 'text-black' : 'text-black/40'} />
          <Text
            as="span"
            variant="small"
          >
            {t('layout.tabs.overview')}
          </Text>
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`text-xl border-b-2 flex gap-2 items-center pb-2 cursor-pointer transition-colors ${
            activeTab === 'preview'
              ? 'text-black border-black font-medium'
              : 'text-black/40 hover:text-black/60 border-transparent'
          }`}
        >
          <Eye className={activeTab === 'preview' ? 'text-black' : 'text-black/40'} />
          <Text
            as="span"
            variant="small"
          >
            {t('layout.tabs.preview')}
          </Text>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`text-xl border-b-2 flex gap-2 items-center pb-2 cursor-pointer transition-colors ${
            activeTab === 'settings'
              ? 'text-black border-black font-medium'
              : 'text-black/40 hover:text-black/60 border-transparent'
          }`}
        >
          <Settings className={activeTab === 'settings' ? 'text-black' : 'text-black/40'} />
          <Text
            as="span"
            variant="small"
          >
            {t('layout.tabs.settings')}
          </Text>
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'overview' && <div>{overviewContent || children}</div>}
        {activeTab === 'preview' && <div>{previewContent}</div>}
        {activeTab === 'settings' && <div>{settingsContent}</div>}
      </div>
    </div>
  )
}
