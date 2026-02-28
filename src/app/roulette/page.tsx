import { getRecipes } from '@/lib/actions';
import { RecipeRoulette } from '@/components/recipe-roulette';

export default async function RoulettePage() {
  const recipes = await getRecipes();

  return <RecipeRoulette recipes={recipes} />;
}
