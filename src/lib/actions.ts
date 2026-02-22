'use server';

import { redirect } from 'next/navigation';
import { getRecipeModel } from './models/Recipe';
import { getSession, setSession, clearSession, verifyCredentials } from './session';
import type { Recipe, CreateRecipeInput, UpdateRecipeInput } from '@/types/recipe';

// Auth Actions

interface LoginState {
  success: boolean;
  error: string;
}

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  const isValid = await verifyCredentials(username, password);

  if (!isValid) {
    return { success: false, error: 'Invalid credentials' };
  }

  await setSession();
  redirect('/recipes');
}

export async function logout() {
  await clearSession();
  redirect('/login');
}

// Recipe Actions

export async function getRecipes(): Promise<Recipe[]> {
  const isAuthenticated = await getSession();
  if (!isAuthenticated) {
    redirect('/login');
  }

  const RecipeModel = await getRecipeModel();
  const recipes = await RecipeModel.find({}).sort({ updatedAt: -1 }).lean();

  return recipes.map((recipe) => ({
    _id: recipe._id.toString(),
    name: recipe.name,
    ingredients: recipe.ingredients,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
  }));
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  const isAuthenticated = await getSession();
  if (!isAuthenticated) {
    redirect('/login');
  }

  const RecipeModel = await getRecipeModel();
  const recipe = await RecipeModel.findById(id).lean();

  if (!recipe) {
    return null;
  }

  return {
    _id: recipe._id.toString(),
    name: recipe.name,
    ingredients: recipe.ingredients,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
  };
}

interface CreateRecipeState {
  success: boolean;
  error: string;
  recipeId: string | null;
}

export async function createRecipe(prevState: CreateRecipeState, formData: FormData): Promise<CreateRecipeState> {
  const isAuthenticated = await getSession();
  if (!isAuthenticated) {
    redirect('/login');
  }

  const name = formData.get('name') as string;

  if (!name || !name.trim()) {
    return { success: false, error: 'Recipe name is required', recipeId: null };
  }

  try {
    const RecipeModel = await getRecipeModel();
    const recipe = await RecipeModel.create({
      name: name.trim(),
      ingredients: [],
    });

    return {
      success: true,
      error: '',
      recipeId: recipe._id.toString(),
    };
  } catch (error) {
    return { success: false, error: 'Failed to create recipe', recipeId: null };
  }
}

export async function updateRecipe(input: UpdateRecipeInput): Promise<Recipe | null> {
  const isAuthenticated = await getSession();
  if (!isAuthenticated) {
    redirect('/login');
  }

  const RecipeModel = await getRecipeModel();
  const recipe = await RecipeModel.findByIdAndUpdate(
    input.id,
    {
      name: input.name,
      ingredients: input.ingredients,
    },
    { new: true }
  ).lean();

  if (!recipe) {
    return null;
  }

  return {
    _id: recipe._id.toString(),
    name: recipe.name,
    ingredients: recipe.ingredients,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
  };
}

export async function deleteRecipe(id: string): Promise<boolean> {
  const isAuthenticated = await getSession();
  if (!isAuthenticated) {
    redirect('/login');
  }

  const RecipeModel = await getRecipeModel();
  const result = await RecipeModel.findByIdAndDelete(id);

  return result !== null;
}

export async function reorderIngredients(recipeId: string, ingredients: string[]): Promise<Recipe | null> {
  const isAuthenticated = await getSession();
  if (!isAuthenticated) {
    redirect('/login');
  }

  const RecipeModel = await getRecipeModel();
  const recipe = await RecipeModel.findByIdAndUpdate(
    recipeId,
    { ingredients },
    { new: true }
  ).lean();

  if (!recipe) {
    return null;
  }

  return {
    _id: recipe._id.toString(),
    name: recipe.name,
    ingredients: recipe.ingredients,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
  };
}
