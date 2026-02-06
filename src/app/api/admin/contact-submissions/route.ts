import { checkAdminAuth } from '@/lib/auth-check';
import { contactSubmissions } from '@/lib/db/db-contactsubmission';

export async function GET(request: Request) {
  const auth = await checkAdminAuth();
  if ('error' in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let result;
    if (status) {
      result = await contactSubmissions.getByStatus(status);
    } else {
      result = await contactSubmissions.getAll();
    }

    const { data, error } = result;
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
