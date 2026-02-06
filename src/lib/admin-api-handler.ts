import { checkRateLimit, createRateLimitResponse, getRateLimitConfig, getClientIdentifier } from '@/lib/rate-limit';
import { checkAdminAuth } from '@/lib/auth-check';
import { NextRequest } from 'next/server';

export async function withAdminRateLimit(
  request: NextRequest,
  handler: () => Promise<Response>
): Promise<Response> {
  // Rate limiting - admin API: 100 requests per minute per IP
  const clientId = getClientIdentifier(request);
  const config = getRateLimitConfig('adminAPI');
  const { allowed, resetTime } = await checkRateLimit(clientId, config);

  if (!allowed) {
    return createRateLimitResponse(resetTime);
  }

  // Check authentication
  const auth = await checkAdminAuth();
  if ('error' in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  // Call the handler
  return handler();
}
