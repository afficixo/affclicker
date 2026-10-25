import { NextResponse } from 'next/server'
import { getTokenFromCookie, getUserFromToken, isManager } from '@/lib/auth'
import { getCorsHeaders } from '@/config/cors'
import { prisma } from '@/lib/db/prisma'
import { DEFAULT_REFERRAL_COMMISSION_RATE } from '@/lib/referrals'
import { calculatePaidManagerPayoutAmount } from '@/lib/utils/payment-pending'

export async function GET(request: Request) {
  const origin = request.headers.get('origin') || null
  const token = getTokenFromCookie(request.headers.get('cookie') || '')
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: getCorsHeaders(origin) })
  }

  const user = await getUserFromToken(token)
  if (!user || !isManager(user)) {
    return NextResponse.json({ error: 'Publisher access required' }, { status: 403, headers: getCorsHeaders(origin) })
  }

  try {
    const publisher = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        referralCode: true,
        referralCommissionRate: true,
        referrals: {
          select: { id: true, username: true, createdAt: true, status: true },
          orderBy: { createdAt: 'desc' },
        },
        referralCommissionsEarned: {
          select: {
            id: true,
            amount: true,
            publisherPayoutAmount: true,
            createdAt: true,
            paidAt: true,
            referredUser: { select: { username: true } },
            invoice: { select: { invoiceNumber: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        managerPayouts: {
          where: { isPaid: true },
          select: { totalEarning: true, isPaid: true },
        },
      },
    })
    if (!publisher) {
      return NextResponse.json({ error: 'Publisher account not found' }, { status: 404, headers: getCorsHeaders(origin) })
    }

    const commissions = publisher.referralCommissionsEarned.map((commission) => ({
      ...commission,
      status: commission.paidAt ? 'paid' : 'pending',
    }))
    const pendingAmount = commissions
      .filter((commission) => !commission.paidAt)
      .reduce((total, commission) => total + commission.amount, 0)
    const paidAmount = commissions
      .filter((commission) => commission.paidAt)
      .reduce((total, commission) => total + commission.amount, 0)

    return NextResponse.json({
      referralCode: publisher.referralCode,
      commissionRate: publisher.referralCommissionRate ?? DEFAULT_REFERRAL_COMMISSION_RATE,
      referredPublishers: publisher.referrals,
      commissions,
      summary: {
        referrals: publisher.referrals.length,
        pendingAmount,
        paidAmount,
        totalAmount: pendingAmount + paidAmount,
        managerPaidOutAmount: calculatePaidManagerPayoutAmount(publisher.managerPayouts),
      },
    }, { headers: getCorsHeaders(origin) })
  } catch (error) {
    console.error('Publisher referrals GET error:', error)
    return NextResponse.json({ error: 'Unable to load referral details' }, { status: 500, headers: getCorsHeaders(origin) })
  }
}
