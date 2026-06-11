import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { AppShell } from '@/components/layout'
import { LoadingPage } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { GridPattern } from '@/components/ui/grid-pattern'
import { Text } from '@/components/ui/text'
import { requestOpenCommandAddDialog } from '@/features/command-palette'
import { NoteCardList, NoteEditorPage, filterNotesByQuery, useNotes } from '@/features/notes'

export function StudentNotesPage() {
  const { noteId } = useParams<{ noteId?: string }>()

  if (noteId) {
    return <NoteEditorPage role="student" />
  }

  return <StudentNotesList />
}

function StudentNotesList() {
  const { t } = useTranslation('features.notes')
  const { notes, loading, error } = useNotes()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredNotes = useMemo(
    () => filterNotesByQuery(notes, searchQuery),
    [notes, searchQuery],
  )

  if (loading) {
    return (
      <AppShell role="student">
        <LoadingPage
          variant="embedded"
          size={48}
        />
      </AppShell>
    )
  }

  return (
    <AppShell
      role="student"
      className="animate-in fade-in-0 slide-in-from-bottom-4"
    >
      <div className="container mx-auto w-full max-w-4xl py-6">
        <section className="relative isolate mb-8 overflow-hidden rounded-3xl">
          <GridPattern className="absolute inset-0 -z-10 h-full w-full opacity-75 [mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)]" />

          <div className="relative px-6 pb-8 pt-10 sm:px-10">
            <Text
              as="h1"
              variant="h1"
              className="text-[clamp(3.5rem,12vw,9rem)] font-bold leading-[0.95] tracking-tight"
            >
              {t('pages.list.heading.lineOne')}
              <br />
              {t('pages.list.heading.lineTwo')}
            </Text>
            {error ? (
              <Text
                as="p"
                variant="body"
                className="mt-3 text-sm text-destructive"
              >
                {error}
              </Text>
            ) : (
              <Text
                as="p"
                variant="body"
                muted
                className="mt-3 max-w-xl text-sm"
              >
                {t('pages.list.description')}
              </Text>
            )}
          </div>
        </section>

        <div className="mb-6 flex flex-col gap-3">
          <div className="min-w-0 flex-1 w-lg">
            <FieldInput
              label={t('pages.list.searchLabel')}
              labelVisibility="sr-only"
              placeholder={t('pages.list.searchPlaceholder')}
              value={searchQuery}
              onValueChange={setSearchQuery}
              showClearButton
              showSearchIcon
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="darkblue"
              size="default"
              className="shrink-0 gap-2"
              onClick={() => requestOpenCommandAddDialog()}
            >
              <Plus
                className="size-4 shrink-0"
                aria-hidden
              />
              {t('pages.list.newNote')}
            </Button>
          </div>
        </div>

        <NoteCardList
          notes={filteredNotes}
          role="student"
        />
      </div>
    </AppShell>
  )
}
