import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateManagerPayoutTotal, calculatePendingAmount } from './payment-pending'

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
