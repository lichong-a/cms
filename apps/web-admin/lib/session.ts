import {
  ACCESS_TOKEN_KEY,
  AUTH_COOKIE_NAME,
  AUTH_STATE_KEY,
  CURRENT_TENANT_KEY,
  REFRESH_TOKEN_KEY,
} from './auth-constants'

const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

function isBrowser() {
  return typeof window !== 'undefined'
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (!isBrowser()) {
    return
  }

  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`
}

function clearCookie(name: string) {
  if (!isBrowser()) {
    return
  }

  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`
}

export function getAccessToken() {
  if (!isBrowser()) {
    return null
  }

  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  if (!isBrowser()) {
    return null
  }

  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getCurrentTenant() {
  if (!isBrowser()) {
    return null
  }

  return localStorage.getItem(CURRENT_TENANT_KEY)
}

export function setCurrentTenant(tenantSlug: string) {
  if (!isBrowser()) {
    return
  }

  localStorage.setItem(CURRENT_TENANT_KEY, tenantSlug)
}

export function hasSession() {
  return Boolean(getAccessToken())
}

export function syncSessionCookie() {
  if (!isBrowser()) {
    return
  }

  if (getAccessToken()) {
    setCookie(AUTH_COOKIE_NAME, '1', AUTH_COOKIE_MAX_AGE_SECONDS)
    return
  }

  clearCookie(AUTH_COOKIE_NAME)
}

export function persistSession({
  accessToken,
  refreshToken,
}: {
  accessToken: string
  refreshToken?: string | null | undefined
}) {
  if (!isBrowser()) {
    return
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  localStorage.setItem(AUTH_STATE_KEY, 'true')
  setCookie(AUTH_COOKIE_NAME, '1', AUTH_COOKIE_MAX_AGE_SECONDS)
}

export function clearSession(options: { includeTenant?: boolean } = {}) {
  if (!isBrowser()) {
    return
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(AUTH_STATE_KEY)

  if (options.includeTenant) {
    localStorage.removeItem(CURRENT_TENANT_KEY)
  }

  clearCookie(AUTH_COOKIE_NAME)
}
