import { useState } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { HoldToDeleteIconButton } from '@/components/ui/holdDeleteIconButton'
import type { Lesson } from '../types/lesson.types'
import { EmptyLessonsView } from './EmptyLessonsView'
import { useTranslation } from 'react-i18next'

export type OnViewLesson = (lessonId: string) => void
export type OnDeleteLesson = (lessonId: string) => void

export interface CourseLessonTableProps {
  lessons: Lesson[]
  onView?: OnViewLesson
  onDelete?: OnDeleteLesson
}

const ITEMS_PER_PAGE = 10

export function CourseLessonTable({ lessons, onView, onDelete }: CourseLessonTableProps) {
  const { t } = useTranslation('features.courses')
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(lessons.length / ITEMS_PER_PAGE))
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentLessons = lessons.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = []
    const maxVisible = 5
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }
    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i)
      pages.push('ellipsis')
      pages.push(totalPages)
    } else if (currentPage >= totalPages - 2) {
      pages.push(1)
      pages.push('ellipsis')
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('ellipsis')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
      pages.push('ellipsis')
      pages.push(totalPages)
    }
    return pages
  }

  if (lessons.length === 0) {
    return <EmptyLessonsView />
  }

  return (
    <div className="w-full flex flex-col items-center justify-center gap-6 animate-in fade-in-0 slide-in-from-bottom-4">
      <div className="w-full bg-white rounded-4xl shadow p-6 animate-in fade-in-0 slide-in-from-bottom-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left text-gray-400 font-light">
                {t('lessonTable.columns.title')}
              </TableHead>
              <TableHead className="text-left text-gray-400 font-light">
                {t('lessonTable.columns.description')}
              </TableHead>
              <TableHead className="text-center text-gray-400 font-light w-[100px]">
                {t('lessonTable.columns.action')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentLessons.map((lesson) => (
              <TableRow
                key={lesson.id}
                className="border-b last:border-0 hover:bg-gray-50 transition-colors animate-in fade-in-0 slide-in-from-bottom-2"
              >
                <TableCell className="text-left">
                  <span className="font-medium text-gray-900">{lesson.title}</span>
                </TableCell>
                <TableCell className="text-left">
                  <span className="text-sm text-muted-foreground line-clamp-1">
                    {lesson.description || t('lessonTable.noDescription')}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-500 border-0 hover:opacity-80 hover:bg-blue-100 hover:text-blue-500 transition-all duration-200 active:animate-in active:zoom-in-95"
                      onClick={() => onView?.(lesson.id)}
                    >
                      {t('lessonTable.actions.view')}
                    </Button>
                    <HoldToDeleteIconButton
                      size="sm"
                      onDelete={onDelete ? () => onDelete(lesson.id) : undefined}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <Pagination className="animate-in fade-in-0 slide-in-from-bottom-3">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={
                  currentPage === 1
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer active:animate-in active:zoom-in-95'
                }
              />
            </PaginationItem>
            {getPageNumbers().map((page, index) => (
              <PaginationItem key={`${page}-${index}`}>
                {page === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => handlePageChange(page as number)}
                    isActive={currentPage === page}
                    className="cursor-pointer active:animate-in active:zoom-in-95"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className={
                  currentPage === totalPages
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer active:animate-in active:zoom-in-95'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
