'use client';

import { useEffect, useState } from 'react';
import { ContactSubmission } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, Eye, Mail } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] =
    useState<ContactSubmission | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const url =
        statusFilter === 'all'
          ? '/api/admin/contact-submissions'
          : `/api/admin/contact-submissions?status=${statusFilter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  const handleStatusChange = async (
    id: string,
    newStatus: 'new' | 'read' | 'archived'
  ) => {
    try {
      const res = await fetch(`/api/admin/contact-submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update');
      await fetchSubmissions();
      if (selectedSubmission?.id === id) {
        setSelectedSubmission({
          ...selectedSubmission,
          status: newStatus,
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/admin/contact-submissions/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchSubmissions();
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default">New</Badge>;
      case 'read':
        return <Badge variant="secondary">Read</Badge>;
      case 'archived':
        return <Badge>Archived</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          Contact Submissions
        </h1>
      </div>

      <div className="mb-4 flex gap-2">
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('all')}
        >
          All
        </Button>
        <Button
          variant={statusFilter === 'new' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('new')}
        >
          New
        </Button>
        <Button
          variant={statusFilter === 'read' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('read')}
        >
          Read
        </Button>
        <Button
          variant={statusFilter === 'archived' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('archived')}
        >
          Archived
        </Button>
      </div>

      <DataTable<ContactSubmission>
        columns={[
          {
            key: 'name',
            label: 'Name',
            width: 'fit',
          },
          {
            key: 'email',
            label: 'Email',
            width: 'fit',
            render: (value) => (
              <a
                href={`mailto:${value}`}
                className="text-secondary hover:underline flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {value}
              </a>
            ),
          },
          {
            key: 'message',
            label: 'Message',
            width: '20px',
            render: (value) => (
              <span className="truncate max-w-sm text-muted-foreground">
                {value}
              </span>
            ),
          },
          {
            key: 'created_at',
            label: 'Date',
            width: '180px',
            render: (value) => (
              <span className="text-sm text-muted-foreground">
                {formatDate(value)}
              </span>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            width: '100px',
            render: (value) => getStatusBadge(value),
          },
        ]}
        data={submissions}
        isLoading={loading}
        renderActions={(submission) => (
          <div className="flex gap-2">
            <Button
              onClick={() => setSelectedSubmission(submission)}
              variant="outline"
              size="sm"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleDelete(submission.id)}
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      />

      {selectedSubmission && (
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submission Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="text-foreground">{selectedSubmission.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <a
                    href={`mailto:${selectedSubmission.email}`}
                    className="text-accent hover:underline"
                  >
                    {selectedSubmission.email}
                  </a>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Date
                </label>
                <p className="text-foreground">
                  {formatDate(selectedSubmission.created_at)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Message
                </label>
                <p className="text-foreground whitespace-pre-wrap">
                  {selectedSubmission.message}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Status
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={
                      selectedSubmission.status === 'new' ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      handleStatusChange(selectedSubmission.id, 'new')
                    }
                  >
                    Mark as New
                  </Button>
                  <Button
                    variant={
                      selectedSubmission.status === 'read' ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      handleStatusChange(selectedSubmission.id, 'read')
                    }
                  >
                    Mark as Read
                  </Button>
                  <Button
                    variant={
                      selectedSubmission.status === 'archived'
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      handleStatusChange(selectedSubmission.id, 'archived')
                    }
                  >
                    Archive
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
