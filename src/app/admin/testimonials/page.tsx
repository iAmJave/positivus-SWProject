'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Testimonial } from '@/types/types';
import { Button } from '@/components/ui/button';
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
import { Plus, Edit2, Trash2, ArrowUpDown, Star } from 'lucide-react';
import { DragSortView } from '@/components/admin/DragSortView';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteModal';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { DataTable } from '@/components/admin/DataTable';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
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
    role_company: '',
    message: '',
    avatar_url: '',
    rating: 5,
    sort_order: 0,
    is_active: true,
  });

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/testimonials');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: ValidationError = {};

    const nameError = validators.requiredString(formData.name, 'Name');
    if (nameError) newErrors.name = nameError;

    const companyError = validators.requiredString(formData.role_company, 'Role/Company');
    if (companyError) newErrors.role_company = companyError;

    const messageError = validators.requiredString(formData.message, 'Message');
    if (messageError) {
      newErrors.message = messageError;
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `/api/admin/testimonials/${editingId}`
        : '/api/admin/testimonials';

      let sortOrder = formData.sort_order;
      if (!editingId) {
        const maxSortOrder = testimonials.length > 0 
          ? Math.max(...testimonials.map(t => t.sort_order))
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
        role_company: '',
        message: '',
        avatar_url: '',
        rating: 5,
        sort_order: 0,
        is_active: true,
      });
      setEditingId(null);
      setIsOpen(false);
      setFieldErrors({});
      await fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      setFieldErrors({ _form: 'Failed to save testimonial. Please try again.' });
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      name: testimonial.name,
      role_company: testimonial.role_company,
      message: testimonial.message,
      avatar_url: testimonial.avatar_url || '',
      rating: testimonial.rating || 5,
      sort_order: testimonial.sort_order,
      is_active: testimonial.is_active,
    });
    setEditingId(testimonial.id);
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
      const res = await fetch(`/api/admin/testimonials/${deleteTargetId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchTestimonials();
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    } catch (error) {
      console.error('Error deleting testimonial:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseDialog = () => {
    setFormData({
      name: '',
      role_company: '',
      message: '',
      avatar_url: '',
      rating: 5,
      sort_order: 0,
      is_active: true,
    });
    setEditingId(null);
    setIsOpen(false);
  };

  const handleSaveOrder = async (sortedItems: Testimonial[]) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'testimonials',
          items: sortedItems,
        }),
      });

      if (!res.ok) throw new Error('Failed to save order');
      await fetchTestimonials();
      setIsSortOpen(false);
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderStars = (value: number) => (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < value ? 'fill-primary text-seconday' : 'text-muted-foreground'
          }`}
        />
      ))}
    </div>
  );

  const renderTestimonialContent = (testimonial: Testimonial) => {
    const rating = testimonial.rating ?? 5;

    return (
      <div className="flex items-center gap-3">
        {testimonial.avatar_url && (
          <Image
            src={testimonial.avatar_url || "/placeholder.svg"}
            alt={testimonial.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
          <p className="text-sm text-muted-foreground">{testimonial.role_company}</p>
          <div className="flex gap-1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < rating ? 'fill-accent text-accent' : 'text-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isSortOpen) {
    return (
      <DragSortView
        items={testimonials}
        onSave={handleSaveOrder}
        onCancel={() => setIsSortOpen(false)}
        isSaving={isSaving}
        renderItemContent={renderTestimonialContent}
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
        <h1 className="text-3xl font-bold text-foreground">Testimonials</h1>
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
              <Button className="gap-2 hover:bg-primary hover:text-black border-[1px] border-black">
                <Plus className="w-4 h-4" />
                New Testimonial
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Edit Testimonial' : 'Add Testimonial'}
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
                    placeholder="Testimonial author name"
                    className={fieldErrors.name ? 'border-destructive' : ''}
                  />
                  {fieldErrors.name && (
                    <p className="text-sm text-destructive mt-1">{fieldErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Role / Company <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={formData.role_company}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        role_company: e.target.value,
                      });
                      if (fieldErrors.role_company) {
                        setFieldErrors(prev => {
                          const updated = { ...prev };
                          delete updated.role_company;
                          return updated;
                        });
                      }
                    }}
                    placeholder="Role or company"
                    className={fieldErrors.role_company ? 'border-destructive' : ''}
                  />
                  {fieldErrors.role_company && (
                    <p className="text-sm text-destructive mt-1">{fieldErrors.role_company}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Message <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (fieldErrors.message) {
                        setFieldErrors(prev => {
                          const updated = { ...prev };
                          delete updated.message;
                          return updated;
                        });
                      }
                    }}
                    placeholder="Testimonial message (min 10 characters)"
                    className={fieldErrors.message ? 'border-destructive' : ''}
                  />
                  {fieldErrors.message && (
                    <p className="text-sm text-destructive mt-1">{fieldErrors.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.message.length}/1000 characters
                  </p>
                </div>
                <div>
                  <ImageUpload
                    currentImageUrl={formData.avatar_url}
                    onImageUrlChange={(url) =>
                      setFormData({ ...formData, avatar_url: url })
                    }
                    folder="testimonials"
                    label="Avatar"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Rating <span className="text-muted-foreground text-xs">(optional)</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rating: Math.min(5, Math.max(1, parseInt(e.target.value))),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">1-5 stars</p>
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

      <DataTable<Testimonial>
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
            width: 'full',
          },
          {
            key: 'role_company',
            label: 'Role / Company',
            width: 'full',
          },
          {
            key: 'rating',
            label: 'Rating',
            width: '100px',
            render: (value) => renderStars(value || 5),
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
        data={testimonials}
        isLoading={loading}
        renderActions={(testimonial) => (
          <div className="flex gap-2">
            <Button
              onClick={() => handleEdit(testimonial)}
              variant="outline"
              size="sm"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleDeleteClick(testimonial.id, testimonial.name)}
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
