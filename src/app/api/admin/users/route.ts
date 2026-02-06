import { checkAdminAuth } from '@/lib/auth-check';
import { users, auditLogs } from '@/lib/db/db';
import { hashPassword } from '@/lib/password/password';
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
    const { data, error } = await users.getAll();
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const { email, password, role, is_active } = body;

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const { data, error } = await users.create(email, hashedPassword, role || 'admin');

    if (error) {
      console.error('Supabase create user error:', error);

      // Check for duplicate email
      if (error.code === '23505' && error.details?.includes('(email)')) {
        return Response.json(
          { error: 'This email is already registered.' },
          { status: 400 }
        );
      }

      return Response.json(
        { error: 'Failed to create user. Please try again.' },
        { status: 500 }
      );
    }

    // Log action
    await auditLogs.create({
      admin_user_id: auth.id,
      admin_email: auth.email,
      action: 'create',
      resource_type: 'USER',
      resource_id: data?.id || null,
      resource_name: email,
      changes: { email, role },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip'),
      user_agent: request.headers.get('user-agent'),
    });

    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json({ error }, { status: 500 });
  }
}
