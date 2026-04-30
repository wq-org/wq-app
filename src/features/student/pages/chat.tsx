import { AppShell } from '@/components/layout'
import { Text } from '@/components/ui/text'

const Chat = () => {
  return (
    <AppShell role="student">
      <div className="container py-10">
        <Text
          as="h1"
          variant="h1"
          className="text-2xl font-bold"
        >
          Chat
        </Text>
      </div>
    </AppShell>
  )
}

export { Chat }
