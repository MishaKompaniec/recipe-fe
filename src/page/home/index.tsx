import { useState, useMemo } from 'react';
import {
  useGetAllRecipesQuery,
  useGetMyRecipesQuery,
} from '../../store/services/api';

const HomePage = () => {
  const [search, setSearch] = useState('');
  const [showMyRecipes, setShowMyRecipes] = useState(false);

  const {
    data: allRecipes,
    error: allError,
    isLoading: allLoading,
  } = useGetAllRecipesQuery(undefined);

  const {
    data: myRecipes,
    error: myError,
    isLoading: myLoading,
  } = useGetMyRecipesQuery(undefined, {
    skip: !showMyRecipes,
  });

  // Выбираем какой список показывать
  const recipes = showMyRecipes ? myRecipes : allRecipes;
  const loading = showMyRecipes ? myLoading : allLoading;
  const error = showMyRecipes ? myError : allError;

  // Фильтрация по названию (search)
  const filteredRecipes = useMemo(() => {
    if (!recipes) return [];
    return recipes.filter((r: any) =>
      r.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [recipes, search]);

  if (loading) return <div className='p-4'>Загрузка рецептов...</div>;
  if (error)
    return <div className='p-4 text-red-600'>Ошибка загрузки рецептов</div>;

  return (
    <div className='container mx-auto px-4 py-6'>
      <div className='flex flex-col md:flex-row justify-between items-center mb-6 gap-4'>
        <input
          type='text'
          placeholder='Поиск рецептов...'
          className='border border-gray-300 rounded px-3 py-2 w-full max-w-md'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className='bg-lime-600 hover:bg-lime-700 text-white font-semibold px-4 py-2 rounded'
          onClick={() => setShowMyRecipes(!showMyRecipes)}
        >
          {showMyRecipes ? 'Все рецепты' : 'Мои рецепты'}
        </button>

        <button
          className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded'
          onClick={() => {
            // Тут переход к форме добавления рецепта, например:
            // router.push('/recipes/create');
          }}
        >
          Добавить рецепт
        </button>
      </div>

      {filteredRecipes.length === 0 ? (
        <div>Рецепты не найдены.</div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {filteredRecipes.map((recipe: any) => (
            <div
              key={recipe.id}
              className='border border-gray-300 rounded shadow hover:shadow-lg p-4 cursor-pointer'
              // Например, переход на страницу рецепта по клику:
              // onClick={() => router.push(`/recipes/${recipe.id}`)}
            >
              <h3 className='text-lg font-bold mb-2'>{recipe.title}</h3>
              <p className='text-yellow-500 mb-1'>
                Рейтинг: {recipe.rating} ⭐
              </p>
              <p className='text-gray-600 text-sm'>Автор: {recipe.author}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
