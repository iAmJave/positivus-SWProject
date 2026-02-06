import { checkAdminAuth } from '@/lib/auth-check';
import { services } from '@/lib/db/db-services';
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
    const { data, error } = await services.getById(id);

    if (error || !data) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
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
    const { data, error } = await services.update(id, {
      ...body,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Log the update
    await logAudit({
      action: 'update',
      resourceType: 'SERVICES',
      resourceId: id,
      resourceName: data?.title,
      changes: body,
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
    const { error } = await services.delete(id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Log the deletion
    await logAudit({
      action: 'delete',
      resourceType: 'SERVICES',
      resourceId: id,
      request,
    });

    return Response.json({ message: 'Deleted successfully' });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
