const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
];

const LAN_ALLOWED_PORTS = new Set(['3001', '3002', '3003']);

function parseOriginList(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function isPrivateIpv4(hostname: string) {
  const segments = hostname.split('.').map((segment) => Number(segment));
  if (segments.length !== 4 || segments.some((segment) => Number.isNaN(segment) || segment < 0 || segment > 255)) {
    return false;
  }

  const [first, second] = segments;

  if (first === 10) {
    return true;
  }

  if (first === 172 && second >= 16 && second <= 31) {
    return true;
  }

  return first === 192 && second === 168;
}

function isLoopbackHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '[::1]';
}

export function shouldAllowLanOrigins(env: NodeJS.ProcessEnv = process.env) {
  const configured = env['ALLOW_LAN_ORIGINS'];
  if (configured === 'true') {
    return true;
  }

  if (configured === 'false') {
    return false;
  }

  return env['NODE_ENV'] !== 'production';
}

export function buildAllowedOrigins(env: NodeJS.ProcessEnv = process.env) {
  return new Set([
    ...DEFAULT_ALLOWED_ORIGINS,
    ...parseOriginList(env['FRONTEND_URLS']),
  ]);
}

export function isAllowedOrigin(
  origin: string | undefined,
  allowedOrigins: Set<string>,
  options: { allowLanOrigins: boolean }
) {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.has(origin)) {
    return true;
  }

  if (!options.allowLanOrigins) {
    return false;
  }

  try {
    const url = new URL(origin);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }

    if (!LAN_ALLOWED_PORTS.has(url.port)) {
      return false;
    }

    return isLoopbackHost(url.hostname) || isPrivateIpv4(url.hostname);
  } catch {
    return false;
  }
}
