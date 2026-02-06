'use client';

import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
      </div>

      <Button
        onClick={() => signOut({ callbackUrl: '/login' })}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </Button>
    </header>
  );
}
