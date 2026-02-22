'use client';

import { createRecipe } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { useEffect } from 'react';

const initialState = { success: false, error: null, recipeId: null };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Creating...' : 'Create Recipe'}
    </Button>
  );
}

export function CreateRecipeForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(createRecipe, initialState);

  useEffect(() => {
    if (state.success && state.recipeId) {
      router.push(`/recipes/${state.recipeId}`);
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Recipe Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g., Grandma's Apple Pie"
        />
      </div>
      <SubmitButton />
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
