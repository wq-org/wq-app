import { Button } from '@/components/ui/button'
import { CharacterCounter } from '@/components/ui/character-counter'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import { X } from 'lucide-react'
export default function Test() {
  const [searchQuery, setSearchQuery] = useState('')
  const remaining = 200

  return (
    <div className="min-h-screen  p-8">
      <div className="bg-white px-5 py-4 border-neutral-200 border rounded-3xl ">
        <div className="relative">
          <input
            type="text"
            placeholder="search input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className=" placeholder:text-muted-foreground disabled:opacity-50 flex-1 outline-none bg-transparent h-12 w-full px-3 py-2  min-h-16  pr-10"
            autoFocus
          />
          <Button
            size={'icon'}
            variant={'ghost'}
            className="p-1 rounded-full hover:bg-gray-100 absolute right-2 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Separator />
        <textarea
          className="placeholder:text-muted-foreground disabled:opacity-50 w-full my-4 outline-none resize-none px-3 py-2  min-h-16"
          placeholder="description"
          data-slot="textarea"
          rows={4}
        />
        <div className="flex justify-end mr-4">
          <CharacterCounter
            count={remaining}
            max={500}
            size={20}
          />
        </div>
      </div>

      <section className="py-10">
        <div className="relative">
          <input
            type="text"
            placeholder="search input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className=" placeholder:text-muted-foreground disabled:opacity-50 flex-1 outline-none bg-transparent h-12 w-full px-3 py-2  min-h-16"
            autoFocus
          />
          <Separator />
          <Button
            size={'icon'}
            variant={'ghost'}
            className="p-1 rounded-full hover:bg-gray-100 absolute right-2 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  )
}
