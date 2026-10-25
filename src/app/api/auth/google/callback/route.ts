import { NextResponse } from 'next/server'
import { createGoogleAuthResponse, exchangeGoogleCode, getGoogleOAuthRedirectUri, getGoogleUserInfo, findGoogleUserByEmail, normalizeGoogleRedirectPath } from '@/lib/auth/google'
import { generateGooglePasswordResetToken, getTokenFromCookie, getUserFromToken, JWT_EXPIRY } from '@/lib/auth'
import { getDashboardPath } from '@/lib/auth/dashboard-path'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    try {
      const decoded = JSON.parse(Buffer.from(state || '', 'base64url').toString('utf-8'))
      if (decoded.purpose === 'email-verification') {
        const destination = new URL('/admin/settings?google_verify_error=cancelled', request.url)
        return NextResponse.redirect(destination)
      }
    } catch {
      // Fall through to the existing login error page for invalid OAuth state.
    }
    return NextResponse.redirect(new URL('/login?error=google_auth_failed', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url))
  }

  try {
    let redirectPath = getDashboardPath(null)
    let isPasswordReset = false
    let isEmailVerification = false
    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8'))
        if (typeof decoded.redirect === 'string' && decoded.redirect) {
          redirectPath = normalizeGoogleRedirectPath(decoded.redirect)
        }
        isPasswordReset = decoded.purpose === 'password-reset'
        isEmailVerification = decoded.purpose === 'email-verification'
      } catch {
        // ignore invalid state and fall back to the default path
      }
    }

    const redirectUri = getGoogleOAuthRedirectUri(request.url)
    if (!redirectUri) {
      throw new Error('Google OAuth redirect URI is not configured')
    }

    const tokenResponse = await exchangeGoogleCode(code, redirectUri)
    const accessToken = tokenResponse.access_token
    if (!accessToken) {
      throw new Error('Google did not return an access token')
    }

    const googleUser = await getGoogleUserInfo(accessToken)

    if (isEmailVerification) {
      redirectPath = '/admin/settings'
      const destination = new URL(redirectPath, request.url)
      const token = getTokenFromCookie(request.headers.get('cookie') || '')
      const currentUser = token ? await getUserFromToken(token) : null
      const googleEmail = googleUser.email?.trim().toLowerCase()

      if (!currentUser || !googleEmail || googleEmail !== currentUser.email?.trim().toLowerCase()) {
        destination.searchParams.set('google_verify_error', 'account_mismatch')
        return NextResponse.redirect(destination)
      }

      if (googleUser.email_verified !== true) {
        destination.searchParams.set('google_verify_error', 'email_unverified')
        return NextResponse.redirect(destination)
      }

      try {
        await prisma.user.update({
          where: { id: currentUser.id },
          data: {
            googleProfilePicture: googleUser.picture || null,
            googleEmailVerified: true,
            googleEmailVerifiedAt: new Date(),
            ...(!currentUser.fullName && googleUser.name ? { fullName: googleUser.name } : {}),
          },
        })
      } catch (updateError) {
        if (
          typeof updateError === 'object' &&
          updateError !== null &&
          'code' in updateError &&
          updateError.code === 'P2022'
        ) {
          console.error('Google verification fields are not available; apply pending Prisma migrations.')
          destination.searchParams.set('google_verify_error', 'setup_required')
          return NextResponse.redirect(destination)
        }
        throw updateError
      }
      destination.searchParams.set('google_verified', '1')
      return NextResponse.redirect(destination)
    }

    const user = await findGoogleUserByEmail(googleUser.email || '')

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=google_account_not_found', request.url))
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.redirect(new URL('/login?approval_pending=1', request.url))
    }

    if (!isPasswordReset) redirectPath = getDashboardPath(user.role)

    const authResponse = await createGoogleAuthResponse(user)

    const destination = isPasswordReset
      ? new URL(redirectPath, request.url)
      : new URL(`/login?success=google-authenticated&redirect=${encodeURIComponent(redirectPath)}`, request.url)
    if (isPasswordReset) destination.searchParams.set('google_reset', '1')
    const response = NextResponse.redirect(destination)
    response.cookies.set('auth-token', authResponse.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: JWT_EXPIRY,
      path: '/',
    })

    if (isPasswordReset) {
      response.cookies.set('google-password-reset', generateGooglePasswordResetToken(user.id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600,
        path: '/',
      })
    }

    return response
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(new URL('/login?error=google_auth_failed', request.url))
  }
}
