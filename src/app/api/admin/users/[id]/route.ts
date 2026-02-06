import { checkAdminAuth } from '@/lib/auth-check';
import { users, auditLogs } from '@/lib/db/db';
import { hashPassword } from '@/lib/password/password';
import { checkRateLimit, createRateLimitResponse, getRateLimitConfig, getClientIdentifier } from '@/lib/rate-limit';
import { NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const clientId = getClientIdentifier(request);
  const config = getRateLimitConfig('adminAPI');
  const { allowed, resetTime } = await checkRateLimit(clientId, config);

  if (!allowed) return createRateLimitResponse(resetTime);

  const auth = await checkAdminAuth();
  if ('error' in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { email, password, role, is_active } = body;

    const updates: Record<string, any> = {};
    if (email) updates.email = email;
    if (password) updates.password_hash = await hashPassword(password);
    if (role) updates.role = role;
    if (typeof is_active === 'boolean') updates.is_active = is_active;

    const { data: oldUser } = await users.getById(id);
    const { data, error } = await users.update(id, updates);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const changes: Record<string, any> = {};
    if (oldUser) {
      if (email && oldUser.email !== email) changes.email = email;
      if (role && oldUser.role !== role) changes.role = role;
      if (typeof is_active === 'boolean' && oldUser.is_active !== is_active) {
        changes.is_active = is_active;
      }
    }

    await auditLogs.create({
      admin_user_id: auth.id,
      admin_email: auth.email,
      action: 'update',
      resource_type: 'USER',
      resource_id: id,
      resource_name: email || oldUser?.email || null,
      changes: Object.keys(changes).length ? changes : null,
      ip_address:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('cf-connecting-ip'),
      user_agent: request.headers.get('user-agent'),
    });

    return Response.json(data);
  } catch (err) {
    console.error('Error updating user:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const clientId = getClientIdentifier(request);
  const config = getRateLimitConfig('adminAPI');
  const { allowed, resetTime } = await checkRateLimit(clientId, config);

  if (!allowed) return createRateLimitResponse(resetTime);

  const auth = await checkAdminAuth();
  if ('error' in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { data: user } = await users.getById(id);
    const { error } = await users.delete(id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    await auditLogs.create({
      admin_user_id: auth.id,
      admin_email: auth.email,
      action: 'delete',
      resource_type: 'USER',
      resource_id: id,
      resource_name: user?.email || null,
      changes: user ? { deleted_user: user.email } : null,
      ip_address:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('cf-connecting-ip'),
      user_agent: request.headers.get('user-agent'),
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('Error deleting user:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

