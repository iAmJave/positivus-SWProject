import { caseStudies } from '@/lib/db/db-casestudies';

export async function GET() {
  try {
    const { data, error } = await caseStudies.getAll();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
