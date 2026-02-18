import { useState } from 'react'
import { LayoutDashboard, Settings } from 'lucide-react'
import { Text } from '@/components/ui/text'

export interface LessonLayoutProps {
  lessonId: string
  children?: React.ReactNode
  overviewContent?: React.ReactNode
  settingsContent?: React.ReactNode
}

export default function LessonLayout({
  children,
  overviewContent,
  settingsContent,
}: LessonLayoutProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview')

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex gap-12 border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`text-xl border-b-2 flex gap-2 items-center pb-2 cursor-pointer transition-colors ${
            activeTab === 'overview'
              ? 'text-black border-black font-medium'
              : 'text-black/40 hover:text-black/60 border-transparent'
          }`}
        >
          <LayoutDashboard
            className={activeTab === 'overview' ? 'text-black' : 'text-black/40'}
          />
          <Text as="span" variant="small">
            Overview
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
          <Text as="span" variant="small">
            Settings
          </Text>
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'overview' && <div>{overviewContent || children}</div>}
        {activeTab === 'settings' && <div>{settingsContent}</div>}
      </div>
    </div>
  )
}
