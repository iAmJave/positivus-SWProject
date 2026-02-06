'use client';

import { useEffect, useState } from 'react';
import { Service } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { validators, ValidationError } from '@/lib/form-validation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, ArrowUpDown } from 'lucide-react';
import { DragSortView } from '@/components/admin/DragSortView';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteModal';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { DataTable } from '@/components/admin/DataTable';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
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
    title: '',
    description: '',
    icon_url: '',
    sort_order: 0,
    is_active: true,
  });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/services');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: ValidationError = {};

    const titleError = validators.requiredString(formData.title, 'Title');
    if (titleError) newErrors.title = titleError;

    const descError = validators.requiredString(formData.description, 'Description');
    if (descError) newErrors.description = descError;

    const minLengthError = validators.minLength(formData.description, 10, 'Description');
    if (minLengthError) newErrors.description = minLengthError;

    if (formData.sort_order < 0) {
      newErrors.sort_order = 'Sort order must be a positive number';
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `/api/admin/services/${editingId}`
        : '/api/admin/services';

      let sortOrder = formData.sort_order;
      if (!editingId) {
        const maxSortOrder = services.length > 0 
          ? Math.max(...services.map(c => c.sort_order))
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
        title: '',
        description: '',
        icon_url: '',
        sort_order: 0,
        is_active: true,
      });
      setEditingId(null);
      setIsOpen(false);
      setFieldErrors({});
      await fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      setFieldErrors({ _form: 'Failed to save service. Please try again.' });
    }
  };

  const handleEdit = (service: Service) => {
    setFormData({
      title: service.title,
      description: service.description,
      icon_url: service.icon_url || '',
      sort_order: service.sort_order,
      is_active: service.is_active,
    });
    setEditingId(service.id);
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
      const res = await fetch(`/api/admin/services/${deleteTargetId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchServices();
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    } catch (error) {
      console.error('Error deleting service:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseDialog = () => {
    setFormData({
      title: '',
      description: '',
      icon_url: '',
      sort_order: 0,
      is_active: true,
    });
    setEditingId(null);
    setIsOpen(false);
  };

  const handleSaveOrder = async (sortedItems: Service[]) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'services',
          items: sortedItems,
        }),
      });

      if (!res.ok) throw new Error('Failed to save order');
      await fetchServices();
      setIsSortOpen(false);
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Render item content for drag sort view
  const renderServiceContent = (service: Service) => (
    <div>
      <h3 className="font-semibold text-foreground">{service.title}</h3>
      <p className="text-sm text-muted-foreground truncate">
        {service.description}
      </p>
    </div>
  );

  // Show sort view if sorting is active
  if (isSortOpen) {
    return (
      <DragSortView
        items={services}
        onSave={handleSaveOrder}
        onCancel={() => setIsSortOpen(false)}
        isSaving={isSaving}
        renderItemContent={renderServiceContent}
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
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Services</h1>
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
                  New Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Edit Service' : 'Add Service'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {fieldErrors._form && (
                    <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                      <p className="text-sm text-destructive">{fieldErrors._form}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Title <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        if (fieldErrors.title) {
                          setFieldErrors(prev => {
                            const updated = { ...prev };
                            delete updated.title;
                            return updated;
                          });
                        }
                      }}
                      placeholder="Service title"
                      className={fieldErrors.title ? 'border-destructive' : ''}
                    />
                    {fieldErrors.title && (
                      <p className="text-sm text-destructive mt-1 p-2 border rounded border-red-900 bg-red-200 text-center">{fieldErrors.title}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Description <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value });
                        if (fieldErrors.description) {
                          setFieldErrors(prev => {
                            const updated = { ...prev };
                            delete updated.description;
                            return updated;
                          });
                        }
                      }}
                      placeholder="Service description (min 10 characters)"
                      className={fieldErrors.description ? 'border-destructive' : ''}
                    />
                    {fieldErrors.description && (
                      <p className="text-sm text-destructive mt-1 p-2 border rounded border-red-900 bg-red-200 text-center">{fieldErrors.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.description.length}/500 characters
                    </p>
                  </div>
                  <div>
                    <ImageUpload
                      currentImageUrl={formData.icon_url}
                      onImageUrlChange={(url) =>
                        setFormData({ ...formData, icon_url: url })
                      }
                      folder="services"
                      label="Service Icon"
                    />
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
                    <Button
                      onClick={handleSubmit}
                       className="flex-1 bg-secondary hover:bg-primary hover:text-black border-[1px] border-black"
                    >
                      {editingId ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <DataTable<Service>
          columns={[
            {
              key: 'sort_order',
              label: '#',
              width: '50px',
            },
            {
              key: 'title',
              label: 'Title',
              width: '200px',
            },
            {
              key: 'description',
              label: 'Description',
              render: (value) => (
                <span className="truncate max-w-xs text-muted-foreground">
                  {value}
                </span>
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
          data={services}
          isLoading={loading}
          renderActions={(service) => (
            <div className="flex gap-2">
              <Button
                onClick={() => handleEdit(service)}
                variant="outline"
                size="sm"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => handleDeleteClick(service.id, service.title)}
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
    </div>
  );
}
