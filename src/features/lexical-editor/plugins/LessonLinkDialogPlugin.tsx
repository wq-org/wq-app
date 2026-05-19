import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useCallback, useEffect, useState, type FormEvent } from 'react'

import { useDisclosure } from '@/hooks/use-disclosure'

import { AddLessonLinkDialog } from '../components/AddLessonLinkDialog'
import { applyLinkToSelection, getSelectedLinkUrl, normalizeLinkUrl } from '../utils/link'

type LessonLinkDialogPluginProps = {
  onReady: (requestLinkDialog: () => void) => void
}

export function LessonLinkDialogPlugin({ onReady }: LessonLinkDialogPluginProps) {
  const [editor] = useLexicalComposerContext()
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure()
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const requestLinkDialog = useCallback(() => {
    let initialUrl = ''
    editor.getEditorState().read(() => {
      initialUrl = getSelectedLinkUrl(editor)
    })
    setIsEditMode(Boolean(initialUrl))
    setUrl(initialUrl)
    setError(null)
    onOpen()
  }, [editor, onOpen])

  useEffect(() => {
    onReady(requestLinkDialog)
  }, [onReady, requestLinkDialog])

  const handleOpenChange = (open: boolean) => {
    onToggle(open)
    if (!open) {
      setError(null)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = normalizeLinkUrl(url)
    if (!normalized) {
      setError('Enter a valid http(s) URL.')
      return
    }

    applyLinkToSelection(editor, normalized)
    onClose()
  }

  return (
    <AddLessonLinkDialog
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      url={url}
      onUrlChange={setUrl}
      error={error}
      isEditMode={isEditMode}
      onSubmit={handleSubmit}
      onCancel={onClose}
    />
  )
}
