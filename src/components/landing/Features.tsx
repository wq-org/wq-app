import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Image as ImageIcon, MapPin, FileText, Workflow } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BorderBeam } from '@/components/ui/border-beam'
import overview01 from '@/assets/images/overview_01.png'
import overview02 from '@/assets/images/overview_02.png'
import overview03 from '@/assets/images/overveiw_03.png'
import overview04 from '@/assets/images/overview_04.png'

type ImageKey = 'item-1' | 'item-2' | 'item-3' | 'item-4'

const images = {
  'item-1': {
    image: overview01,
    alt: 'Game Builder Studio',
  },
  'item-2': {
    image: overview02,
    alt: 'Advanced Authentication',
  },
  'item-3': {
    image: overview03,
    alt: 'Identity Management',
  },
  'item-4': {
    image: overview04,
    alt: 'Analytics Dashboard',
  },
}

export function Features() {
  const [activeItem, setActiveItem] = useState<ImageKey>('item-1')

  return (
    <section
      id="solution"
      className="py-12 md:py-20 lg:py-32"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-muted/30 sm:inset-6 sm:rounded-b-3xl dark:block"></div>
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16 lg:space-y-20">
        <div className="relative z-10 mx-auto max-w-2xl space-y-6 text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-6xl">
            The foundation for serious games
          </h2>
          <p>
            WQ Health is more than just a platform. It supports educators and institutions with the tools needed to create engaging health education experiences.
          </p>
        </div>

        <div className="grid gap-12 sm:px-12 md:grid-cols-2 lg:gap-20 lg:px-0">
          <Accordion
            type="single"
            value={activeItem}
            onValueChange={(value) => setActiveItem(value as ImageKey)}
            className="w-full"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <div className="flex items-center gap-2 text-base">
                  <ImageIcon className="size-4" />
                  Image Term Match
                </div>
              </AccordionTrigger>
              <AccordionContent>
                Match medical and health terms with corresponding images. Perfect for visual learners studying anatomy, medical terminology, and health concepts.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                <div className="flex items-center gap-2 text-base">
                  <MapPin className="size-4" />
                  Image Pin Mark
                </div>
              </AccordionTrigger>
              <AccordionContent>
                Drag and drop pins on images to mark specific anatomical locations, wound areas, or points of interest. Ideal for interactive anatomy lessons and clinical training.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                <div className="flex items-center gap-2 text-base">
                  <FileText className="size-4" />
                  Paragraph Line Select
                </div>
              </AccordionTrigger>
              <AccordionContent>
                Create interactive quizzes from health education paragraphs. Students select sentences and answer questions, making reading comprehension engaging and measurable.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>
                <div className="flex items-center gap-2 text-base">
                  <Workflow className="size-4" />
                  Game Builder Studio
                </div>
              </AccordionTrigger>
              <AccordionContent>
                Visual workflow builder with drag-and-drop nodes. Create custom game sequences, add logic branches, and publish interactive health education experiences.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="relative flex overflow-hidden rounded-3xl border bg-background p-2">
            <div className="absolute inset-0 right-0 ml-auto w-16 border-l bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_8px)]"></div>
            <div className="relative aspect-[76/59] w-[calc(3/4*100%+3rem)] rounded-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeItem}-id`}
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="size-full overflow-hidden rounded-2xl border bg-zinc-900 shadow-md"
                >
                  <img
                    src={images[activeItem].image}
                    className="size-full object-cover object-left-top dark:mix-blend-lighten"
                    alt={images[activeItem].alt}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <BorderBeam
              duration={6}
              size={200}
              className="from-transparent via-yellow-700 to-transparent dark:via-white/50"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
