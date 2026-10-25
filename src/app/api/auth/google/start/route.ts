import { NextResponse } from 'next/server'
import { buildGoogleAuthUrl, getGoogleOAuthConfig, getGoogleOAuthRedirectUri, normalizeGoogleRedirectPath } from '@/lib/auth/google'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const redirect = normalizeGoogleRedirectPath(searchParams.get('redirect'))
  const requestedPurpose = searchParams.get('purpose')
  const purpose = requestedPurpose === 'password-reset' || requestedPurpose === 'email-verification'
    ? requestedPurpose
    : undefined
  const state = Buffer.from(JSON.stringify({ redirect, purpose })).toString('base64url')
  const { clientId } = getGoogleOAuthConfig()
  const redirectUri = getGoogleOAuthRedirectUri(request.url)

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Google OAuth is not configured' }, { status: 500 })
  }

  const authUrl = buildGoogleAuthUrl(redirectUri, state)
  return NextResponse.redirect(authUrl)
}
