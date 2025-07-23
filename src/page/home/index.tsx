import { useState, useMemo } from 'react';
import {
  useGetAllRecipesQuery,
  useGetMyRecipesQuery,
  useCreateRecipeMutation,
} from '../../store/services/api';
import RecipeCard from '../../components/recipeCard';

const HomePage = () => {
  const [search, setSearch] = useState('');
  const [showMyRecipes, setShowMyRecipes] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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

  const [createRecipe, { isLoading: isCreating }] = useCreateRecipeMutation();

  const recipes = showMyRecipes ? myRecipes : allRecipes;
  const loading = showMyRecipes ? myLoading : allLoading;
  const error = showMyRecipes ? myError : allError;

  const filteredRecipes = useMemo(() => {
    if (!recipes) return [];
    return recipes.filter((r: any) =>
      r.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [recipes, search]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: [] as string[],
    instructions: '',
  });

  const [newIngredient, setNewIngredient] = useState('');

  const addIngredient = () => {
    const trimmed = newIngredient.trim();
    if (trimmed && !formData.ingredients.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, trimmed],
      }));
      setNewIngredient('');
    }
  };

  const removeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createRecipe(formData).unwrap();
      setModalOpen(false);
      setFormData({
        title: '',
        description: '',
        ingredients: [],
        instructions: '',
      });
      setNewIngredient('');
    } catch (error) {
      console.error('Ошибка при создании рецепта:', error);
    }
  };

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
          onClick={() => setModalOpen(true)}
        >
          Добавить рецепт
        </button>
      </div>

      {filteredRecipes.length === 0 ? (
        <div>Рецепты не найдены.</div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {filteredRecipes.map((recipe: any) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => {
                // Например, переход на страницу рецепта
                // router.push(`/recipes/${recipe.id}`);
              }}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto'>
            <h2 className='text-2xl font-bold mb-4'>Создать рецепт</h2>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <input
                name='title'
                type='text'
                placeholder='Название'
                value={formData.title}
                onChange={handleChange}
                required
                className='w-full border border-gray-300 rounded px-3 py-2'
              />
              <textarea
                name='description'
                placeholder='Описание (опционально)'
                value={formData.description}
                onChange={handleChange}
                className='w-full border border-gray-300 rounded px-3 py-2'
              />

              {/* Ингредиенты как массив */}
              <div>
                <label className='block font-semibold mb-1'>Ингредиенты:</label>
                <div className='flex gap-2 mb-2'>
                  <input
                    type='text'
                    placeholder='Новый ингредиент'
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    className='flex-grow border border-gray-300 rounded px-3 py-2'
                  />
                  <button
                    type='button'
                    onClick={addIngredient}
                    className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded'
                  >
                    Добавить
                  </button>
                </div>

                {formData.ingredients.length === 0 && (
                  <p className='text-gray-500 italic'>
                    Ингредиенты не добавлены
                  </p>
                )}

                <ul className='list-disc list-inside max-h-32 overflow-y-auto border border-gray-200 rounded p-2'>
                  {formData.ingredients.map((ing, i) => (
                    <li key={i} className='flex justify-between items-center'>
                      <span>{ing}</span>
                      <button
                        type='button'
                        onClick={() => removeIngredient(i)}
                        className='text-red-600 hover:text-red-800 font-bold ml-2'
                        aria-label={`Удалить ингредиент ${ing}`}
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <textarea
                name='instructions'
                placeholder='Инструкции по приготовлению'
                value={formData.instructions}
                onChange={handleChange}
                required
                className='w-full border border-gray-300 rounded px-3 py-2'
              />

              <div className='flex justify-end space-x-4'>
                <button
                  type='button'
                  onClick={() => setModalOpen(false)}
                  className='px-4 py-2 rounded border border-gray-400 hover:bg-gray-100'
                  disabled={isCreating}
                >
                  Отмена
                </button>
                <button
                  type='submit'
                  disabled={isCreating}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded'
                >
                  {isCreating ? 'Создание...' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
