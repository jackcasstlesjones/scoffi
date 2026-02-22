'use client';

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IngredientListProps {
  ingredients: string[];
  onReorder: (newOrder: string[]) => void;
  onDelete: (index: number) => void;
  disabled?: boolean;
}

export function IngredientList({ ingredients, onReorder, onDelete, disabled }: IngredientListProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(ingredients);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorder(items);
  };

  if (ingredients.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">No ingredients yet. Add one below.</p>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="ingredients">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
            {ingredients.map((ingredient, index) => (
              <Draggable
                key={`${ingredient}-${index}`}
                draggableId={`ingredient-${index}`}
                index={index}
                isDragDisabled={disabled}
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
                      className={disabled ? 'cursor-not-allowed' : 'cursor-grab'}
                    >
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="flex-1">{ingredient}</span>
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
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
