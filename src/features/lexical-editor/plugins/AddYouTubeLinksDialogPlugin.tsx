import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useCallback, useEffect, useState, type FormEvent } from 'react'

import { useDisclosure } from '@/hooks/use-disclosure'

import { OPEN_YOUTUBE_DIALOG_COMMAND } from '../commands/youtubeDialogCommands'
import { AddYouTubeLinksDialog } from '../components/AddYouTubeLinksDialog'
import { insertYouTubeEmbed } from '../utils/insertYouTubeEmbed'
import { parseYouTubeVideoId } from '../utils/parseYouTubeVideoId'

export function AddYouTubeLinksDialogPlugin() {
  const [editor] = useLexicalComposerContext()
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure()
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const requestYouTubeDialog = useCallback(() => {
    setUrl('')
    setError(null)
    onOpen()
  }, [onOpen])

  useEffect(() => {
    return editor.registerCommand(
      OPEN_YOUTUBE_DIALOG_COMMAND,
      () => {
        requestYouTubeDialog()
        return true
      },
      0,
    )
  }, [editor, requestYouTubeDialog])

  const handleOpenChange = (open: boolean) => {
    onToggle(open)
    if (!open) {
      setError(null)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const videoId = parseYouTubeVideoId(url)
    if (!videoId) {
      setError('Enter a valid YouTube URL or video ID.')
      return
    }

    insertYouTubeEmbed(editor, videoId)
    onClose()
  }

  return (
    <>
      <AddYouTubeLinksDialog
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        url={url}
        onUrlChange={setUrl}
        error={error}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </>
  )
}
