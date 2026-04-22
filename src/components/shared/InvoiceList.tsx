'use client'

import { useMemo, useState } from 'react'
import { Download, FileText } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldInput } from '@/components/ui/field-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

export type InvoiceStatus = 'paid' | 'pending' | 'failed' | 'refunded' | 'void'

export type InvoiceListItem = {
  id: string
  invoiceNumber: string
  date: string
  amount: number
  currency?: string
  status: InvoiceStatus
  description?: string
}

export type InvoiceListLabels = {
  title: string
  description: string
  searchPlaceholder: string
  statusFilterPlaceholder: string
  statuses: Record<InvoiceStatus, string>
  allStatuses: string
  viewButton: string
  emptyFiltered: string
  emptyList: string
  pageLabel: string
  previousButton: string
  nextButton: string
  invoicesCount: (count: number) => string
}

export type InvoiceListProps = {
  invoices: InvoiceListItem[]
  itemsPerPage?: number
  labels: InvoiceListLabels
  onViewInvoice?: (invoiceId: string) => void
  onDownloadInvoice?: (invoiceId: string) => void
  className?: string
}

function formatInvoiceDate(date: string): string {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parsed)
}

function formatInvoicePrice(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(amount)
}

function getStatusBadgeVariant(
  status: InvoiceStatus,
): 'outline' | 'orange' | 'error' | 'green' | 'secondary' {
  if (status === 'paid') return 'outline'
  if (status === 'pending') return 'orange'
  if (status === 'failed') return 'error'
  if (status === 'refunded') return 'green'
  return 'secondary'
}

export function InvoiceList({
  invoices,
  itemsPerPage = 10,
  labels,
  onViewInvoice,
  onDownloadInvoice,
  className,
}: InvoiceListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredInvoices = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return invoices.filter((invoice) => {
      const matchesQuery =
        !normalizedQuery ||
        invoice.invoiceNumber.toLowerCase().includes(normalizedQuery) ||
        invoice.description?.toLowerCase().includes(normalizedQuery)

      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter

      return matchesQuery && matchesStatus
    })
  }, [invoices, searchQuery, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / itemsPerPage))

  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredInvoices.slice(startIndex, startIndex + itemsPerPage)
  }, [currentPage, filteredInvoices, itemsPerPage])

  const hasInvoices = invoices.length > 0
  const emptyMessage = hasInvoices ? labels.emptyFiltered : labels.emptyList

  return (
    <Card className={cn('rounded-2xl border-border bg-card', className)}>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>{labels.title}</CardTitle>
            <CardDescription>{labels.description}</CardDescription>
          </div>
          <div className="text-muted-foreground text-sm">
            {labels.invoicesCount(filteredInvoices.length)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <FieldInput
              value={searchQuery}
              onValueChange={(value) => {
                setSearchQuery(value)
                setCurrentPage(1)
              }}
              label={labels.searchPlaceholder}
              placeholder={labels.searchPlaceholder}
              type="search"
              showClearButton={false}
              className="flex-1"
            />

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as 'all' | InvoiceStatus)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={labels.statusFilterPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{labels.allStatuses}</SelectItem>
                <SelectItem value="paid">{labels.statuses.paid}</SelectItem>
                <SelectItem value="pending">{labels.statuses.pending}</SelectItem>
                <SelectItem value="failed">{labels.statuses.failed}</SelectItem>
                <SelectItem value="refunded">{labels.statuses.refunded}</SelectItem>
                <SelectItem value="void">{labels.statuses.void}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paginatedInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                <FileText className="text-muted-foreground size-6" />
              </div>
              <p className="text-muted-foreground text-sm">{emptyMessage}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {paginatedInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm">{invoice.invoiceNumber}</span>
                        <Badge
                          variant={getStatusBadgeVariant(invoice.status)}
                          size="sm"
                        >
                          {labels.statuses[invoice.status]}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                        <span>{formatInvoiceDate(invoice.date)}</span>
                        {invoice.description ? (
                          <>
                            <span aria-hidden="true">•</span>
                            <span className="wrap-break-word">{invoice.description}</span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-medium text-sm">
                        {formatInvoicePrice(invoice.amount, invoice.currency ?? 'USD')}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => onViewInvoice?.(invoice.id)}
                        >
                          {labels.viewButton}
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label={`${labels.statuses[invoice.status]} ${invoice.invoiceNumber}`}
                          onClick={() => onDownloadInvoice?.(invoice.id)}
                        >
                          <Download className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 ? (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                      {labels.pageLabel} {currentPage} / {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((page) => page - 1)}
                      >
                        {labels.previousButton}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((page) => page + 1)}
                      >
                        {labels.nextButton}
                      </Button>
                    </div>
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
