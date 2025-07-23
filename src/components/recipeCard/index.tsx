import React from 'react';

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
  onClick?: () => void;
};

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  return (
    <div
      onClick={onClick}
      className='border border-gray-300 rounded shadow hover:shadow-lg p-4 cursor-pointer bg-white'
    >
      <h3 className='text-lg font-bold mb-2'>{recipe.title}</h3>
      <p className='text-yellow-500 mb-2'>Рейтинг: {recipe.rating} ⭐</p>
      <p className='text-gray-600 text-sm mb-4'>Автор: {recipe.user?.email}</p>

      <div className='mb-4'>
        <h4 className='font-semibold mb-1 text-gray-700'>Ингредиенты:</h4>
        {recipe.ingredients.length > 0 ? (
          <ul className='list-disc list-inside text-gray-800 bg-gray-50 p-3 rounded overflow-y-auto'>
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
    </div>
  );
};

export default RecipeCard;
