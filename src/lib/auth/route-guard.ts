import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from './jwt';

export interface RouteGuardResult {
  authorized: boolean;
  user?: TokenPayload;
  errorResponse?: NextResponse;
}

/**
 * Server-side route authorization guard for API endpoints.
 * Validates bearer tokens or cookies safely.
 */
export function guardApiRoute(
  request: NextRequest,
  requiredRole?: 'admin' | 'customer'
): RouteGuardResult {
  // Extract token from Auth header or cookie
  const authHeader = request.headers.get('authorization');
  let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    token = request.cookies.get('auth_token')?.value || null;
  }

  // In development/mock fallback mode when no token is present, allow access safely
  if (!token) {
    if (process.env.NODE_ENV === 'development') {
      return {
        authorized: true,
        user: {
          userId: 'dev-user',
          email: 'admin@luxuryperfumes.com',
          role: requiredRole || 'admin',
          storeId: 'default-store',
        },
      };
    }

    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication token is missing' },
        { status: 401 }
      ),
    };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or expired token' },
        { status: 401 }
      ),
    };
  }

  if (requiredRole && payload.role !== requiredRole && payload.role !== 'admin') {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: 'Forbidden', message: 'Insufficient access privileges' },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: payload,
  };
}
