import * as jose from 'jose';

let secretKey: Uint8Array;

const getJwtSecret = (): string => {
  return process.env['JWT_SECRET'] || 'cms-jwt-secret-change-in-production';
};

const getJwtExpiresIn = (): string => {
  return process.env['JWT_EXPIRES_IN'] || '7d';
};

const getSecretKey = (): Uint8Array => {
  if (!secretKey) {
    secretKey = new TextEncoder().encode(getJwtSecret());
  }
  return secretKey;
};

export interface JwtPayload {
  userId: number;
  email: string;
  username: string;
}

export const signToken = async (payload: JwtPayload): Promise<string> => {
  return await new jose.SignJWT(payload as jose.JWTPayload & JwtPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(getJwtExpiresIn())
    .sign(getSecretKey());
};

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  const { payload } = await jose.jwtVerify(token, getSecretKey());
  return payload as unknown as JwtPayload;
};

export default { signToken, verifyToken };
