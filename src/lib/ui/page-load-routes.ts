const pageLoadRoutes = new Set([
  '/admin/dashboard',
  '/owner/dashboard',
  '/publisher/dashboard',
  '/admin/links',
  '/owner/links',
  '/publisher/links',
  '/admin/postbacks',
  '/owner/postbacks',
  '/publisher/postbacks',
  '/admin/landing-builder',
  '/owner/landing-builder',
  '/publisher/landing-builder',
  '/admin/payments',
  '/owner/payments',
  '/publisher/payments',
  '/owner/templates',
  '/publisher/templates',
])

export function shouldShowPageLoader(pathname: string) {
  return pageLoadRoutes.has(pathname.replace(/\/+$/, ''))
}
