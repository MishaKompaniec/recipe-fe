import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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
    login: build.mutation<
      { access_token: string },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: build.mutation<
      { id: number; email: string },
      { email: string; password: string }
    >({
      query: (data) => ({
        url: 'auth/register',
        method: 'POST',
        body: data,
      }),
    }),

    getAllRecipes: build.query({
      query: () => 'recipes',
      providesTags: ['Recipe'],
    }),
    getMyRecipes: build.query({
      query: () => 'recipes/mine',
      providesTags: ['Recipe'],
    }),
    getRecipeById: build.query({
      query: (id) => `recipes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Recipe', id }],
    }),
    createRecipe: build.mutation({
      query: (newRecipe) => ({
        url: 'recipes',
        method: 'POST',
        body: newRecipe,
      }),
      invalidatesTags: ['Recipe'],
    }),
    updateRecipe: build.mutation({
      query: ({ id, ...patch }) => ({
        url: `recipes/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Recipe'],
    }),
    deleteRecipe: build.mutation({
      query: (id) => ({
        url: `recipes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Recipe'],
    }),
    createOrUpdateRating: build.mutation({
      query: (ratingData) => ({
        url: 'ratings',
        method: 'POST',
        body: ratingData,
      }),
      invalidatesTags: ['Recipe', 'Rating'],
    }),

    getRatingsByRecipe: build.query({
      query: (recipeId) => `ratings/recipe/${recipeId}`,
      providesTags: (result, error, recipeId) => [
        { type: 'Rating', id: recipeId },
      ],
    }),

    deleteRating: build.mutation({
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
} = api;
