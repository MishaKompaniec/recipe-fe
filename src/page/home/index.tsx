import { useState, useMemo, useEffect } from 'react';
import {
  useGetAllRecipesQuery,
  useGetMyRecipesQuery,
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
} from '../../store/services/api';
import RecipeCard from '../../components/recipeCard';

type RecipeFormData = {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
};

const initialFormData: RecipeFormData = {
  title: '',
  description: '',
  ingredients: [],
  instructions: '',
};

const HomePage = () => {
  const [search, setSearch] = useState('');
  const [showMyRecipes, setShowMyRecipes] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<
    (RecipeFormData & { id: number | string }) | null
  >(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

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
  const [updateRecipe, { isLoading: isUpdating }] = useUpdateRecipeMutation();

  const recipes = showMyRecipes ? myRecipes : allRecipes;
  const loading = showMyRecipes ? myLoading : allLoading;
  const error = showMyRecipes ? myError : allError;

  function parseJwt(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      setCurrentUserId(payload?.sub || null);
    }
  }, []);

  const filteredRecipes = useMemo(() => {
    if (!recipes) return [];
    return recipes.filter((r: any) =>
      r.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [recipes, search]);

  const [formData, setFormData] = useState<RecipeFormData>(initialFormData);
  const [newIngredient, setNewIngredient] = useState('');

  useEffect(() => {
    if (editingRecipe) {
      setFormData({
        title: editingRecipe.title,
        description: editingRecipe.description,
        ingredients: editingRecipe.ingredients,
        instructions: editingRecipe.instructions,
      });
      setModalOpen(true);
    } else {
      setFormData(initialFormData);
      setNewIngredient('');
    }
  }, [editingRecipe]);

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
      if (editingRecipe) {
        await updateRecipe({ id: editingRecipe.id, ...formData }).unwrap();
      } else {
        await createRecipe(formData).unwrap();
      }
      setModalOpen(false);
      setEditingRecipe(null);
      setFormData(initialFormData);
      setNewIngredient('');
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  const handleEdit = (recipe: any) => {
    setEditingRecipe(recipe);
  };

  if (loading) return <div className='p-4'>Loading recipes...</div>;
  if (error)
    return <div className='p-4 text-red-600'>Failed to load recipes</div>;

  return (
    <div className='container mx-auto px-4 py-6'>
      <div className='flex flex-col md:flex-row justify-between items-center mb-6 gap-4'>
        <input
          type='text'
          placeholder='Search recipes...'
          className='border border-gray-300 rounded px-3 py-2 w-full max-w-md'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className='bg-lime-600 hover:bg-lime-700 text-white font-semibold px-4 py-2 rounded'
          onClick={() => setShowMyRecipes(!showMyRecipes)}
        >
          {showMyRecipes ? 'All Recipes' : 'My Recipes'}
        </button>

        <button
          className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded'
          onClick={() => {
            setEditingRecipe(null);
            setModalOpen(true);
          }}
        >
          Add Recipe
        </button>
      </div>

      {filteredRecipes.length === 0 ? (
        <div>No recipes found.</div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {filteredRecipes.map((recipe: any) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onEdit={() => handleEdit(recipe)}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto'>
            <h2 className='text-2xl font-bold mb-4'>
              {editingRecipe ? 'Edit Recipe' : 'Create Recipe'}
            </h2>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <input
                name='title'
                type='text'
                placeholder='Title'
                value={formData.title}
                onChange={handleChange}
                required
                className='w-full border border-gray-300 rounded px-3 py-2'
              />
              <textarea
                name='description'
                placeholder='Description (optional)'
                value={formData.description}
                onChange={handleChange}
                className='w-full border border-gray-300 rounded px-3 py-2'
              />

              <div>
                <label className='block font-semibold mb-1'>Ingredients:</label>
                <div className='flex gap-2 mb-2'>
                  <input
                    type='text'
                    placeholder='New ingredient'
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    className='flex-grow border border-gray-300 rounded px-3 py-2'
                  />
                  <button
                    type='button'
                    onClick={addIngredient}
                    className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded'
                  >
                    Add
                  </button>
                </div>

                {formData.ingredients.length === 0 && (
                  <p className='text-gray-500 italic'>No ingredients added</p>
                )}

                <ul className='list-disc list-inside max-h-32 overflow-y-auto border border-gray-200 rounded p-2'>
                  {formData.ingredients.map((ing, i) => (
                    <li key={i} className='flex justify-between items-center'>
                      <span>{ing}</span>
                      <button
                        type='button'
                        onClick={() => removeIngredient(i)}
                        className='text-red-600 hover:text-red-800 font-bold ml-2'
                        aria-label={`Remove ingredient ${ing}`}
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <textarea
                name='instructions'
                placeholder='Cooking instructions'
                value={formData.instructions}
                onChange={handleChange}
                required
                className='w-full border border-gray-300 rounded px-3 py-2'
              />

              <div className='flex justify-end space-x-4'>
                <button
                  type='button'
                  onClick={() => {
                    setModalOpen(false);
                    setEditingRecipe(null);
                  }}
                  className='px-4 py-2 rounded border border-gray-400 hover:bg-gray-100'
                  disabled={isCreating || isUpdating}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isCreating || isUpdating}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded'
                >
                  {isCreating || isUpdating
                    ? editingRecipe
                      ? 'Saving...'
                      : 'Creating...'
                    : editingRecipe
                    ? 'Save'
                    : 'Create'}
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
