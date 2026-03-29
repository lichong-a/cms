import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AUTH_COOKIE_NAME } from '../auth-constants'
import {
  clearSession,
  getAccessToken,
  getCurrentTenant,
  getRefreshToken,
  hasSession,
  persistSession,
  setCurrentTenant,
  syncSessionCookie,
} from '../session'

describe('session helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0`
  })

  it('persists tokens and auth state in localStorage', () => {
    persistSession({ accessToken: 'access-123', refreshToken: 'refresh-123' })

    expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'access-123')
    expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh-123')
    expect(localStorage.setItem).toHaveBeenCalledWith('isAuthenticated', 'true')
    expect(document.cookie).toContain(`${AUTH_COOKIE_NAME}=1`)
  })

  it('clears tokens, auth state, tenant and cookie', () => {
    clearSession({ includeTenant: true })

    expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken')
    expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken')
    expect(localStorage.removeItem).toHaveBeenCalledWith('isAuthenticated')
    expect(localStorage.removeItem).toHaveBeenCalledWith('currentTenant')
  })

  it('reads session values from localStorage', () => {
    vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
      const values: Record<string, string> = {
        accessToken: 'access-123',
        refreshToken: 'refresh-123',
        currentTenant: 'tenant-a',
      }

      return values[key] ?? null
    })

    expect(getAccessToken()).toBe('access-123')
    expect(getRefreshToken()).toBe('refresh-123')
    expect(getCurrentTenant()).toBe('tenant-a')
    expect(hasSession()).toBe(true)
  })

  it('stores tenant and syncs cookie when token exists', () => {
    vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
      if (key === 'accessToken') {
        return 'access-123'
      }

      return null
    })

    setCurrentTenant('tenant-b')
    syncSessionCookie()

    expect(localStorage.setItem).toHaveBeenCalledWith('currentTenant', 'tenant-b')
    expect(document.cookie).toContain(`${AUTH_COOKIE_NAME}=1`)
  })
})
