import { getRecipes } from '@/lib/actions';
import { RecipeList } from '@/components/recipe-list';

export default async function RecipesPage() {
  const recipes = await getRecipes();

  return <RecipeList initialRecipes={recipes} />;
}
