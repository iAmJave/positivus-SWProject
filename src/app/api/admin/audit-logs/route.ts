import { checkAdminAuth } from '@/lib/auth-check';
import { auditLogs } from '@/lib/db/db';
import { checkRateLimit, createRateLimitResponse, getRateLimitConfig, getClientIdentifier } from '@/lib/rate-limit';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const config = getRateLimitConfig('adminAPI');
  const { allowed, resetTime } = await checkRateLimit(clientId, config);

  if (!allowed) {
    return createRateLimitResponse(resetTime);
  }

  const auth = await checkAdminAuth();
  if ('error' in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let result;
    if (action) {
      result = await auditLogs.getByAction(action, limit);
    } else {
      result = await auditLogs.getAll(limit, offset);
    }

    const { data, error } = result;
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data || []);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
