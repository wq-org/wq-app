import { ChatComingSoon } from '@/features/chat'
import { AppShell } from '@/components/layout'

export default function Chat() {
  return (
    <AppShell role="student">
      <ChatComingSoon />
    </AppShell>
  )
}
