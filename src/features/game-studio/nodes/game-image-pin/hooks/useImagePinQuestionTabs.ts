import { useCallback, useMemo } from 'react'
import type { TFunction } from 'i18next'

import type { TabItem } from '@/components/shared'

import type { GameImagePinRect } from '../image-pin.schema'

export type UseImagePinQuestionTabsArgs = {
  rectangles: readonly GameImagePinRect[]
  selectedRectId: string | null
  onSelectedRectIdChange: (rectId: string | null) => void
  t: TFunction<'features.gameStudio'>
}

export function useImagePinQuestionTabs({
  rectangles,
  selectedRectId,
  onSelectedRectIdChange,
  t,
}: UseImagePinQuestionTabsArgs) {
  const activeRectId = useMemo(() => {
    if (selectedRectId && rectangles.some((rect) => rect.id === selectedRectId)) {
      return selectedRectId
    }
    return rectangles[0]?.id ?? ''
  }, [rectangles, selectedRectId])

  const activeRect = useMemo(
    () => rectangles.find((rect) => rect.id === activeRectId),
    [activeRectId, rectangles],
  )

  const selectTabItems: TabItem[] = useMemo(
    () =>
      rectangles.map((rect, index) => ({
        id: rect.id,
        title: t('imagePinEditor.questionLabel', { index: index + 1 }),
        closable: true,
      })),
    [rectangles, t],
  )

  const setActiveTabId = useCallback(
    (tabId: string) => {
      onSelectedRectIdChange(tabId)
    },
    [onSelectedRectIdChange],
  )

  return {
    activeRect,
    activeRectId,
    selectTabItems,
    setActiveTabId,
  }
}
