import test from 'node:test'
import assert from 'node:assert/strict'
import { markManagerTelegramPopupPending, consumeManagerTelegramPopupPending } from './telegram-popup'

test('markManagerTelegramPopupPending stores a pending popup flag', () => {
  const storage = new Map<string, string>()
  const fakeWindow = {
    sessionStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value)
      },
      removeItem: (key: string) => {
        storage.delete(key)
      },
    },
  } as unknown as Window

  markManagerTelegramPopupPending(fakeWindow)

  assert.equal(storage.get('affclicker-manager-telegram-popup-pending'), 'true')
})

test('consumeManagerTelegramPopupPending clears the pending flag after reading it', () => {
  const storage = new Map<string, string>()
  const fakeWindow = {
    sessionStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value)
      },
      removeItem: (key: string) => {
        storage.delete(key)
      },
    },
  } as unknown as Window

  storage.set('affclicker-manager-telegram-popup-pending', 'true')

  assert.equal(consumeManagerTelegramPopupPending(fakeWindow), true)
  assert.equal(storage.has('affclicker-manager-telegram-popup-pending'), false)
  assert.equal(consumeManagerTelegramPopupPending(fakeWindow), false)
})
