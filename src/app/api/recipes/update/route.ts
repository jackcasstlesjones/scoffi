import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { updateRecipe } from '@/lib/actions';

export async function POST(request: NextRequest) {
  const isAuthenticated = await getSession();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const ingredientsJson = formData.get('ingredients') as string;

  if (!id || !name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const ingredients = ingredientsJson ? JSON.parse(ingredientsJson) : [];

  const result = await updateRecipe({ id, name, ingredients });

  if (!result) {
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, recipe: result });
}
