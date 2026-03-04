'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { SendHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ChatInputProps {
  onSend: (message: string) => void
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const trimmedMessage = message.trim()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!trimmedMessage) return

    onSend(trimmedMessage)
    setMessage('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 px-4 pt-2 pb-4 sm:px-5"
    >
      <Input
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Type a message..."
        className="h-12 rounded-full border-neutral-200 bg-white px-5 shadow-none focus-visible:border-neutral-300 focus-visible:ring-0"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!trimmedMessage}
        className="h-12 w-12 rounded-full bg-chat-bubble-blue text-white hover:opacity-90 disabled:opacity-40 disabled:text-white"
        aria-label="Send message"
      >
        <SendHorizontal className="size-4" />
      </Button>
    </form>
  )
}
