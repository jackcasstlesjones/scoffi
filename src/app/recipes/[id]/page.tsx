import { notFound } from 'next/navigation';
import { getRecipe, deleteRecipe } from '@/lib/actions';
import { RecipeDetail } from '@/components/recipe-detail';

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    notFound();
  }

  return <RecipeDetail recipe={recipe} />;
}
