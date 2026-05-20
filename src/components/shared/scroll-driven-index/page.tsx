import { cn } from '@/lib/utils'

import { SCROLL_DRIVEN_INDEX_SCROLL_CLASS, ScrollDrivenIndex } from './ScrollDrivenIndex'
import type { ScrollDrivenIndexItem } from './scroll-driven-index.types'

const INDEX_ITEMS: ScrollDrivenIndexItem[] = [
  { id: 'user-centered-design', label: 'User-Centered Design' },
  {
    id: 'responsive-layouts',
    label: 'Responsive Layouts and Visual Hierarchy',
  },
  { id: 'typography', label: 'Typography for Readability' },
  { id: 'color-contrast', label: 'Color, Contrast, and Branding' },
  { id: 'motion-design', label: 'Adding Motion with Animations' },
  { id: 'accessibility', label: 'Accessibility and Inclusivity' },
  { id: 'conclusion', label: 'Conclusion' },
]

export function ScrollDrivenIndexPage() {
  return (
    <ScrollDrivenIndex
      items={INDEX_ITEMS}
      alignment="left"
    >
      <div
        className={cn(
          SCROLL_DRIVEN_INDEX_SCROLL_CLASS,
          'h-svh w-full overflow-auto px-4 py-20',
          'mask-[linear-gradient(#0000,#fff_80px_calc(100%-80px),#0000)]',
        )}
      >
        <header className="mx-auto mb-24 max-w-[60ch] pt-12">
          <h1 className="text-center text-4xl font-medium tracking-tight text-balance text-foreground">
            Scroll-Driven Index
          </h1>
          <p className="mt-8 text-center text-lg font-light text-muted-foreground">
            A well-crafted UI can turn a simple webpage into an interactive journey, guiding users
            through thoughtful design and seamless motion.
          </p>
        </header>

        <main className="mx-auto max-w-[60ch] [&_section]:mb-24 [&_section]:scroll-mt-20">
          <DemoSection
            id="user-centered-design"
            title="User-Centered Design"
            paragraphs={[
              'User-centered design is the backbone of effective UI. Every decision should revolve around the user’s needs, behavior, and preferences.',
              'Understanding the end-user’s journey helps designers pinpoint where users might encounter difficulties or confusion.',
            ]}
          />
          <DemoSection
            id="responsive-layouts"
            title="Responsive Layouts and Visual Hierarchy"
            paragraphs={[
              'Layouts need to be responsive and visually coherent across devices of all screen sizes.',
              'With mobile browsing dominant, fluid grids and scalable images ensure content stays easy to navigate.',
            ]}
          />
          <DemoSection
            id="typography"
            title="Typography for Readability"
            paragraphs={[
              'Typography creates hierarchy and rhythm that guides readers naturally through content.',
              'Accessible contrast, font sizes, and line spacing help prevent eye strain.',
            ]}
          />
          <DemoSection
            id="color-contrast"
            title="Color, Contrast, and Branding"
            paragraphs={[
              'Color and contrast play a powerful role in branding and functional clarity.',
              'High contrast between text and backgrounds enhances readability and accessibility.',
            ]}
          />
          <DemoSection
            id="motion-design"
            title="Adding Motion with Animations"
            paragraphs={[
              'Motion design is where UI comes to life — micro-interactions make pages feel responsive.',
              'Animation should be used mindfully; excessive motion can overwhelm users.',
            ]}
          />
          <DemoSection
            id="accessibility"
            title="Accessibility and Inclusivity"
            paragraphs={[
              'Accessible UI ensures the web is usable for all people, regardless of ability.',
              'ARIA labels, keyboard navigation, and semantic HTML are foundational practices.',
            ]}
          />
          <hr className="mb-24 opacity-50" />
          <DemoSection
            id="conclusion"
            title="Conclusion"
            paragraphs={[
              'The craft of web UI design lies in harmonizing aesthetics, functionality, and motion.',
              'An emphasis on motion, accessibility, and user-centered design shapes meaningful experiences.',
            ]}
          />
        </main>

        <footer className="py-4 text-center text-sm text-muted-foreground">
          Live example — css-scroll-driven-index
        </footer>
      </div>
    </ScrollDrivenIndex>
  )
}

type DemoSectionProps = {
  id: string
  title: string
  paragraphs: string[]
}

function DemoSection({ id, title, paragraphs }: DemoSectionProps) {
  return (
    <section id={id}>
      <h2 className="mb-5 text-2xl font-medium text-balance text-foreground">{title}</h2>
      {paragraphs.map((text) => (
        <p
          key={text}
          className="mb-4 font-light text-muted-foreground last:mb-0"
        >
          {text}
        </p>
      ))}
    </section>
  )
}
