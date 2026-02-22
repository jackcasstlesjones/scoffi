import Link from 'next/link';
import { logout } from '@/lib/actions';
import { getRecipes } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, LogOut } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreateRecipeForm } from '@/components/create-recipe-form';

export default async function RecipesPage() {
  const recipes = await getRecipes();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Scoffi - Recipes</h1>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">My Recipes</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Recipe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Recipe</DialogTitle>
                <DialogDescription>
                  Add a new recipe to your collection
                </DialogDescription>
              </DialogHeader>
              <CreateRecipeForm />
            </DialogContent>
          </Dialog>
        </div>

        {recipes.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No recipes yet. Create your first one!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <Link key={recipe._id} href={`/recipes/${recipe._id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <h3 className="font-medium text-lg">{recipe.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
