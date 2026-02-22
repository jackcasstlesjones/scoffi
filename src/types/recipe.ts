export interface Recipe {
  _id: string;
  name: string;
  ingredients: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRecipeInput {
  name: string;
  ingredients?: string[];
}

export interface UpdateRecipeInput {
  id: string;
  name: string;
  ingredients: string[];
}
