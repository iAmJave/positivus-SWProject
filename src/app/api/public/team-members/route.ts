import { teamMembers } from '@/lib/db/db-teammembers';

export async function GET() {
  try {
    const { data, error } = await teamMembers.getAll();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
