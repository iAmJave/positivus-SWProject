import { checkAdminAuth } from '@/lib/auth-check';
import { contactSubmissions } from '@/lib/db/db-contactsubmission';
import { logAudit } from '@/lib/audit-logger';
import { NextRequest } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth();
  if ('error' in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const { data, error } = await contactSubmissions.getById(id);

    if (error || !data) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth();
  if ('error' in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return Response.json({ error: 'Status is required' }, { status: 400 });
    }

    const { data, error } = await contactSubmissions.updateStatus(id, status);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    await logAudit({
      action: 'update',
      resourceType: 'CONTACT_SUBMISSIONS',
      resourceId: id,
      changes: { status },
      request,
    });

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminAuth();
  if ('error' in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const { error } = await contactSubmissions.delete(id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    await logAudit({
      action: 'delete',
      resourceType: 'CONTACT_SUBMISSIONS',
      resourceId: id,
      request,
    });

    return Response.json({ message: 'Deleted successfully' });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
