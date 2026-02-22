'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { deleteRecipe } from '@/lib/actions';
import { IngredientList } from '@/components/ingredient-list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Trash2, Plus, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import type { Recipe } from '@/types/recipe';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface RecipeDetailProps {
  recipe: Recipe;
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const router = useRouter();
  const [name, setName] = useState(recipe.name);
  const [ingredients, setIngredients] = useState<string[]>(recipe.ingredients);
  const [newIngredient, setNewIngredient] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounced save function
  const saveChanges = useCallback(async () => {
    if (!name.trim()) {
      return;
    }

    setIsSaving(true);
    setShowSaved(false);
    try {
      const formData = new FormData();
      formData.append('id', recipe._id);
      formData.append('name', name);
      formData.append('ingredients', JSON.stringify(ingredients));

      await fetch('/api/recipes/update', {
        method: 'POST',
        body: formData,
      });

      setIsSaving(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
      router.refresh();
    } catch {
      setIsSaving(false);
    }
  }, [recipe._id, name, ingredients, router]);

  // Auto-save when name or ingredients change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (name !== recipe.name || JSON.stringify(ingredients) !== JSON.stringify(recipe.ingredients)) {
        saveChanges();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [name, ingredients, recipe.name, recipe.ingredients, saveChanges]);

  const handleAddIngredient = () => {
    const trimmed = newIngredient.trim();
    if (trimmed) {
      setIngredients([...ingredients, trimmed]);
      setNewIngredient('');
    }
  };

  const handleReorder = (newOrder: string[]) => {
    setIngredients(newOrder);
  };

  const handleDeleteIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleUpdateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteRecipe(recipe._id);
      router.push('/recipes');
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/recipes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Recipes
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isSaving && (
              <span className="flex items-center gap-1">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            )}
            {showSaved && (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <Check className="h-4 w-4" />
                Saved
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="recipe-name">Recipe Name</Label>
            <Input
              id="recipe-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Recipe name"
              className="text-xl font-medium"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Ingredients</h2>
              <span className="text-sm text-muted-foreground">
                {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
              </span>
            </div>

            <IngredientList
              ingredients={ingredients}
              onReorder={handleReorder}
              onDelete={handleDeleteIngredient}
              onUpdate={handleUpdateIngredient}
            />

            <div className="flex gap-2">
              <Input
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
                placeholder="Add an ingredient..."
              />
              <Button
                type="button"
                onClick={handleAddIngredient}
                disabled={!newIngredient.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Recipe
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Recipe</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete &quot;{recipe.name}&quot;? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
    </div>
  );
}
