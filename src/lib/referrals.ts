export const DEFAULT_REFERRAL_COMMISSION_RATE = 5

export function calculateReferralCommission(publisherPayoutAmount: number, commissionRate: number): number {
  return Math.round(publisherPayoutAmount * commissionRate) / 100
}
