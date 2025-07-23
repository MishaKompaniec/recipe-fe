import React from 'react';
import { useDeleteRecipeMutation } from '../../store/services/api';

type Recipe = {
  id: number | string;
  title: string;
  rating: number;
  ingredients: string[];
  instructions: string;
  user?: {
    email: string;
  };
};

type RecipeCardProps = {
  recipe: Recipe;
};

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const [deleteRecipe, { isLoading }] = useDeleteRecipeMutation();

  const handleDelete = async () => {
    if (
      window.confirm(
        `Удалить рецепт "${recipe.title}"? Это действие необратимо.`
      )
    ) {
      try {
        await deleteRecipe(recipe.id).unwrap();
      } catch (error) {
        console.error('Ошибка удаления рецепта:', error);
      }
    }
  };

  return (
    <div className='relative border border-gray-300 rounded shadow hover:shadow-lg p-4 bg-white'>
      <button
        onClick={handleDelete}
        disabled={isLoading}
        className='absolute top-2 right-2 text-red-600 hover:text-red-800 font-bold text-xl leading-none'
        aria-label='Удалить рецепт'
        title='Удалить рецепт'
        type='button'
      >
        &times;
      </button>

      <h3 className='text-lg font-bold mb-2'>{recipe.title}</h3>

      <div className='mb-4'>
        <h4 className='font-semibold mb-1 text-gray-700'>Ингредиенты:</h4>
        {recipe.ingredients.length > 0 ? (
          <ul className='list-disc list-inside text-gray-800 bg-gray-50 p-3 rounded overflow-y-auto max-h-32'>
            {recipe.ingredients.map((ingredient, idx) => (
              <li key={idx}>{ingredient}</li>
            ))}
          </ul>
        ) : (
          <p className='text-gray-500 italic'>Ингредиенты не указаны</p>
        )}
      </div>

      <div>
        <h4 className='font-semibold mb-1 text-gray-700'>Инструкции:</h4>
        <p className='text-gray-800 whitespace-pre-line bg-gray-50 p-3 rounded max-h-40 overflow-y-auto'>
          {recipe.instructions || 'Инструкции не указаны'}
        </p>
      </div>

      <div className='flex justify-between mt-4'>
        <p className='text-yellow-500 mb-2'>Рейтинг: {recipe.rating} ⭐</p>
        <p className='text-gray-600 text-sm mb-4'>
          Автор: {recipe.user?.email}
        </p>
      </div>
    </div>
  );
};

export default RecipeCard;
