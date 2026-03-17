import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Text } from '@/components/ui/text'

export type FaqItem = {
  id: string
  question: string
  answer: string
}

export type FaqListProps = {
  items: readonly FaqItem[]
}

export function FaqList({ items }: FaqListProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
    >
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          className="border-border"
        >
          <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="pb-5">
            <Text
              as="p"
              variant="body"
              className="leading-7 text-muted-foreground"
            >
              {item.answer}
            </Text>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
