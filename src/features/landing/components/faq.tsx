import { PhoneCall } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

export interface FAQ2Item {
  id: string
  question: string
  answer: string
}

interface FAQ2Props {
  badgeText?: string
  title?: string
  description?: string
  ctaText?: string
  items?: FAQ2Item[]
}

const defaultItems: FAQ2Item[] = Array.from({ length: 8 }).map((_, index) => ({
  id: `faq-${index + 1}`,
  question: 'This is the start of something new',
  answer:
    'Managing a small business today is already tough. Avoid further complications by ditching outdated, tedious trade methods.',
}))

export function FAQ2({
  badgeText = 'FAQ',
  title = 'This is the start of something new',
  description = 'Managing a small business today is already tough. Avoid further complications by ditching outdated, tedious trade methods.',
  ctaText = 'Any questions? Reach out',
  items = defaultItems,
}: FAQ2Props) {
  const resolvedItems = items.length > 0 ? items : defaultItems

  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Badge variant="outline">{badgeText}</Badge>
            <div className="flex flex-col gap-2">
              <h4 className="max-w-xl text-center text-3xl font-regular tracking-tighter md:text-5xl">
                {title}
              </h4>
              <p className="max-w-xl text-center text-lg leading-relaxed tracking-tight text-muted-foreground">
                {description}
              </p>
            </div>
            <div>
              <Button
                className="gap-4"
                variant="outline"
              >
                {ctaText} <PhoneCall className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mx-auto w-full max-w-3xl">
            <Accordion
              type="single"
              collapsible
              className="w-full"
            >
              {resolvedItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                >
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  )
}
