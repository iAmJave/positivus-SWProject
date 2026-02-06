import { logAudit } from '@/lib/audit-logger';
import { checkAdminAuth } from '@/lib/auth-check';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const auth = await checkAdminAuth();
    if ('error' in auth) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { table, items } = await request.json();

    if (!table || !Array.isArray(items) || items.length === 0) {
      return new Response('Invalid request', { status: 400 });
    }

    for (const item of items) {
      const { error } = await supabase
        .from(table)
        .update({ sort_order: item.sort_order })
        .eq('id', item.id);

      if (error) throw error;
    }

    await logAudit({
      action: 'reorder',
      resourceType: table,
      changes: { items: items.map(item => ({ id: item.id, sort_order: item.sort_order })) },
      request,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return new Response('Internal server error', { status: 500 });
  }
}
