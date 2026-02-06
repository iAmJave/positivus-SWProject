import { auth } from '@/types/auth';

export async function checkAdminAuth() {
  const session = await auth();

  if (!session || !session.user) {
    return { error: 'Unauthorized', status: 401 } as const;
  }

  const user = session.user as any;

  if (user.role !== 'admin') {
    return { error: 'Forbidden - Admin access required', status: 403 } as const;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  } as const;
}
