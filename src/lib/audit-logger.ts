import { NextRequest } from 'next/server';
import { auditLogs } from './db/db';
import { auth } from '@/types/auth';

interface LogAuditParams {
  action: 'create' | 'update' | 'delete' | 'reorder' | 'login';
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  changes?: Record<string, any>;
  request?: NextRequest;
}

export async function logAudit({
  action,
  resourceType,
  resourceId,
  resourceName,
  changes,
  request,
}: LogAuditParams) {
  try {
    const session = await auth();

    if (!session?.user?.email) return;

    const ipAddress =
      request?.headers.get('x-forwarded-for') ||
      request?.headers.get('x-real-ip') ||
      'unknown';

    const userAgent = request?.headers.get('user-agent') || '';

    await auditLogs.create({
      admin_user_id: session.user.id,
      admin_email: session.user.email,
      action,
      resource_type: resourceType,
      resource_id: resourceId ?? null,
      resource_name: resourceName ?? null,
      changes: changes ?? null,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}

