const DEFAULT_API_ORIGIN = 'http://localhost:3003'
const DEFAULT_API_PORT = '3003'

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

function stripApiPath(value: string) {
  const trimmed = trimTrailingSlash(value)

  if (trimmed.endsWith('/api/v1')) {
    return trimmed.slice(0, -'/api/v1'.length)
  }

  if (trimmed.endsWith('/api')) {
    return trimmed.slice(0, -'/api'.length)
  }

  return trimmed
}

export function getApiOrigin() {
  if (typeof window === 'undefined') {
    const internal = process.env['API_INTERNAL_URL']
    if (internal) {
      return stripApiPath(internal)
    }

    const configured = process.env['NEXT_PUBLIC_API_URL']
    if (configured) {
      return stripApiPath(configured)
    }

    return DEFAULT_API_ORIGIN
  }

  const configured = process.env['NEXT_PUBLIC_API_URL']
  if (configured) {
    return stripApiPath(configured)
  }

  const { protocol, host, hostname, port } = window.location
  if (!port || port === '80' || port === '443' || port === DEFAULT_API_PORT) {
    return `${protocol}//${host}`
  }

  return `${protocol}//${hostname}:${DEFAULT_API_PORT}`
}

export function getApiV1BaseUrl() {
  return `${getApiOrigin()}/api/v1`
}
