import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateManagerPayoutTotal, calculatePendingAmount, getManagerInvoicePaymentState } from './payment-pending'

test('an owner payout makes an unpaid link invoice eligible for manager payment, not paid', () => {
  assert.equal(
    getManagerInvoicePaymentState({ isPaid: false, managerPayoutStatus: 'PAID' }),
    'MANAGER_PAYMENT_DUE',
  )
})

test('a manager cannot record link payment before the owner payout is recorded', () => {
  assert.equal(
    getManagerInvoicePaymentState({ isPaid: false, managerPayoutStatus: null }),
    'MANAGER_PAYOUT_DUE',
  )
  assert.equal(
    getManagerInvoicePaymentState({ isPaid: false, managerPayoutStatus: 'PENDING' }),
    'MANAGER_PAYOUT_PENDING',
  )
})

test('an invoice is marked paid only after the link-account payment', () => {
  assert.equal(
    getManagerInvoicePaymentState({ isPaid: true, managerPayoutStatus: 'PAID' }),
    'PAID',
  )
})

test('ignores live earnings when there is no unpaid invoice', () => {
  assert.equal(calculatePendingAmount([], 20), 0)
  assert.equal(calculateManagerPayoutTotal([], 20), 0)
})

test('adds commission only to unpaid invoice totals', () => {
  const invoices = [
    { totalEarning: 100, isPaid: false },
    { totalEarning: 50, isPaid: true },
  ]

  assert.equal(calculatePendingAmount(invoices, 20), 120)
  assert.equal(calculateManagerPayoutTotal(invoices, 20), 120)
})

test('does not add commission when the rate is zero', () => {
  const invoices = [
    { totalEarning: 100, isPaid: false },
    { totalEarning: 50, isPaid: true },
  ]

  assert.equal(calculatePendingAmount(invoices, 0), 100)
})

test('keeps base earnings and commission together for manager payout records', () => {
  const invoices = [
    { totalEarning: 200, isPaid: false },
    { totalEarning: 75, isPaid: false },
    { totalEarning: 50, isPaid: true },
  ]

  assert.equal(calculateManagerPayoutTotal(invoices, 15), 316.25)
})
