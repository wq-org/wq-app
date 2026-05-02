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
import type { FileItem } from '../types/files.types'
import { FILE_TYPE_CONFIG } from '../types/files.types'
import { CloudFileCard } from './CloudFileCard'
import { CloudTableEmptyView } from './CloudTableEmptyView'
import { useTranslation } from 'react-i18next'

export type CloudTableViewProps = {
  files: FileItem[]
  onRefresh?: () => void
}

export function CloudTableView({ files, onRefresh }: CloudTableViewProps) {
  const { t } = useTranslation('features.files')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const itemsPerPage = 12
  const totalPages = Math.ceil(files.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentFiles = files.slice(startIndex, endIndex)

  const handleOpenFile = (file: FileItem) => {
    setSelectedFile(file)
    setIsDrawerOpen(true)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (files.length === 0) {
    return <CloudTableEmptyView />
  }

  return (
    <div className="w-full flex flex-col items-stretch gap-2 animate-in fade-in-0 slide-in-from-bottom-4">
      <div className="w-full rounded-4xl border border-border bg-card p-6 shadow-sm animate-in fade-in-0 slide-in-from-bottom-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-center font-light text-muted-foreground">
                {t('table.columns.type')}
              </TableHead>
              <TableHead className="text-left font-light text-muted-foreground">
                {t('table.columns.filename')}
              </TableHead>
              <TableHead className="text-center font-light text-muted-foreground">
                {t('table.columns.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentFiles.map((file) => {
              const config = FILE_TYPE_CONFIG[file.type] || FILE_TYPE_CONFIG.PDF
              const Icon = config.Icon
              return (
                <TableRow
                  key={file.id}
                  className="border-b last:border-0 transition-colors animate-in fade-in-0 slide-in-from-bottom-2"
                >
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border ${config.bgColor} ${config.borderColor}`}
                      >
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex h-10 min-h-10 items-center gap-3 text-foreground">
                      {file.filename}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="darkblue"
                      size="sm"
                      onClick={() => handleOpenFile(file)}
                    >
                      {t('table.actions.open')}
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
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
              <PaginationItem key={index}>
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

      {selectedFile ? (
        <CloudFileCard
          file={selectedFile}
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          onFileDeleted={() => {
            setIsDrawerOpen(false)
            setSelectedFile(null)
            if (onRefresh) {
              onRefresh()
            }
          }}
        />
      ) : null}
    </div>
  )
}
