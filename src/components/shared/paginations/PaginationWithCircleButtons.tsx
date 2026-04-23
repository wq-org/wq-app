import { cn } from '@/lib/utils'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

type PaginationWithCircleButtonsProps = {
  pages?: number[]
  activePage?: number
  previousHref?: string
  nextHref?: string
  getPageHref?: (page: number) => string
}

export function PaginationWithCircleButtons({
  pages = [1, 2, 3],
  activePage = 2,
  previousHref = '#',
  nextHref = '#',
  getPageHref,
}: PaginationWithCircleButtonsProps) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={previousHref}
            className="rounded-full"
          />
        </PaginationItem>
        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={getPageHref ? getPageHref(page) : '#'}
              isActive={page === activePage}
              className={cn('rounded-full')}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href={nextHref}
            className="rounded-full"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
