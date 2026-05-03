import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui/text'
import { InvoiceList, type InvoiceListItem } from '@/components/shared'

import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'

const mockInvoices: InvoiceListItem[] = [
  {
    id: 'inv_001',
    invoiceNumber: 'INV-2026-001',
    date: '2026-03-10',
    amount: 299,
    currency: 'USD',
    status: 'paid',
    description: 'Pro Plan - Monthly',
  },
  {
    id: 'inv_002',
    invoiceNumber: 'INV-2026-002',
    date: '2026-02-10',
    amount: 299,
    currency: 'USD',
    status: 'paid',
    description: 'Pro Plan - Monthly',
  },
  {
    id: 'inv_003',
    invoiceNumber: 'INV-2026-003',
    date: '2026-01-10',
    amount: 299,
    currency: 'USD',
    status: 'pending',
    description: 'Pro Plan - Monthly',
  },
  {
    id: 'inv_004',
    invoiceNumber: 'INV-2025-012',
    date: '2025-12-10',
    amount: 299,
    currency: 'USD',
    status: 'failed',
    description: 'Pro Plan - Monthly',
  },
  {
    id: 'inv_005',
    invoiceNumber: 'INV-2025-011',
    date: '2025-11-10',
    amount: 149,
    currency: 'USD',
    status: 'refunded',
    description: 'Plan adjustment credit',
  },
]

export const InstitutionAdminBillingPage = () => {
  const { t } = useTranslation('features.institution-admin')

  const invoiceListLabels = {
    title: t('license.invoices.title'),
    description: t('license.invoices.description'),
    searchPlaceholder: t('license.invoices.searchPlaceholder'),
    statusFilterPlaceholder: t('license.invoices.statusFilterPlaceholder'),
    statuses: {
      paid: t('license.invoices.status.paid'),
      pending: t('license.invoices.status.pending'),
      failed: t('license.invoices.status.failed'),
      refunded: t('license.invoices.status.refunded'),
      void: t('license.invoices.status.void'),
    },
    allStatuses: t('license.invoices.status.all'),
    viewButton: t('license.invoices.view'),
    emptyFiltered: t('license.invoices.emptyFiltered'),
    emptyList: t('license.invoices.empty'),
    pageLabel: t('license.invoices.page'),
    previousButton: t('license.invoices.previous'),
    nextButton: t('license.invoices.next'),
    invoicesCount: (count: number) => t('license.invoices.count', { count }),
  }

  const handleInvoiceDownload = (invoiceId: string) => {
    console.log('Download invoice:', invoiceId)
  }

  const handleInvoiceView = (invoiceId: string) => {
    console.log('View invoice details:', invoiceId)
  }

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="flex flex-col gap-6">
        <div>
          <Text
            as="h1"
            variant="h1"
            className="text-2xl font-bold"
          >
            {t('billing.title')}
          </Text>
          <Text
            as="p"
            variant="body"
            color="muted"
          >
            {t('billing.subtitle')}
          </Text>
        </div>

        <InvoiceList
          invoices={mockInvoices}
          labels={invoiceListLabels}
          onDownloadInvoice={handleInvoiceDownload}
          onViewInvoice={handleInvoiceView}
        />
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}
