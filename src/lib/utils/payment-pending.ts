export type PaymentInvoiceLike = {
  totalEarning?: number | string | null
  isPaid?: boolean | null
}

export type ManagerPayoutStatus = 'PAID' | 'PENDING' | null

export type ManagerInvoicePaymentState =
  | 'PAID'
  | 'MANAGER_PAYOUT_DUE'
  | 'MANAGER_PAYOUT_PENDING'
  | 'MANAGER_PAYMENT_DUE'

export function calculateManagerOwnerPendingAmount(
  invoices: Array<PaymentInvoiceLike & { managerPayoutStatus?: ManagerPayoutStatus }>,
  commissionRate: number,
): number {
  const unpaidByOwner = invoices.filter(
    (invoice) => !invoice.isPaid && invoice.managerPayoutStatus !== 'PAID',
  )

  return calculatePendingAmount(unpaidByOwner, commissionRate)
}

export function calculatePaidManagerPayoutAmount(
  payouts: Array<{ totalEarning?: number | string | null; isPaid?: boolean | null }>,
): number {
  return payouts
    .filter((payout) => payout.isPaid)
    .reduce((total, payout) => total + Number(payout.totalEarning || 0), 0)
}

export function getManagerInvoicePaymentState(
  invoice: { isPaid: boolean; managerPayoutStatus: ManagerPayoutStatus },
): ManagerInvoicePaymentState {
  if (invoice.isPaid) return 'PAID'
  if (invoice.managerPayoutStatus === 'PAID') return 'MANAGER_PAYMENT_DUE'
  if (invoice.managerPayoutStatus === 'PENDING') return 'MANAGER_PAYOUT_PENDING'
  return 'MANAGER_PAYOUT_DUE'
}

export function calculateManagerPayoutTotal(
  invoices: PaymentInvoiceLike[],
  commissionRate: number,
): number {
  const unpaidTotal = invoices
    .filter((invoice) => !invoice.isPaid)
    .reduce((sum, invoice) => sum + Number(invoice.totalEarning || 0), 0)

  return unpaidTotal + (unpaidTotal * (commissionRate / 100))
}

export function calculatePendingAmount(
  invoices: PaymentInvoiceLike[],
  commissionRate: number,
): number {
  return calculateManagerPayoutTotal(invoices, commissionRate)
}
