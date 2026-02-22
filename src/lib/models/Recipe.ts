import mongoose, { Schema, Model } from 'mongoose';
import { connectDB } from '../mongodb';

interface IRecipe {
  name: string;
  ingredients: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface RecipeDocument extends IRecipe, mongoose.Document {}

const RecipeSchema = new Schema<IRecipe>(
  {
    name: {
      type: String,
      required: [true, 'Recipe name is required'],
      trim: true,
    },
    ingredients: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
let RecipeModel: Model<IRecipe> | null = null;

export async function getRecipeModel(): Promise<Model<IRecipe>> {
  await connectDB();

  if (RecipeModel) {
    return RecipeModel;
  }

  // Check if model already exists (hot reload scenario)
  if (mongoose.models.Recipe) {
    RecipeModel = mongoose.models.Recipe as Model<IRecipe>;
  } else {
    RecipeModel = mongoose.model<IRecipe>('Recipe', RecipeSchema);
  }

  return RecipeModel;
}

export type { IRecipe, RecipeDocument };
