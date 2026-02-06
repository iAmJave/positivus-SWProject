import { checkAdminAuth } from '@/lib/auth-check';
import { workingProcesses } from '@/lib/db/db-workingprocesses';
import { logAudit } from '@/lib/audit-logger';
import { NextRequest } from 'next/server';

export async function GET() {
  const auth = await checkAdminAuth();
  if ('error' in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { data, error } = await workingProcesses.getAllAdmin();
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await checkAdminAuth();
  if ('error' in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { data, error } = await workingProcesses.create(body);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    await logAudit({
      action: 'create',
      resourceType: 'WORKING_PROCESSES',
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
