import { useState } from 'react'
import { UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { FieldInput } from '@/components/ui/field-input'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useSearchFilter } from '@/hooks/useSearchFilter'

import { useInstitutionUsers } from '../hooks/useInstitutionUsers'
import type { InstitutionDirectoryRow } from '../types/institution-users.types'

type AssignUsersSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  institutionId: string
}

function roleLabel(row: InstitutionDirectoryRow, t: (key: string) => string): string {
  const role = row.rowKind === 'member' ? row.membership_role : row.membership_role
  if (role === 'teacher') return t('assignUsersSheet.roleTeacher')
  if (role === 'student') return t('assignUsersSheet.roleStudent')
  return t('assignUsersSheet.roleMember')
}

function displayName(row: InstitutionDirectoryRow): string {
  if (row.rowKind === 'member') {
    return row.display_name?.trim() || row.email || row.username || '—'
  }
  return row.email
}

export function AssignUsersSheet({ open, onOpenChange, institutionId }: AssignUsersSheetProps) {
  const { t } = useTranslation('features.institution-admin')
  const [searchQuery, setSearchQuery] = useState('')

  const {
    users,
    isLoading,
    error: loadError,
  } = useInstitutionUsers(institutionId, { enabled: open })

  const searchableUsers = users.map((row) => ({
    row,
    searchName: displayName(row),
    searchEmail: row.rowKind === 'member' ? (row.email ?? '') : row.email,
    searchRole: roleLabel(row, t),
  }))

  const filteredUsers = useSearchFilter(searchableUsers, searchQuery, [
    'searchName',
    'searchEmail',
    'searchRole',
  ]).map((item) => item.row)

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        side="right"
        className="flex w-full max-w-md flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b p-6 pb-4">
          <SheetTitle>{t('assignUsersSheet.title')}</SheetTitle>
          <SheetDescription>{t('assignUsersSheet.description')}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-4 flex-1">
          <FieldInput
            label={t('assignUsersSheet.searchLabel')}
            placeholder={t('assignUsersSheet.searchPlaceholder')}
            value={searchQuery}
            onValueChange={setSearchQuery}
            disabled={isLoading}
          />

          {isLoading ? (
            <div className="flex min-h-40 items-center justify-center">
              <Spinner
                variant="gray"
                size="sm"
                speed={1750}
              />
            </div>
          ) : loadError ? (
            <Text
              as="p"
              variant="small"
              color="danger"
            >
              {loadError}
            </Text>
          ) : filteredUsers.length === 0 ? (
            <Text
              as="p"
              variant="body"
              color="muted"
            >
              {t('assignUsersSheet.empty')}
            </Text>
          ) : (
            <div className="rounded-2xl border">
              {filteredUsers.map((row, index) => {
                const key = row.rowKind === 'member' ? row.user_id : row.invite_token
                const name = displayName(row)
                const email = row.rowKind === 'member' ? row.email : row.email
                const isInvite = row.rowKind === 'invite'

                return (
                  <div key={key}>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <UserRound className="size-4 text-muted-foreground" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <Text
                          as="p"
                          variant="body"
                          className="truncate font-medium"
                        >
                          {name}
                        </Text>
                        {email && (
                          <Text
                            as="p"
                            variant="small"
                            color="muted"
                            className="truncate"
                          >
                            {email}
                          </Text>
                        )}
                      </div>
                      <div className="shrink-0">
                        <Badge
                          variant={isInvite ? 'secondary' : 'blue'}
                          size="sm"
                          className="font-normal"
                        >
                          {roleLabel(row, t)}
                        </Badge>
                      </div>
                    </div>
                    {index < filteredUsers.length - 1 ? <Separator /> : null}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
