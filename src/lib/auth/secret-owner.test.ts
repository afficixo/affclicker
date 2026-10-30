import test from 'node:test'
import assert from 'node:assert/strict'

const originalSecretOwnerUsername = process.env.SECRET_OWNER_USERNAME
const originalSecretOwnerPassword = process.env.SECRET_OWNER_PASSWORD

process.env.SECRET_OWNER_USERNAME = 'hidden-owner'
process.env.SECRET_OWNER_PASSWORD = 'super-secret-password'

test('secret owner usernames are treated as owners for permission checks', async () => {
  const { normalizeEffectiveUserRole, isOwner, isSecretOwnerLogin } = await import('./index')
  const secretUser = { id: 'secret-owner', username: 'hidden-owner', role: 'ADMIN' as const }

  assert.equal(normalizeEffectiveUserRole(secretUser), 'OWNER')
  assert.equal(isOwner(secretUser), true)
  assert.equal(isSecretOwnerLogin('hidden-owner'), true)
})

test('non-secret users keep their normal permissions', async () => {
  const { normalizeEffectiveUserRole, isOwner, isSecretOwnerLogin } = await import('./index')
  const regularUser = { id: 'regular-user', username: 'normal-user', role: 'ADMIN' as const }

  assert.equal(normalizeEffectiveUserRole(regularUser), 'ADMIN')
  assert.equal(isOwner(regularUser), false)
  assert.equal(isSecretOwnerLogin('normal-user'), false)
})

process.on('exit', () => {
  if (originalSecretOwnerUsername === undefined) {
    delete process.env.SECRET_OWNER_USERNAME
  } else {
    process.env.SECRET_OWNER_USERNAME = originalSecretOwnerUsername
  }

  if (originalSecretOwnerPassword === undefined) {
    delete process.env.SECRET_OWNER_PASSWORD
  } else {
    process.env.SECRET_OWNER_PASSWORD = originalSecretOwnerPassword
  }
})
