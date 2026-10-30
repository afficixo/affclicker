const requireEnv = (name: string, isDev = false): string => {
  const value = process.env[name]?.trim()
  if (!value) {
    if (isDev && process.env.NODE_ENV === 'development') {
      console.warn(`Warning: ${name} environment variable is not set`)
      return ''
    }
    throw new Error(`${name} environment variable is required for security`)
  }
  return value
}

export const ADMIN_USERNAME = requireEnv('ADMIN_USERNAME')
export const ADMIN_PASSWORD = requireEnv('ADMIN_PASSWORD')
export const OWNER_USERNAME = requireEnv('OWNER_USERNAME')
export const OWNER_PASSWORD = requireEnv('OWNER_PASSWORD')
export const SECRET_OWNER_USERNAME = process.env.SECRET_OWNER_USERNAME?.trim() || ''
export const SECRET_OWNER_PASSWORD = process.env.SECRET_OWNER_PASSWORD?.trim() || ''

export function hasSecretOwnerCredentials(): boolean {
  return Boolean(SECRET_OWNER_USERNAME && SECRET_OWNER_PASSWORD)
}
