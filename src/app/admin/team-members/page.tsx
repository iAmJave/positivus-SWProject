'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { TeamMember } from '@/types/types';
import { Button } from '@/components/ui/button';
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
import { Plus, Edit2, Trash2, ArrowUpDown, Linkedin, Github, Facebook, X } from 'lucide-react';
import { DragSortView } from '@/components/admin/DragSortView';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteModal';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { DataTable } from '@/components/admin/DataTable';

export default function TeamMembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ValidationError>({});
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    avatar_url: '',
    socials_json: {} as Record<string, string>,
    sort_order: 0,
    is_active: true,
  });

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/team-members');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: ValidationError = {};

    const nameError = validators.requiredString(formData.name, 'Name');
    if (nameError) newErrors.name = nameError;

    const roleError = validators.requiredString(formData.role, 'Role');
    if (roleError) newErrors.role = roleError;

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `/api/admin/team-members/${editingId}`
        : '/api/admin/team-members';

      let sortOrder = formData.sort_order;
      if (!editingId) {
        const maxSortOrder = members.length > 0 
          ? Math.max(...members.map(m => m.sort_order))
          : -1;
        sortOrder = maxSortOrder + 1;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, sort_order: sortOrder }),
      });

      if (!res.ok) throw new Error('Failed to save');

      setFormData({
        name: '',
        role: '',
        avatar_url: '',
        socials_json: {},
        sort_order: 0,
        is_active: true,
      });
      setEditingId(null);
      setIsOpen(false);
      setFieldErrors({});
      await fetchMembers();
    } catch (error) {
      console.error('Error saving team member:', error);
      setFieldErrors({ _form: 'Failed to save team member. Please try again.' });
    }
  };

  const handleEdit = (member: TeamMember) => {
    setFormData({
      name: member.name,
      role: member.role,
      avatar_url: member.avatar_url || '',
      socials_json: member.socials_json || {},
      sort_order: member.sort_order,
      is_active: member.is_active,
    });
    setEditingId(member.id);
    setIsOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/team-members/${deleteTargetId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchMembers();
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    } catch (error) {
      console.error('Error deleting team member:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseDialog = () => {
    setFormData({
      name: '',
      role: '',
      avatar_url: '',
      socials_json: {},
      sort_order: 0,
      is_active: true,
    });
    setEditingId(null);
    setIsOpen(false);
  };

  const handleSaveOrder = async (sortedItems: TeamMember[]) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'team_members',
          items: sortedItems,
        }),
      });

      if (!res.ok) throw new Error('Failed to save order');
      await fetchMembers();
      setIsSortOpen(false);
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderMemberContent = (member: TeamMember) => (
    <div className="flex items-center gap-3">
      {member.avatar_url && (
        <Image
          src={member.avatar_url || "/placeholder.svg"}
          alt={member.name}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
        />
      )}
      <div>
        <h3 className="font-semibold text-foreground">{member.name}</h3>
        <p className="text-sm text-muted-foreground">{member.role}</p>
      </div>
    </div>
  );

  if (isSortOpen) {
    return (
      <DragSortView
        items={members}
        onSave={handleSaveOrder}
        onCancel={() => setIsSortOpen(false)}
        isSaving={isSaving}
        renderItemContent={renderMemberContent}
      />
    );
  }

  return (
    <div>
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">Team Members</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsSortOpen(true)}
            className="gap-2"
          >
            <ArrowUpDown className="w-4 h-4" />
            Edit Sorting
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-secondary hover:bg-primary hover:text-black border-[1px] border-black">
                <Plus className="w-4 h-4" />
                New Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Edit Team Member' : 'Add Team Member'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {fieldErrors._form && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                    <p className="text-sm text-destructive">{fieldErrors._form}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (fieldErrors.name) {
                        setFieldErrors(prev => {
                          const updated = { ...prev };
                          delete updated.name;
                          return updated;
                        });
                      }
                    }}
                    placeholder="Member name"
                    className={fieldErrors.name ? 'border-destructive' : ''}
                  />
                  {fieldErrors.name && (
                    <p className="text-sm text-destructive mt-1">{fieldErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Role <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={formData.role}
                    onChange={(e) => {
                      setFormData({ ...formData, role: e.target.value });
                      if (fieldErrors.role) {
                        setFieldErrors(prev => {
                          const updated = { ...prev };
                          delete updated.role;
                          return updated;
                        });
                      }
                    }}
                    placeholder="Member role"
                    className={fieldErrors.role ? 'border-destructive' : ''}
                  />
                  {fieldErrors.role && (
                    <p className="text-sm text-destructive mt-1">{fieldErrors.role}</p>
                  )}
                </div>
                <div>
                  <ImageUpload
                    currentImageUrl={formData.avatar_url}
                    onImageUrlChange={(url) =>
                      setFormData({ ...formData, avatar_url: url })
                    }
                    folder="team-members"
                    label="Member Avatar"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    Social Links <span className="text-muted-foreground text-xs">(optional)</span>
                  </label>
                  <div className="space-y-3">
                    {['linkedin', 'github', 'facebook', 'twitter'].map((social) => {
                      const isChecked = social in formData.socials_json;

                      return (
                        <div key={social} className="flex flex-col gap-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const updated = { ...formData.socials_json };
                                if (e.target.checked) {
                                  // Add key if checked, default to empty string
                                  updated[social] = updated[social] || '';
                                } else {
                                  delete updated[social];
                                }
                                setFormData({ ...formData, socials_json: updated });
                              }}
                              className="rounded"
                            />
                            <span className="text-sm font-medium capitalize">{social}</span>
                          </label>
                          {isChecked && (
                            <Input
                              type="url"
                              placeholder={`Enter ${social} URL`}
                              value={formData.socials_json[social] || ''}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  socials_json: { ...prev.socials_json, [social]: e.target.value },
                                }));
                              }}
                              className="ml-6"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="rounded"
                  />
                  <label className="text-sm font-medium text-foreground">
                    Active
                  </label>
                </div>
                <div className="flex gap-2">
                  
                  <Button
                    onClick={handleCloseDialog}
                    variant="outline"
                    className="flex-1 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} className="flex-1 bg-secondary hover:bg-primary hover:text-black border-[1px] border-black">
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataTable<TeamMember>
        columns={[
          {
            key: 'sort_order',
            label: '#',
            width: '50px',
          },
          {
            key: 'avatar_url',
            label: 'Avatar',
            width: '60px',
            render: (value) =>
              value ? (
                <Image
                  src={value || "/placeholder.svg"}
                  alt="avatar"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted" />
              ),
          },
          {
            key: 'name',
            label: 'Name',
            width: 'fit',
          },
          {
            key: 'role',
            label: 'Role',
            width: 'fit',
          },
          {
            key: 'socials_json',
            label: 'Socials',
            width: '120px',
            render: (socials) => (
              <div className="flex gap-2">
                {socials?.linkedin && <Linkedin className="w-5 h-5 text-blue-600" />}
                {socials?.github && <Github className="w-5 h-5 text-gray-700" />}
                {socials?.facebook && <Facebook className="w-5 h-5 text-blue-800" />}
                {socials?.twitter && (
                  <svg
                    className="w-5 h-5 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                  </svg>
                )}
              </div>
            ),
          },
          {
            key: 'is_active',
            label: 'Status',
            width: '100px',
            render: (value) => (
              <Badge variant={value ? 'default' : 'secondary'}>
                {value ? 'Active' : 'Inactive'}
              </Badge>
            ),
          },
        ]}
        data={members}
        isLoading={loading}
        renderActions={(member) => (
          <div className="flex gap-2">
            <Button
              onClick={() => handleEdit(member)}
              variant="outline"
              size="sm"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleDeleteClick(member.id, member.name)}
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
  );
}
