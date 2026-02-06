'use client';

import { useEffect, useState } from 'react';
import { CaseStudy } from '@/types/types';
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
import { Plus, Edit2, Trash2, ArrowUpDown } from 'lucide-react';
import { DragSortView } from '@/components/admin/DragSortView';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteModal';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { DataTable } from '@/components/admin/DataTable';

export default function CaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
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
    short_description: '',
    cover_image_url: '',
    link_url: '',
    sort_order: 0,
    is_active: true,
  });

  const fetchCaseStudies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/case-studies');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCaseStudies(data || []);
    } catch (error) {
      console.error('Error fetching case studies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: ValidationError = {};

    const titleError = validators.requiredString(formData.title, 'Title');
    if (titleError) newErrors.title = titleError;

    const descError = validators.requiredString(formData.short_description, 'Description');
    if (descError) newErrors.short_description = descError;

    const minLengthError = validators.minLength(formData.short_description, 10, 'Description');
    if (minLengthError) newErrors.short_description = minLengthError;

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `/api/admin/case-studies/${editingId}`
        : '/api/admin/case-studies';

      let sortOrder = formData.sort_order;
      if (!editingId) {
        const maxSortOrder = caseStudies.length > 0 
          ? Math.max(...caseStudies.map(c => c.sort_order))
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
        short_description: '',
        cover_image_url: '',
        link_url: '',
        sort_order: 0,
        is_active: true,
      });
      setEditingId(null);
      setIsOpen(false);
      setFieldErrors({});
      await fetchCaseStudies();
    } catch (error) {
      console.error('Error saving case study:', error);
      setFieldErrors({ _form: 'Failed to save case study. Please try again.' });
    }
  };

  const handleEdit = (caseStudy: CaseStudy) => {
    setFormData({
      title: caseStudy.title,
      short_description: caseStudy.short_description,
      cover_image_url: caseStudy.cover_image_url || '',
      link_url: caseStudy.link_url,
      sort_order: caseStudy.sort_order,
      is_active: caseStudy.is_active,
    });
    setEditingId(caseStudy.id);
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
      const res = await fetch(`/api/admin/case-studies/${deleteTargetId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchCaseStudies();
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    } catch (error) {
      console.error('Error deleting case study:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseDialog = () => {
    setFormData({
      title: '',
      short_description: '',
      cover_image_url: '',
      link_url: '',
      sort_order: 0,
      is_active: true,
    });
    setEditingId(null);
    setIsOpen(false);
  };

  const handleSaveOrder = async (sortedItems: CaseStudy[]) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'case_studies',
          items: sortedItems,
        }),
      });

      if (!res.ok) throw new Error('Failed to save order');
      await fetchCaseStudies();
      setIsSortOpen(false);
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderCaseStudyContent = (study: CaseStudy) => (
    <div>
      <h3 className="font-semibold text-foreground">{study.title}</h3>
      <p className="text-sm text-muted-foreground truncate">
        {study.short_description}
      </p>
    </div>
  );

  if (isSortOpen) {
    return (
      <DragSortView
        items={caseStudies}
        onSave={handleSaveOrder}
        onCancel={() => setIsSortOpen(false)}
        isSaving={isSaving}
        renderItemContent={renderCaseStudyContent}
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
        <h1 className="text-3xl font-bold text-foreground">Case Studies</h1>
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
                New Case Study
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Edit Case Study' : 'Add Case Study'}
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
                    placeholder="Case study title"
                    className={fieldErrors.title ? 'border-destructive' : ''}
                  />
                  {fieldErrors.title && (
                    <p className="text-sm text-destructive mt-1">{fieldErrors.title}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Short Description <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    value={formData.short_description}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        short_description: e.target.value,
                      });
                      if (fieldErrors.short_description) {
                        setFieldErrors(prev => {
                          const updated = { ...prev };
                          delete updated.short_description;
                          return updated;
                        });
                      }
                    }}
                    placeholder="Short description (min 10 characters)"
                    className={fieldErrors.short_description ? 'border-destructive' : ''}
                  />
                  {fieldErrors.short_description && (
                    <p className="text-sm text-destructive mt-1">{fieldErrors.short_description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.short_description.length}/500 characters
                  </p>
                </div>
                <div>
                  <ImageUpload
                    currentImageUrl={formData.cover_image_url}
                    onImageUrlChange={(url) =>
                      setFormData({ ...formData, cover_image_url: url })
                    }
                    folder="case-studies"
                    label="Cover Image"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Link URL <span className="text-muted-foreground text-xs">(optional)</span>
                  </label>
                  <Input
                    value={formData.link_url}
                    onChange={(e) =>
                      setFormData({ ...formData, link_url: e.target.value })
                    }
                    placeholder="Link URL"
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
                  <Button onClick={handleSubmit} className="flex-1 bg-secondary hover:bg-primary hover:text-black border-[1px] border-black">
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataTable<CaseStudy>
        columns={[
          {
            key: 'sort_order',
            label: '#',
            width: '50px',
          },
          {
            key: 'title',
            label: 'Title',
            width: '250px',
          },
          {
            key: 'short_description',
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
        data={caseStudies}
        isLoading={loading}
        renderActions={(caseStudy) => (
          <div className="flex gap-2">
            <Button
              onClick={() => handleEdit(caseStudy)}
              variant="outline"
              size="sm"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleDeleteClick(caseStudy.id, caseStudy.title)}
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
