import { useMemo } from 'react'
import { UserX } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

import { useAssignClassroomMemberDialog } from '../hooks/useAssignClassroomMemberDialog'

type AssignClassroomMemberDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  classroomId: string | null
  institutionId: string | null
  onAssigned: () => void
}

export function AssignClassroomMemberDialog({
  open,
  onOpenChange,
  classroomId,
  institutionId,
  onAssigned,
}: AssignClassroomMemberDialogProps) {
  const { t } = useTranslation('features.institution-admin')
  const {
    users,
    selectedUserId,
    setSelectedUserId,
    isLoading,
    isSubmitting,
    error,
    canSubmit,
    reset,
    handleSubmit,
  } = useAssignClassroomMemberDialog({
    classroomId,
    institutionId,
    open,
    onAssigned,
  })

  const labels = useMemo(() => users.map((user) => user.label), [users])
  const userIdByLabel = useMemo(() => {
    const map = new Map<string, string>()
    for (const user of users) {
      map.set(user.label, user.id)
    }
    return map
  }, [users])
  const selectedLabel = useMemo(() => {
    return users.find((user) => user.id === selectedUserId)?.label ?? ''
  }, [selectedUserId, users])

  const handleSelect = (value: string | null) => {
    if (!value) {
      setSelectedUserId('')
      return
    }
    const nextId = userIdByLabel.get(value)
    if (nextId) {
      setSelectedUserId(nextId)
    }
  }

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      reset()
    }
  }

  const handleAssign = async () => {
    const assigned = await handleSubmit()
    if (assigned) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('classrooms.assignDialog.title')}</DialogTitle>
          <DialogDescription>{t('classrooms.assignDialog.description')}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex min-h-28 items-center justify-center">
            <Spinner
              variant="gray"
              size="sm"
              speed={1750}
            />
          </div>
        ) : users.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserX className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t('classrooms.assignDialog.empty')}</EmptyTitle>
              <EmptyDescription>{t('classrooms.assignDialog.emptyDescription')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-3">
            <Combobox
              value={selectedLabel || null}
              onValueChange={handleSelect}
              items={labels}
              itemToStringLabel={(item) => String(item)}
              filter={(item, query) =>
                String(item).toLowerCase().includes(query.trim().toLowerCase())
              }
              autoHighlight
            >
              <ComboboxInput
                placeholder={t('classrooms.assignDialog.searchPlaceholder')}
                showClear
              />
              <ComboboxContent>
                <ComboboxEmpty>{t('classrooms.assignDialog.empty')}</ComboboxEmpty>
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem
                      key={item}
                      value={item}
                    >
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>

            {error ? (
              <Text
                as="p"
                variant="small"
                color="danger"
              >
                {error}
              </Text>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isSubmitting}
          >
            {t('classrooms.assignDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            onClick={handleAssign}
            disabled={!canSubmit}
          >
            {isSubmitting
              ? t('classrooms.assignDialog.assigning')
              : t('classrooms.assignDialog.assign')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
