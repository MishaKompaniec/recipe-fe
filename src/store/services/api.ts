import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  AuthRequest,
  AuthResponse,
  CreateOrUpdateRatingRequest,
  CreateRecipeRequest,
  Rating,
  Recipe,
  UpdateRecipeRequest,
  User,
} from '../../type';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3000/',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Recipe', 'Rating'],
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, AuthRequest>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    register: build.mutation<User, AuthRequest>({
      query: (data) => ({
        url: 'auth/register',
        method: 'POST',
        body: data,
      }),
    }),

    getAllRecipes: build.query<Recipe[], void>({
      query: () => 'recipes',
      providesTags: ['Recipe'],
    }),

    getMyRecipes: build.query<Recipe[], void>({
      query: () => 'recipes/mine',
      providesTags: ['Recipe'],
    }),

    getRecipeById: build.query<Recipe, number>({
      query: (id) => `recipes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Recipe', id }],
    }),

    createRecipe: build.mutation<Recipe, CreateRecipeRequest>({
      query: (newRecipe) => ({
        url: 'recipes',
        method: 'POST',
        body: newRecipe,
      }),
      invalidatesTags: ['Recipe'],
    }),

    updateRecipe: build.mutation<Recipe, UpdateRecipeRequest>({
      query: ({ id, ...patch }) => ({
        url: `recipes/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Recipe'],
    }),

    deleteRecipe: build.mutation<void, number>({
      query: (id) => ({
        url: `recipes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Recipe'],
    }),

    createOrUpdateRating: build.mutation<Rating, CreateOrUpdateRatingRequest>({
      query: (ratingData) => ({
        url: 'ratings',
        method: 'POST',
        body: ratingData,
      }),
      invalidatesTags: ['Recipe', 'Rating'],
    }),

    getRatingsByRecipe: build.query<Rating[], number>({
      query: (recipeId) => `ratings/recipe/${recipeId}`,
      providesTags: (result, error, recipeId) => [
        { type: 'Rating', id: recipeId },
      ],
    }),

    deleteRating: build.mutation<void, number>({
      query: (recipeId) => ({
        url: `ratings/recipe/${recipeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Recipe'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetAllRecipesQuery,
  useGetMyRecipesQuery,
  useGetRecipeByIdQuery,
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
  useGetRatingsByRecipeQuery,
  useCreateOrUpdateRatingMutation,
  useDeleteRatingMutation,
} = api;
