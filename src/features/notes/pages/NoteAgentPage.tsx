import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

import { Text } from '@/components/ui/text'

import { NOTE_AGENT_PANEL_ANIMATION_DURATION_S } from '../utils/noteAgentPanelAnimation'

gsap.registerPlugin(useGSAP)

type NoteAgentPageProps = {
  isClosing?: boolean
}

export function NoteAgentPage({ isClosing = false }: NoteAgentPageProps) {
  const { t } = useTranslation('features.notes')
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const content = contentRef.current
      if (!content) return

      if (isClosing) {
        gsap.to(content, {
          opacity: 0,
          x: 24,
          duration: NOTE_AGENT_PANEL_ANIMATION_DURATION_S,
          ease: 'power3.inOut',
        })
        return
      }

      gsap.set(content, { opacity: 1, x: 0 })
    },
    { dependencies: [isClosing], scope: contentRef, revertOnUpdate: true },
  )

  return (
    <div
      ref={contentRef}
      className="flex h-full min-h-0 flex-col p-4"
    >
      <Text
        as="h2"
        variant="h2"
      >
        {t('pages.agent.title')}
      </Text>
      <Text
        as="p"
        variant="body"
        muted
        className="mt-2 text-sm"
      >
        {t('pages.agent.placeholder')}
      </Text>
    </div>
  )
}
