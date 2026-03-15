import { ChatComingSoon } from '@/features/chat'
import { AppShell } from '@/components/layout'

export function Chat() {
  return (
    <AppShell role="student">
      <ChatComingSoon />
    </AppShell>
  )
}
