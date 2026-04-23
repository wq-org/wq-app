import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

type PaginationWithPageInfoOnCenterProps = {
  currentPage?: number
  totalPages?: number
  previousHref?: string
  nextHref?: string
}

export function PaginationWithPageInfoOnCenter({
  currentPage = 1,
  totalPages = 10,
  previousHref = '#',
  nextHref = '#',
}: PaginationWithPageInfoOnCenterProps) {
  return (
    <Pagination className="w-full max-w-xs">
      <PaginationContent className="w-full justify-between">
        <PaginationItem>
          <PaginationLink
            href={previousHref}
            size="icon"
            aria-label="Go to previous page"
          >
            <ChevronLeftIcon className="size-4" />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <span className="text-muted-foreground text-sm">
            Page <span className="text-foreground font-medium">{currentPage}</span> of{' '}
            <span className="text-foreground font-medium">{totalPages}</span>
          </span>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            href={nextHref}
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
