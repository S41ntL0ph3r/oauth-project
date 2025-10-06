import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.AUTH_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = '24h';
const COOKIE_NAME = 'admin-token';

export interface AdminJWTPayload {
  adminId: string;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Gera um token JWT para admin
 */
export function generateAdminToken(payload: Omit<AdminJWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'oauth-project-admin',
    audience: 'admin-panel'
  });
}

/**
 * Verifica e decodifica um token JWT
 */
export function verifyAdminToken(token: string): AdminJWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'oauth-project-admin',
      audience: 'admin-panel'
    }) as AdminJWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Obtém o token do cookie (Server Components)
 */
export async function getAdminTokenFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    return cookie?.value || null;
  } catch (error) {
    console.error('Error getting admin token from cookies:', error);
    return null;
  }
}

/**
 * Obtém o token do request (API Routes)
 */
export function getAdminTokenFromRequest(request: NextRequest): string | null {
  try {
    // Primeiro tenta do cookie
    const cookie = request.cookies.get(COOKIE_NAME);
    if (cookie) return cookie.value;

    // Fallback para Authorization header
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  } catch (error) {
    console.error('Error getting admin token from request:', error);
    return null;
  }
}

/**
 * Verifica se admin está autenticado (Server Components)
 */
export async function getAuthenticatedAdmin(): Promise<AdminJWTPayload | null> {
  const token = await getAdminTokenFromCookies();
  if (!token) return null;
  return verifyAdminToken(token);
}

/**
 * Verifica se admin está autenticado (API Routes)
 */
export function getAuthenticatedAdminFromRequest(request: NextRequest): AdminJWTPayload | null {
  const token = getAdminTokenFromRequest(request);
  console.log('Token from request:', token ? 'Found' : 'Not found');
  if (!token) return null;
  
  const result = verifyAdminToken(token);
  console.log('Token verification result:', result ? 'Valid' : 'Invalid');
  return result;
}

/**
 * Cria cookie HTTP-Only seguro
 */
export function createSecureCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 24 * 60 * 60, // 24 horas em segundos
    path: '/' // Alterar para root path para funcionar em todo o site
  };
}

/**
 * Cookie para logout
 */
export function createLogoutCookie() {
  return {
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 0,
    path: '/' // Alterar para root path
  };
}

/**
 * Middleware helper para verificar permissões
 */
export function hasPermission(adminRole: string, requiredRoles: string[]): boolean {
  const roleHierarchy = {
    'SUPER_ADMIN': 3,
    'ADMIN': 2,
    'EDITOR': 1
  };

  const adminLevel = roleHierarchy[adminRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = Math.max(...requiredRoles.map(role => 
    roleHierarchy[role as keyof typeof roleHierarchy] || 0
  ));

  return adminLevel >= requiredLevel;
}

/**
 * Decorator para rotas que requerem autenticação
 */
export function requireAuth(
  handler: (request: NextRequest & { admin?: AdminJWTPayload }) => Promise<Response>, 
  requiredRoles: string[] = []
) {
  return async (request: NextRequest) => {
    const admin = getAuthenticatedAdminFromRequest(request);
    
    if (!admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (requiredRoles.length > 0 && !hasPermission(admin.role, requiredRoles)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Adiciona admin ao request para uso no handler
    const requestWithAdmin = Object.assign(request, { admin });
    return handler(requestWithAdmin);
  };
}
