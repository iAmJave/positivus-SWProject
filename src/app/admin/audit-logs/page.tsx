'use client';

import { useEffect, useState } from 'react';
import { AuditLog } from '@/lib/db/db';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';

type FilterAction = 'all' | 'create' | 'update' | 'delete' | 'reorder' | 'login';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<FilterAction>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [filterAction]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = filterAction === 'all'
        ? '/api/admin/audit-logs'
        : `/api/admin/audit-logs?action=${filterAction}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      case 'reorder':
        return 'outline';
      case 'login':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value as FilterAction)}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground appearance-none pr-10"
            >
              <option value="all">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="reorder">Reorder</option>
              <option value="login">Login</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 pointer-events-none text-muted-foreground" />
          </div>
        </div>
      </div>

      <DataTable<AuditLog>
        columns={[
          {
            key: 'created_at',
            label: 'Time',
            width: '180px',
            render: (value) => {
              const date = new Date(value);
              return (
                <div className="text-sm">
                  <div>{date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}</div>
                  <div className="text-muted-foreground">{date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}</div>
                </div>
              );
            },
          },
          {
            key: 'action',
            label: 'Action',
            width: '100px',
            render: (value) => (
              <Badge variant={getActionColor(value)}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </Badge>
            ),
          },
          {
            key: 'admin_email',
            label: 'By User',
            width: '200px',
          },
          {
            key: 'resource_type',
            label: 'Resource',
            width: '150px',
            render: (value) => (
              <span className="text-sm text-muted-foreground">
                {value.replace(/_/g, ' ')}
              </span>
            ),
          },
          {
            key: 'resource_name',
            label: 'Resource Name',
            render: (value) => (
              <span className="truncate max-w-xs">
                {value || '—'}
              </span>
            ),
          },
        ]}
        data={logs}
        isLoading={loading}
        renderActions={(log) => (
          log.changes ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
            >
              {expandedId === log.id ? 'Hide' : 'Show'} Changes
            </Button>
          ) : null
        )}
      />

      {/* Expanded details */}
      {expandedId && logs.find(l => l.id === expandedId) && (
        <Card className="mt-4 p-4">
          <h3 className="font-semibold mb-4">Changes</h3>
          <div className="space-y-2">
            {Object.entries(logs.find(l => l.id === expandedId)?.changes || {}).map(
              ([key, value]) => (
                <div key={key} className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-muted-foreground">{key}:</div>
                  <div className="font-mono text-xs bg-muted/50 p-2 rounded break-words">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </div>
                </div>
              )
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
