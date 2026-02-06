import { checkAdminAuth } from '@/lib/auth-check';
import { workingProcesses } from '@/lib/db/db-workingprocesses';
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
    const { data, error } = await workingProcesses.getById(id);

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
    const { data, error } = await workingProcesses.update(id, {
      ...body,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    await logAudit({
      action: 'update',
      resourceType: 'WORKING_PROCESSES',
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
    const { error } = await workingProcesses.delete(id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    await logAudit({
      action: 'delete',
      resourceType: 'WORKING_PROCESSES',
      resourceId: id,
      request,
    });

    return Response.json({ message: 'Deleted successfully' });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
