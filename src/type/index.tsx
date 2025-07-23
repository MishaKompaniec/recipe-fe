export interface User {
  id: number;
  email: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface Recipe {
  id: number;
  title: string;
  ingredients: string[];
  instructions: string;
  user?: User;
}

export interface CreateRecipeRequest {
  title: string;
  ingredients: string[];
  instructions: string;
}

export interface UpdateRecipeRequest extends Partial<CreateRecipeRequest> {
  id: number;
}

export interface Rating {
  id: number;
  recipeId: number;
  userId: number;
  stars: number;
}

export interface CreateOrUpdateRatingRequest {
  recipeId: number;
  stars: number;
}

export interface RecipeFormData {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
}
