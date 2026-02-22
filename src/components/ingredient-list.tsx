'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, X, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface IngredientListProps {
  ingredients: string[];
  onReorder: (newOrder: string[]) => void;
  onDelete: (index: number) => void;
  onUpdate?: (index: number, value: string) => void;
  disabled?: boolean;
}

export function IngredientList({ ingredients, onReorder, onDelete, onUpdate, disabled }: IngredientListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [copied, setCopied] = useState(false);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(ingredients);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorder(items);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(ingredients[index]);
  };

  const saveEdit = () => {
    if (editingIndex !== null && onUpdate) {
      const trimmed = editValue.trim();
      if (trimmed) {
        onUpdate(editingIndex, trimmed);
      }
    }
    setEditingIndex(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const copyToClipboard = async () => {
    const text = ingredients.join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (ingredients.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">No ingredients yet. Add one below.</p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="text-xs"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copy List
            </>
          )}
        </Button>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="ingredients">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <Draggable
                  key={`${ingredient}-${index}`}
                  draggableId={`ingredient-${index}`}
                  index={index}
                  isDragDisabled={disabled || editingIndex === index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`
                        flex items-center gap-2 p-3 rounded-lg border bg-card
                        ${snapshot.isDragging ? 'shadow-lg' : ''}
                        ${disabled ? 'opacity-50' : ''}
                      `}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className={disabled || editingIndex === index ? 'cursor-not-allowed' : 'cursor-grab'}
                      >
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </div>
                      {editingIndex === index ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={saveEdit}
                          autoFocus
                          className="flex-1 h-8"
                        />
                      ) : (
                        <span
                          className="flex-1 cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
                          onClick={() => !disabled && startEdit(index)}
                        >
                          {ingredient}
                        </span>
                      )}
                      {editingIndex !== index && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(index)}
                          disabled={disabled}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
