import { checkAdminAuth } from '@/lib/auth-check';
import { services } from '@/lib/db/db-services';
import { checkRateLimit, createRateLimitResponse, getRateLimitConfig, getClientIdentifier } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit-logger';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Rate limiting - admin API: 100 requests per minute per IP
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
    const { data, error } = await services.getAllAdmin();
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting - admin API: 100 requests per minute per IP
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
    const body = await request.json();
    const { data, error } = await services.create(body);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Log the creation
    await logAudit({
      action: 'create',
      resourceType: 'SERVICES',
      resourceId: data?.id,
      resourceName: data?.title,
      changes: body,
      request,
    });

    return Response.json(data, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
