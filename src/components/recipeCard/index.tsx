import React, { useState, useEffect } from 'react';
import {
  useDeleteRecipeMutation,
  useGetRatingsByRecipeQuery,
  useCreateOrUpdateRatingMutation,
} from '../../store/services/api';
import type { Recipe } from '../../type';
import { DeleteIcon, EditIcon } from '../../icons';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: () => void;
  currentUserId: number | null;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  currentUserId,
  recipe,
  onEdit,
}) => {
  const [deleteRecipe, { isLoading: deleting }] = useDeleteRecipeMutation();
  const { data: ratings = [] } = useGetRatingsByRecipeQuery(Number(recipe.id));
  const [createOrUpdateRating, { isLoading: ratingUpdating }] =
    useCreateOrUpdateRatingMutation();
  const [userRating, setUserRating] = useState<number | null>(null);

  useEffect(() => {
    const myRating = ratings.find((r: any) => r.userId === currentUserId);
    setUserRating(myRating ? myRating.stars : null);
  }, [ratings, currentUserId]);

  const averageRating =
    ratings.length > 0
      ? (
          ratings.reduce((acc: any, r: any) => acc + r.stars, 0) /
          ratings.length
        ).toFixed(1)
      : '—';

  const handleDelete = async () => {
    if (
      window.confirm(
        `Delete recipe "${recipe.title}"? This action is irreversible.`
      )
    ) {
      try {
        await deleteRecipe(recipe.id).unwrap();
      } catch (error) {
        console.error('Error deleting recipe:', error);
      }
    }
  };

  const handleRate = async (stars: number) => {
    try {
      setUserRating(stars);
      await createOrUpdateRating({
        recipeId: Number(recipe.id),
        stars,
      }).unwrap();
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  return (
    <div className='relative border border-gray-300 rounded shadow hover:shadow-lg p-4 bg-white'>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className='absolute top-2 right-2 text-red-600 hover:text-red-800 p-1 rounded'
        aria-label='Delete recipe'
        title='Delete recipe'
        type='button'
      >
        <DeleteIcon />
      </button>

      <button
        onClick={onEdit}
        className='absolute top-2 right-10 text-blue-600 hover:text-blue-800 p-1 rounded'
        aria-label='Edit recipe'
        title='Edit recipe'
        type='button'
      >
        <EditIcon />
      </button>
      <h3 className='text-lg font-bold mb-2'>{recipe.title}</h3>
      {recipe.description && (
        <p className='mb-4 text-gray-700'>{recipe.description}</p>
      )}
      <div className='mb-4'>
        <h4 className='font-semibold mb-1 text-gray-700'>Ingredients:</h4>
        {recipe.ingredients.length > 0 ? (
          <ul className='list-disc list-inside text-gray-800 p-3 rounded overflow-y-auto'>
            {recipe.ingredients.map((ingredient, idx) => (
              <li key={idx}>{ingredient}</li>
            ))}
          </ul>
        ) : (
          <p className='text-gray-500 italic'>No ingredients specified</p>
        )}
      </div>
      <div>
        <h4 className='font-semibold mb-1 text-gray-700'>Instructions:</h4>
        <p className='text-gray-800 whitespace-pre-line bg-gray-50 p-3 rounded max-h-40 overflow-y-auto'>
          {recipe.instructions || 'No instructions provided'}
        </p>
      </div>
      <div className='mt-4'>
        <p className='text-gray-600 mb-2'>
          Average rating: <strong>{averageRating}</strong> ⭐ ({ratings.length}{' '}
          ratings)
        </p>

        <div className='flex space-x-1'>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              disabled={ratingUpdating}
              aria-label={`Rate ${star} stars`}
              className={`text-xl ${
                userRating && userRating >= star
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              } hover:text-yellow-500 transition`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div className='flex justify-between mt-4'>
        <p className='text-gray-600 text-sm mb-4'>
          Author: {recipe.user?.email}
        </p>
      </div>
    </div>
  );
};

export default RecipeCard;
