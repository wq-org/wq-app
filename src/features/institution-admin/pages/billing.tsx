import { useTranslation } from 'react-i18next'

import { InvoiceList, type InvoiceListItem } from '@/components/shared'
import { Text } from '@/components/ui/text'
import { useUser } from '@/contexts/user'
import { InstitutionSubscriptionDetails } from '@/features/institution/components/InstitutionSubscriptionDetails'

import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'

function EmptyStateCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border bg-card p-6 space-y-1">
      <Text
        as="h2"
        variant="h2"
        className="text-lg font-semibold"
      >
        {title}
      </Text>
      <Text
        as="p"
        variant="body"
        color="muted"
      >
        {description}
      </Text>
    </div>
  )
}

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

const AdminBilling = () => {
  const { t } = useTranslation('features.institution-admin')
  const { getUserInstitutionId } = useUser()
  const institutionId = getUserInstitutionId()

  const invoiceListLabels = {
    title: t('billing.invoices.title'),
    description: t('billing.invoices.description'),
    searchPlaceholder: t('billing.invoices.searchPlaceholder'),
    statusFilterPlaceholder: t('billing.invoices.statusFilterPlaceholder'),
    statuses: {
      paid: t('billing.invoices.status.paid'),
      pending: t('billing.invoices.status.pending'),
      failed: t('billing.invoices.status.failed'),
      refunded: t('billing.invoices.status.refunded'),
      void: t('billing.invoices.status.void'),
    },
    allStatuses: t('billing.invoices.status.all'),
    viewButton: t('billing.invoices.view'),
    emptyFiltered: t('billing.invoices.emptyFiltered'),
    emptyList: t('billing.invoices.empty'),
    pageLabel: t('billing.invoices.page'),
    previousButton: t('billing.invoices.previous'),
    nextButton: t('billing.invoices.next'),
    invoicesCount: (count: number) =>
      t('billing.invoices.count', {
        count,
      }),
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

        {institutionId ? (
          <InstitutionSubscriptionDetails institutionId={institutionId} />
        ) : (
          <Text
            as="p"
            variant="small"
            color="muted"
          >
            {t('billing.noInstitution')}
          </Text>
        )}

        <InvoiceList
          invoices={mockInvoices}
          labels={invoiceListLabels}
          onDownloadInvoice={handleInvoiceDownload}
          onViewInvoice={handleInvoiceView}
        />

        <EmptyStateCard
          title={t('billing.paymentMethod.title')}
          description={t('billing.paymentMethod.empty')}
        />
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}

export { AdminBilling }
