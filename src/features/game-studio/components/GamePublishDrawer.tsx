'use client'

import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { HoldConfirmButton } from '@/components/ui/HoldConfirmButton'
import { Text } from '@/components/ui/text'
import type { PublishDrawerProps } from '../types/game-studio.types'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { getPublishValidationResult } from '../utils/publishValidation'
import { GamePublishGraphIssueList } from './GamePublishGraphIssueList'
import { resolvePublishIssueMessage } from '../utils/formatPublishIssue'
import { GamePublishCourseLinkPopover } from './GamePublishCourseLinkPopover'
import { useTeacherPublishedCourses } from '../hooks/useTeacherPublishedCourses'

export function GamePublishDrawer({
  open,
  onOpenChange,
  nodes = [],
  edges = [],
  teacherId,
  linkedCourseId = null,
  onPublish,
  onFocusNode,
}: PublishDrawerProps) {
  const { t } = useTranslation('features.gameStudio')
  const [publishing, setPublishing] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(linkedCourseId)

  const { courses: publishedCourses, loading: coursesLoading } = useTeacherPublishedCourses(
    teacherId,
    open,
  )

  useEffect(() => {
    if (open) setSelectedCourseId(linkedCourseId)
  }, [open, linkedCourseId])

  const validationResult = useMemo(() => getPublishValidationResult(nodes, edges), [nodes, edges])
  const canPublish = validationResult.canPublish

  const handlePublish = async () => {
    if (!canPublish) {
      const firstError = validationResult.issues.find((issue) => issue.severity === 'error')
      if (firstError) {
        toast.error(resolvePublishIssueMessage(firstError, t))
      }
      return
    }

    if (!onPublish) {
      toast.error(t('publishDrawer.publishUnavailable'))
      return
    }

    setPublishing(true)
    try {
      await onPublish({ courseId: selectedCourseId })
      toast.success(t('publishDrawer.publishedSuccess'))
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error(t('publishDrawer.publishFailed'))
    } finally {
      setPublishing(false)
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="right"
    >
      <DrawerContent className="w-[50vw]! max-w-none! h-screen flex flex-col">
        <DrawerHeader className="border-b shrink-0">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl font-bold">{t('publishDrawer.title')}</DrawerTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <GamePublishGraphIssueList
            issues={validationResult.issues}
            canPublish={canPublish}
            onFocusNode={onFocusNode}
          />
        </div>

        <div className="shrink-0 border-t p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Text
              as="p"
              variant="small"
              bold
            >
              {t('publishDrawer.linkCourseSectionLabel')}
            </Text>
            <GamePublishCourseLinkPopover
              courses={publishedCourses}
              loading={coursesLoading}
              selectedCourseId={selectedCourseId}
              onSelectCourse={setSelectedCourseId}
            />
          </div>
          <HoldConfirmButton
            onConfirm={handlePublish}
            variant="ghost"
            className="w-full rounded-lg"
            disabled={!canPublish || publishing}
          >
            {publishing ? t('publishDrawer.publishing') : t('publishDrawer.publishForStudents')}
          </HoldConfirmButton>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
