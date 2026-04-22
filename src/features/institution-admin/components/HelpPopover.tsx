import { CircleQuestionMark } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'

type HelpPopoverProps = {
  title: string
  sectionDefinitionLabel: string
  sectionExampleLabel: string
  sectionExampleValuesLabel: string
  sectionReasonLabel: string
  definition: string
  exampleTitle: string
  exampleValues: string[]
  reason?: string
}

export function HelpPopover({
  title,
  sectionDefinitionLabel,
  sectionExampleLabel,
  sectionExampleValuesLabel,
  sectionReasonLabel,
  definition,
  exampleTitle,
  exampleValues,
  reason,
}: HelpPopoverProps) {
  const hasReason = Boolean(reason && reason.trim())

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground"
          aria-label={title}
        >
          <CircleQuestionMark className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-96 max-w-[95vw] p-4 rounded-2xl"
      >
        <ScrollArea className="h-72 pr-3">
          <div className="flex flex-col gap-3">
            <Text
              as="h3"
              variant="small"
              className="font-semibold"
            >
              {title}
            </Text>

            <div className="flex flex-col gap-1">
              <Text
                as="p"
                variant="small"
                className="font-medium"
              >
                {sectionDefinitionLabel}
              </Text>
              <Text
                as="p"
                variant="small"
                color="muted"
              >
                {definition}
              </Text>
            </div>

            <Separator />

            <div className="flex flex-col gap-1">
              <Text
                as="p"
                variant="small"
                className="font-medium"
              >
                {sectionExampleLabel}
              </Text>
              <Text
                as="p"
                variant="small"
                color="muted"
              >
                {exampleTitle}
              </Text>
            </div>

            <div className="flex flex-col gap-1">
              <Text
                as="p"
                variant="small"
                className="font-medium"
              >
                {sectionExampleValuesLabel}
              </Text>
              <ul className="list-disc pl-5 space-y-1">
                {exampleValues.map((value) => (
                  <li key={value}>
                    <Text
                      as="span"
                      variant="small"
                      color="muted"
                    >
                      {value}
                    </Text>
                  </li>
                ))}
              </ul>
            </div>

            {hasReason ? (
              <>
                <Separator />
                <div className="flex flex-col gap-1">
                  <Text
                    as="p"
                    variant="small"
                    className="font-medium"
                  >
                    {sectionReasonLabel}
                  </Text>
                  <Text
                    as="p"
                    variant="small"
                    color="muted"
                  >
                    {reason}
                  </Text>
                </div>
              </>
            ) : null}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
