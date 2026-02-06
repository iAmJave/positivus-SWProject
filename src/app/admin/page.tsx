'use client';

import { signOut, useSession } from 'next-auth/react';

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {session?.user?.email}
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">User Information</h2>
              <div className="mt-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium text-foreground">Email:</span>{' '}
                  <span className="font -bold">{session?.user?.email}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-foreground">Role:</span>{' '}
                  <span className="text-black font-bold">
                    {(session?.user as any)?.role || 'user'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-6 bg-muted/50 border-muted">
          <h3 className="font-semibold text-foreground mb-2">Protected Route</h3>
          <p className="text-sm text-muted-foreground">
            This page is protected by middleware. Only authenticated admin users can access it.
          </p>
        </div>
      </div>
    </div>
  );
}
