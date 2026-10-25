import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db/prisma'
import { getTokenFromCookie, getUserFromToken, isOwner } from '@/lib/auth'
import { getCorsHeaders } from '@/config/cors'
import { calculatePendingAmount } from '@/lib/utils/payment-pending'
import { calculateReferralCommission, DEFAULT_REFERRAL_COMMISSION_RATE } from '@/lib/referrals'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const origin = request.headers.get('origin') || null
  const token = getTokenFromCookie(request.headers.get('cookie') || '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: getCorsHeaders(origin) })

  const user = await getUserFromToken(token)
  if (!user || !isOwner(user)) {
    return NextResponse.json({ error: 'Owner access required' }, { status: 403, headers: getCorsHeaders(origin) })
  }

  try {
    const { id: managerId } = await params
    const body = await request.json().catch(() => ({}))
    const paymentReference = typeof body?.paymentReference === 'string' ? body.paymentReference.trim() : ''
    if (!paymentReference) {
      return NextResponse.json({ error: 'Payment reference is required' }, { status: 400, headers: getCorsHeaders(origin) })
    }

    const manager = await prisma.user.findUnique({
      where: { id: managerId, role: 'MANAGER' },
      select: { id: true, payoutMethod: true, payoutAccount: true, bkashNumber: true, commissionRate: true, referredById: true },
    })
    if (!manager) return NextResponse.json({ error: 'Manager account not found' }, { status: 404, headers: getCorsHeaders(origin) })

    const invoices = await prisma.invoice.findMany({
      where: {
        isPaid: false,
        linkAccount: { userId: managerId },
        managerPayouts: { none: {} },
      },
      select: { id: true, totalEarning: true, payoutMethod: true, payoutAccount: true },
      orderBy: { createdAt: 'asc' },
    })
    const pendingReferralCommissions = await prisma.referralCommission.findMany({
      where: { referrerId: managerId, paidWithPayoutId: null },
      select: { id: true, amount: true },
    })
    if (invoices.length === 0 && pendingReferralCommissions.length === 0) {
      return NextResponse.json({ error: 'No unpaid publisher earnings or referral commissions found' }, { status: 404, headers: getCorsHeaders(origin) })
    }

    const payoutMethod = manager.payoutMethod || (manager.bkashNumber ? 'BKASH' : null)
    const payoutAccount = manager.payoutAccount || manager.bkashNumber || null
    if (!payoutMethod || !payoutAccount) {
      return NextResponse.json(
        { error: 'Manager payment details are not configured. Update the manager account before recording this payout.' },
        { status: 400, headers: getCorsHeaders(origin) },
      )
    }
    const commissionRate = Number(manager.commissionRate ?? 20) || 0
    const referralCommissionTotal = pendingReferralCommissions.reduce((total, commission) => total + commission.amount, 0)
    const totalEarning = calculatePendingAmount(invoices, commissionRate) + referralCommissionTotal
    const payoutNumber = `MP-${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
    const paidAt = new Date()

    const payout = await prisma.$transaction(async (transaction) => {
      const created = await transaction.managerPayout.create({
        data: {
          payoutNumber,
          managerId,
          totalEarning,
          invoiceCount: invoices.length,
          payoutMethod,
          payoutAccount,
          paymentReference,
          isPaid: true,
          paidAt,
          invoices: {
            create: invoices.map((invoice) => ({ invoiceId: invoice.id })),
          },
        },
        select: { id: true, payoutNumber: true, totalEarning: true, invoiceCount: true },
      })

      if (pendingReferralCommissions.length > 0) {
        const settled = await transaction.referralCommission.updateMany({
          where: {
            id: { in: pendingReferralCommissions.map((commission) => commission.id) },
            paidWithPayoutId: null,
          },
          data: { paidWithPayoutId: created.id, paidAt },
        })
        if (settled.count !== pendingReferralCommissions.length) {
          throw new Error('Referral commission payout changed while recording the publisher payment')
        }
      }

      const referrerId = manager.referredById
      if (referrerId) {
        const referrer = await transaction.user.findUnique({
          where: { id: referrerId },
          select: { referralCommissionRate: true },
        })
        const referralCommissionRate = referrer?.referralCommissionRate ?? DEFAULT_REFERRAL_COMMISSION_RATE
        await Promise.all(invoices.map((invoice) => {
          const publisherPayoutAmount = calculatePendingAmount([invoice], commissionRate)
          return transaction.referralCommission.create({
            data: {
              referrerId,
              referredUserId: managerId,
              invoiceId: invoice.id,
              sourcePayoutId: created.id,
              publisherPayoutAmount,
              commissionRate: referralCommissionRate,
              amount: calculateReferralCommission(publisherPayoutAmount, referralCommissionRate),
            },
          })
        }))
      }

      return created
    })

    return NextResponse.json({ success: true, payout }, { headers: getCorsHeaders(origin) })
  } catch (error) {
    console.error('Manager payout error:', error)
    return NextResponse.json({ error: 'Unable to record manager payout' }, { status: 500, headers: getCorsHeaders(origin) })
  }
}
