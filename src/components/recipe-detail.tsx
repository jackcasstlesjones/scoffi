'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateRecipe, deleteRecipe } from '@/lib/actions';
import { IngredientList } from '@/components/ingredient-list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Trash2, Save, Plus } from 'lucide-react';
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('id', recipe._id);
      formData.append('name', name);
      formData.append('ingredients', JSON.stringify(ingredients));

      await fetch('/api/recipes/update', {
        method: 'POST',
        body: formData,
      });

      router.refresh();
    } finally {
      setIsSaving(false);
    }
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

  const hasChanges = name !== recipe.name || JSON.stringify(ingredients) !== JSON.stringify(recipe.ingredients);

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
          {hasChanges && (
            <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
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
            />

            <div className="flex gap-2">
              <Input
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
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
