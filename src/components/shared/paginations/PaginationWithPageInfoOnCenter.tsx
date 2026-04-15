import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

export function PaginationWithPageInfoOnCenter() {
  return (
    <Pagination className="w-full max-w-xs">
      <PaginationContent className="w-full justify-between">
        <PaginationItem>
          <PaginationLink
            href="#"
            size="icon"
            aria-label="Go to previous page"
          >
            <ChevronLeftIcon className="size-4" />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <span className="text-muted-foreground text-sm">
            Page <span className="text-foreground font-medium">1</span> of{' '}
            <span className="text-foreground font-medium">10</span>
          </span>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            href="#"
            size="icon"
            aria-label="Go to next page"
          >
            <ChevronRightIcon className="size-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
