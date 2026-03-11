import { MessageCircleQuestionMark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type LessonGuideItem = {
  readonly value: string
  readonly label: string
  readonly description: string
}

interface LessonGuidePopoverSectionProps {
  guides: readonly LessonGuideItem[]
  selectedGuide: string
  onSelectGuide: (value: string) => void
  helpLabel?: string
}

export function LessonGuidePopoverSection({
  guides,
  selectedGuide,
  onSelectGuide,
  helpLabel = 'Help',
}: LessonGuidePopoverSectionProps) {
  const activeGuide = guides.find((guide) => guide.value === selectedGuide) ?? guides[0]

  return (
    <div className="flex flex-col items-end gap-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="rounded-full bg-white px-4 shadow-sm"
          >
            <MessageCircleQuestionMark className="size-4" />
            <Text
              as="span"
              variant="body"
            >
              {helpLabel}
            </Text>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-full max-w-md rounded-2xl border bg-white/85 p-4 shadow-lg backdrop-blur-md"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {guides.map((guide) => (
                <Button
                  key={guide.value}
                  type="button"
                  variant={selectedGuide === guide.value ? 'default' : 'outline'}
                  className="rounded-full"
                  onClick={() => onSelectGuide(guide.value)}
                >
                  {guide.label}
                </Button>
              ))}
            </div>
            <div className="rounded-2xl border bg-white/70 p-4 text-left">
              <Text
                as="p"
                variant="small"
                className="font-semibold text-foreground"
              >
                {activeGuide.label}
              </Text>
              <Text
                as="p"
                variant="small"
                className="mt-2 leading-6 text-muted-foreground"
              >
                {activeGuide.description}
              </Text>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
