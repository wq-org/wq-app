'use client'

import Ai03 from '@/components/Ai03'

interface ChatInputProps {
  onSend: (message: string) => void
}

export function ChatInput({ onSend }: ChatInputProps) {
  return (
    <div className="pt-2 pb-4 px-4 sm:px-5">
      <Ai03
        compact
        showMetaRow={false}
        showAssistControls={false}
        placeholder="Type a message..."
        onSubmitMessage={onSend}
      />
    </div>
  )
}
