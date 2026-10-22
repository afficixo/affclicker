import test from 'node:test'
import assert from 'node:assert/strict'

import { isTargetRedirectIpRange } from './redirect-ip-range'

test('matches addresses in the configured 57.141.0.0/24 redirect range', () => {
  for (const ipAddress of ['57.141.0.0', '57.141.0.13', '57.141.0.255']) {
    assert.equal(isTargetRedirectIpRange(ipAddress), true)
  }
})

test('does not match addresses outside the configured range', () => {
  for (const ipAddress of ['57.141.1.1', '57.141.0.256', '57.141.0', 'not-an-ip']) {
    assert.equal(isTargetRedirectIpRange(ipAddress), false)
  }
})
