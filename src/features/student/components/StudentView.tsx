import { Text } from '@/components/ui/text'

export default function StudentView() {
  return (
    <div className="flex flex-col gap-4">
      <Text
        as="h2"
        variant="h2"
        className="text-2xl font-semibold"
      >
        Student View
      </Text>
      <Text
        as="p"
        variant="body"
        className="text-gray-600"
      >
        Student content will be displayed here.
      </Text>
    </div>
  )
}
