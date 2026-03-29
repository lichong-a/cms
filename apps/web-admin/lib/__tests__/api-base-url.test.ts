import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { getApiOrigin, getApiV1BaseUrl } from '../api-base-url'

const originalApiUrl = process.env['NEXT_PUBLIC_API_URL']
const originalInternalApiUrl = process.env['API_INTERNAL_URL']
const originalLocation = window.location

beforeEach(() => {
  delete process.env['NEXT_PUBLIC_API_URL']
  delete process.env['API_INTERNAL_URL']
})

afterEach(() => {
  if (originalApiUrl === undefined) {
    delete process.env['NEXT_PUBLIC_API_URL']
  } else {
    process.env['NEXT_PUBLIC_API_URL'] = originalApiUrl
  }

  if (originalInternalApiUrl === undefined) {
    delete process.env['API_INTERNAL_URL']
  } else {
    process.env['API_INTERNAL_URL'] = originalInternalApiUrl
  }

  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
  })
})

describe('api-base-url', () => {
  it('appends /api/v1 when env only provides origin', () => {
    process.env['NEXT_PUBLIC_API_URL'] = 'https://api.example.com'

    expect(getApiOrigin()).toBe('https://api.example.com')
    expect(getApiV1BaseUrl()).toBe('https://api.example.com/api/v1')
  })

  it('normalizes env values ending with /api', () => {
    process.env['NEXT_PUBLIC_API_URL'] = 'https://api.example.com/api'

    expect(getApiOrigin()).toBe('https://api.example.com')
    expect(getApiV1BaseUrl()).toBe('https://api.example.com/api/v1')
  })

  it('normalizes env values ending with /api/v1', () => {
    process.env['NEXT_PUBLIC_API_URL'] = 'https://api.example.com/api/v1'

    expect(getApiOrigin()).toBe('https://api.example.com')
    expect(getApiV1BaseUrl()).toBe('https://api.example.com/api/v1')
  })

  it('uses the current host with port 3003 for direct LAN/dev access when no public API env is set', () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: new URL('http://192.168.0.10:3002/admin'),
    })

    expect(getApiOrigin()).toBe('http://192.168.0.10:3003')
    expect(getApiV1BaseUrl()).toBe('http://192.168.0.10:3003/api/v1')
  })

  it('uses the same browser origin when served behind a reverse proxy on standard ports', () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: new URL('https://cms.example.com/admin'),
    })

    expect(getApiOrigin()).toBe('https://cms.example.com')
    expect(getApiV1BaseUrl()).toBe('https://cms.example.com/api/v1')
  })
})
