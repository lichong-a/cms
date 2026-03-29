import { buildAllowedOrigins, isAllowedOrigin, shouldAllowLanOrigins } from '@/utils/cors';

describe('cors utils', () => {
  it('allows default localhost origins', () => {
    const allowedOrigins = buildAllowedOrigins();

    expect(isAllowedOrigin('http://localhost:3001', allowedOrigins, { allowLanOrigins: false })).toBe(true);
    expect(isAllowedOrigin('http://127.0.0.1:3002', allowedOrigins, { allowLanOrigins: false })).toBe(true);
  });

  it('allows configured custom origins', () => {
    const allowedOrigins = buildAllowedOrigins({
      FRONTEND_URLS: 'https://cms.example.com,https://admin.example.com',
    } as NodeJS.ProcessEnv);

    expect(isAllowedOrigin('https://cms.example.com', allowedOrigins, { allowLanOrigins: false })).toBe(true);
    expect(isAllowedOrigin('https://admin.example.com', allowedOrigins, { allowLanOrigins: false })).toBe(true);
  });

  it('allows private network origins on frontend ports when LAN access is enabled', () => {
    const allowedOrigins = buildAllowedOrigins();

    expect(isAllowedOrigin('http://192.168.0.10:3001', allowedOrigins, { allowLanOrigins: true })).toBe(true);
    expect(isAllowedOrigin('http://10.0.0.8:3002', allowedOrigins, { allowLanOrigins: true })).toBe(true);
  });

  it('rejects private network origins when LAN access is disabled', () => {
    const allowedOrigins = buildAllowedOrigins();

    expect(isAllowedOrigin('http://192.168.0.10:3001', allowedOrigins, { allowLanOrigins: false })).toBe(false);
  });

  it('defaults LAN access to enabled outside production and disabled in production', () => {
    expect(shouldAllowLanOrigins({ NODE_ENV: 'development' } as NodeJS.ProcessEnv)).toBe(true);
    expect(shouldAllowLanOrigins({ NODE_ENV: 'production' } as NodeJS.ProcessEnv)).toBe(false);
    expect(shouldAllowLanOrigins({ NODE_ENV: 'production', ALLOW_LAN_ORIGINS: 'true' } as NodeJS.ProcessEnv)).toBe(true);
  });
});
