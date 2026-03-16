import { ChatComingSoon } from '@/features/chat'
import { AppShell } from '@/components/layout'

const Chat = () => {
  return (
    <AppShell role="student">
      <ChatComingSoon />
    </AppShell>
  )
}

export { Chat }
