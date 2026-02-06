'use client';

import React from "react"

import { useState } from 'react';
import { GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface DragSortItem {
  id: string;
  title?: string;
  name?: string;
  step_no?: number;
  role_company?: string;
  sort_order: number;
}

interface DragSortModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: DragSortItem[];
  onSave: (items: DragSortItem[]) => Promise<void>;
  isSaving?: boolean;
}

export function DragSortModal({
  isOpen,
  onClose,
  items,
  onSave,
  isSaving = false,
}: DragSortModalProps) {
  const [sortedItems, setSortedItems] = useState<DragSortItem[]>(
    [...items].sort((a, b) => a.sort_order - b.sort_order)
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = sortedItems.findIndex((item) => item.id === draggedId);
    const targetIndex = sortedItems.findIndex((item) => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newItems = [...sortedItems];
    [newItems[draggedIndex], newItems[targetIndex]] = [
      newItems[targetIndex],
      newItems[draggedIndex],
    ];

    // Update sort_order based on new positions
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      sort_order: index + 1,
    }));

    setSortedItems(updatedItems);
    setDraggedId(null);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sortedItems.length) return;

    const newItems = [...sortedItems];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      sort_order: idx + 1,
    }));

    setSortedItems(updatedItems);
  };

  const handleSave = async () => {
    await onSave(sortedItems);
    onClose();
  };

  const getItemLabel = (item: DragSortItem): string => {
    if (item.title) return item.title;
    if (item.name) return item.name;
    return `Item ${item.sort_order}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reorder Items by Dragging</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {sortedItems.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(item.id)}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                draggedId === item.id
                  ? 'border-accent bg-accent/10 opacity-50'
                  : 'border-border hover:border-accent cursor-move'
              }`}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{getItemLabel(item)}</p>
                <p className="text-xs text-muted-foreground">
                  Position: {index + 1} of {sortedItems.length}
                </p>
              </div>

              <div className="flex gap-1 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === sortedItems.length - 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
