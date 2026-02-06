'use client';

import { useEffect, useState } from 'react';
import { User } from '@/lib/db/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { validators, ValidationError } from '@/lib/form-validation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Copy } from 'lucide-react';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteModal';
import { DataTable } from '@/components/admin/DataTable';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ValidationError>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin' as 'user' | 'admin',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

    const handleEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({
        email: user.email ?? '',
        password: '',
        role: (user.role ?? 'admin') as 'user' | 'admin',
    });
    setIsOpen(true);
    };

  const validateForm = (): boolean => {
    const newErrors: ValidationError = {};

    const emailError = validators.email(formData.email);
    if (emailError) newErrors.email = emailError;

    if (!editingId) {
      const passwordError = validators.password(formData.password, 8);
      if (passwordError) newErrors.password = passwordError;
    } else if (formData.password) {
      const passwordError = validators.password(formData.password, 8);
      if (passwordError) newErrors.password = passwordError;
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCloseDialog = () => {
    setFormData({
      email: '',
      password: '',
      role: 'admin',
    });
    setEditingId(null);
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const url = editingId ? `/api/admin/users/${editingId}` : '/api/admin/users';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();

      if (!res.ok) {
        // If it's a duplicate email error, show it under the email field
        if (res.status === 400 && resData.error?.includes('email')) {
          setFieldErrors(prev => ({ ...prev, email: resData.error }));
          return;
        }

        throw new Error(resData.error || 'Failed to save user');
      }

      await fetchUsers();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving user:', error);
      alert(error.message || 'Failed to save user');
    } finally {
      setIsSaving(false);
    }
  };


  const handleDeleteClick = (id: string, email: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(email);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteTargetId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchUsers();
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <ConfirmDeleteDialog
        isOpen={deleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeleteTargetId(null);
        }}
        isLoading={isSaving}
        itemName={deleteTargetName}
      />

      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit User' : 'Create New User'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (fieldErrors.email) {
                        setFieldErrors(prev => {
                          const updated = { ...prev };
                          delete updated.email;
                          return updated;
                        });
                      }
                    }}
                    type="email"
                    placeholder="user@example.com"
                  />
                  {fieldErrors.email && (
                    <p className="text-sm text-destructive mt-1 p-2 border rounded border-red-900 bg-red-200 text-center">{fieldErrors.email}</p>
                  )}
                </div>

                {!editingId && (
                  <div>
                    <label className="text-sm font-medium text-foreground">Password</label>
                    <Input
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (fieldErrors.password) {
                          setFieldErrors(prev => {
                            const updated = { ...prev };
                            delete updated.password;
                            return updated;
                          });
                        }
                      }}
                      type="password"
                      placeholder="Enter password"
                    />
                    {fieldErrors.password && (
                      <p className="text-sm text-destructive mt-1 border roundedborder-red-900 bg-red-200 text-center">{fieldErrors.password}</p>
                    )}
                  </div>
                )}

                {editingId && formData.password && (
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      New Password <span className="text-muted-foreground text-xs">(optional)</span>
                    </label>
                    <Input
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (fieldErrors.password) {
                          setFieldErrors(prev => {
                            const updated = { ...prev };
                            delete updated.password;
                            return updated;
                          });
                        }
                      }}
                      type="password"
                      placeholder="Leave empty to keep current password"
                      className={fieldErrors.password ? 'border-destructive' : ''}
                    />
                    {fieldErrors.password && (
                      <p className="text-sm text-destructive mt-1 border roundedborder-red-900 bg-red-200 text-center">{fieldErrors.password}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-foreground">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as 'user' | 'admin',
                      })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCloseDialog}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <DataTable<User>
          columns={[
            {
              key: 'email',
              label: 'Email',
              width: 'fit',
            },
            {
              key: 'role',
              label: 'Role',
              width: 'fit',
              render: (value) => (
                <Badge variant={value === 'admin' ? 'default' : 'secondary'}>
                  {value}
                </Badge>
              ),
            },
            {
              key: 'created_at',
              label: 'Created',
              render: (value) =>
                new Date(value).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }),
            },
          ]}
          data={users}
          isLoading={loading}
          renderActions={(user) => (
            <div className="flex gap-2">
              <Button
                onClick={() => handleEdit(user)}
                variant="outline"
                size="sm"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => handleDeleteClick(user.id, user.email || '')}
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        />
      </div>
    </>
  );
}
