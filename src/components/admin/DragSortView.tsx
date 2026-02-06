'use client';

import React, { useState } from 'react';
import { GripVertical, ChevronUp, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type BaseSortable = {
  id: string;
  sort_order: number;
};


interface DragSortViewProps<T extends BaseSortable> {
  items: T[];
  onSave: (items: T[]) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
  renderItemContent: (item: T) => React.ReactNode;
}


export function DragSortView<T extends BaseSortable>({
  items,
  onSave,
  onCancel,
  isSaving = false,
  renderItemContent,
}: DragSortViewProps<T>) {
  const [sortedItems, setSortedItems] = useState<T[]>(
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
    if (draggedId === targetId) return;

    const draggedIndex = sortedItems.findIndex((item) => item.id === draggedId);
    const targetIndex = sortedItems.findIndex((item) => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newItems = [...sortedItems];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);

    // Update sort_order based on new position
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      sort_order: index + 1,
    }));

    setSortedItems(updatedItems);
    setDraggedId(null);
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const index = sortedItems.findIndex((item) => item.id === id);
    if (index === -1) return;

    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sortedItems.length - 1) return;

    const newItems = [...sortedItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [
      newItems[targetIndex],
      newItems[index],
    ];

    // Update sort_order
    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      sort_order: idx + 1,
    }));

    setSortedItems(updatedItems);
  };

  const handleSave = async () => {
    await onSave(sortedItems);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Sorting</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Drag items or use arrow buttons to reorder
          </p>
        </div>
        <Button
          onClick={onCancel}
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent"
        >
          <X className="w-4 h-4" />
          Back
        </Button>
      </div>

      <div className="space-y-2">
        {sortedItems.map((item, index) => (
          <Card
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(item.id)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(item.id)}
            className={`p-4 cursor-move transition-all ${
              draggedId === item.id ? 'opacity-50 bg-accent/10' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />

              <div className="text-sm font-semibold text-muted-foreground min-w-[30px]">
                #{index + 1}
              </div>

              <div className="flex-1">{renderItemContent(item)}</div>

              <div className="flex gap-1 flex-shrink-0">
                <Button
                  onClick={() => moveItem(item.id, 'up')}
                  disabled={index === 0}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => moveItem(item.id, 'down')}
                  disabled={index === sortedItems.length - 1}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button
          onClick={onCancel}
          variant="outline"
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Order'}
        </Button>
      </div>
    </div>
  );
}
