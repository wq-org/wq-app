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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextMessage = message.trim()
    if (!nextMessage) return

    onSend(nextMessage)
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
        className="h-11 rounded-2xl border-neutral-200 bg-white"
      />
      <Button
        type="submit"
        size="icon"
        className="h-11 w-11 rounded-2xl"
        aria-label="Send message"
      >
        <SendHorizontal className="size-4" />
      </Button>
    </form>
  )
}
