import { Text } from '@/components/ui/text'

export function ChatComingSoon() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center bg-white">
      <Text
        as="p"
        variant="h2"
        className="text-center text-lg text-gray-600"
      >
        Coming soon
      </Text>
    </div>
  )
}
