import { ChatComingSoon } from '@/features/chat'
import { AppShell } from '@/components/layout'

export function Chat() {
  return (
    <AppShell role="teacher">
      <ChatComingSoon />
    </AppShell>
  )
}
