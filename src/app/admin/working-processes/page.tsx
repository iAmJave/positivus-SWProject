'use client';

import { useEffect, useState } from 'react';
import { WorkingProcess } from '@/types/types';
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
import { DataTable } from '@/components/admin/DataTable';

export default function WorkingProcessesPage() {
  const [processes, setProcesses] = useState<WorkingProcess[]>([]);
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
    step_no: 0,
    title: '',
    description: '',
    sort_order: 0,
    is_active: true,
  });

  const fetchProcesses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/working-processes');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProcesses(data || []);
    } catch (error) {
      console.error('Error fetching processes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: ValidationError = {};

    if (!formData.step_no || formData.step_no <= 0) {
      newErrors.step_no = 'Step number must be greater than 0';
    }

    const titleError = validators.requiredString(formData.title, 'Title');
    if (titleError) newErrors.title = titleError;

    const descError = validators.requiredString(formData.description, 'Description');
    if (descError) newErrors.description = descError;

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `/api/admin/working-processes/${editingId}`
        : '/api/admin/working-processes';

      let sortOrder = formData.sort_order;
      if (!editingId) {
        const maxSortOrder = processes.length > 0 
          ? Math.max(...processes.map(p => p.sort_order))
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
        step_no: 0,
        title: '',
        description: '',
        sort_order: 0,
        is_active: true,
      });
      setEditingId(null);
      setIsOpen(false);
      setFieldErrors({});
      await fetchProcesses();
    } catch (error) {
      console.error('Error saving process:', error);
      setFieldErrors({ _form: 'Failed to save process. Please try again.' });
    }
  };

  const handleEdit = (process: WorkingProcess) => {
    setFormData({
      step_no: process.step_no,
      title: process.title,
      description: process.description,
      sort_order: process.sort_order,
      is_active: process.is_active,
    });
    setEditingId(process.id);
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
      const res = await fetch(`/api/admin/working-processes/${deleteTargetId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchProcesses();
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    } catch (error) {
      console.error('Error deleting process:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseDialog = () => {
    setFormData({
      step_no: 0,
      title: '',
      description: '',
      sort_order: 0,
      is_active: true,
    });
    setEditingId(null);
    setIsOpen(false);
  };

  const handleSaveOrder = async (sortedItems: WorkingProcess[]) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'working_processes',
          items: sortedItems,
        }),
      });

      if (!res.ok) throw new Error('Failed to save order');
      await fetchProcesses();
      setIsSortOpen(false);
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderProcessContent = (process: WorkingProcess) => (
    <div>
      <h3 className="font-semibold text-foreground">Step {process.step_no}: {process.title}</h3>
      <p className="text-sm text-muted-foreground truncate">
        {process.description}
      </p>
    </div>
  );

  if (isSortOpen) {
    return (
      <DragSortView
        items={processes}
        onSave={handleSaveOrder}
        onCancel={() => setIsSortOpen(false)}
        isSaving={isSaving}
        renderItemContent={renderProcessContent}
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
        <h1 className="text-3xl font-bold text-foreground">Working Processes</h1>
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
                New Process
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Edit Process' : 'Add Process'}
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
                    Step Number <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.step_no}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        step_no: parseInt(e.target.value) || 0,
                      });
                      if (fieldErrors.step_no) {
                        setFieldErrors(prev => {
                          const updated = { ...prev };
                          delete updated.step_no;
                          return updated;
                        });
                      }
                    }}
                    placeholder="Step number"
                    className={fieldErrors.step_no ? 'border-destructive' : ''}
                  />
                  {fieldErrors.step_no && (
                    <p className="text-sm text-destructive mt-1">{fieldErrors.step_no}</p>
                  )}
                </div>
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
                    placeholder="Process title"
                    className={fieldErrors.title ? 'border-destructive' : ''}
                  />
                  {fieldErrors.title && (
                    <p className="text-sm text-destructive mt-1">{fieldErrors.title}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Description <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      });
                      if (fieldErrors.description) {
                        setFieldErrors(prev => {
                          const updated = { ...prev };
                          delete updated.description;
                          return updated;
                        });
                      }
                    }}
                    placeholder="Process description"
                    className={fieldErrors.description ? 'border-destructive' : ''}
                  />
                  {fieldErrors.description && (
                    <p className="text-sm text-destructive mt-1">{fieldErrors.description}</p>
                  )}
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

      <DataTable<WorkingProcess>
        columns={[
          {
            key: 'sort_order',
            label: '#',
            width: '50px',
          },
          {
            key: 'step_no',
            label: 'Step',
            width: '60px',
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
        data={processes}
        isLoading={loading}
        renderActions={(process) => (
          <div className="flex gap-2">
            <Button
              onClick={() => handleEdit(process)}
              variant="outline"
              size="sm"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleDeleteClick(process.id, process.title)}
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
