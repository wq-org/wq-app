import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

type PaginationWithoutLabelsProps = {
  pages?: number[]
  activePage?: number
  previousHref?: string
  nextHref?: string
  getPageHref?: (page: number) => string
}

export function PaginationWithoutLabels({
  pages = [1, 2, 3],
  activePage = 2,
  previousHref = '#',
  nextHref = '#',
  getPageHref,
}: PaginationWithoutLabelsProps) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            href={previousHref}
            aria-label="Go to previous page"
            size="icon"
          >
            <ChevronLeftIcon className="size-4" />
          </PaginationLink>
        </PaginationItem>
        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={getPageHref ? getPageHref(page) : '#'}
              isActive={page === activePage}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationLink
            href={nextHref}
            aria-label="Go to next page"
            size="icon"
          >
            <ChevronRightIcon className="size-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
