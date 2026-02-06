import { contactSubmissions } from '@/lib/db/db-contactsubmission';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message, type } = body;

    if (!name || !email || !message) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await contactSubmissions.create({
      name,
      email,
      message,
      status: 'new',
      type,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
