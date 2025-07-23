import { useState, useMemo, useEffect } from 'react';
import {
  useGetAllRecipesQuery,
  useGetMyRecipesQuery,
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
} from '../../store/services/api';
import RecipeCard from '../../components/recipeCard';
import RecipeModal from '../../components/recipeModal';
import type { RecipeFormData, Recipe } from '../../type';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<
    (RecipeFormData & { id: number }) | null
  >(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const {
    data: allRecipes,
    error: allError,
    isLoading: allLoading,
  } = useGetAllRecipesQuery();

  const {
    data: myRecipes,
    error: myError,
    isLoading: myLoading,
  } = useGetMyRecipesQuery(undefined, { skip: activeTab !== 'mine' });

  const [createRecipe, { isLoading: isCreating }] = useCreateRecipeMutation();
  const [updateRecipe, { isLoading: isUpdating }] = useUpdateRecipeMutation();

  const recipes = activeTab === 'mine' ? myRecipes : allRecipes;
  const loading = activeTab === 'mine' ? myLoading : allLoading;
  const error = activeTab === 'mine' ? myError : allError;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        setCurrentUserId(payload?.sub || null);
      } catch {
        setCurrentUserId(null);
      }
    }
  }, []);

  const filteredRecipes = useMemo(() => {
    if (!recipes) return [];
    return recipes.filter((r: Recipe) =>
      r.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [recipes, search]);

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setModalOpen(true);
  };

  return (
    <div className='container mx-auto px-4 py-6'>
      <div className='flex space-x-4 mb-6'>
        <button
          onClick={() => {
            setActiveTab('all');
            setSearch('');
          }}
          className={`px-4 py-2 rounded font-semibold ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          All Recipes
        </button>
        <button
          onClick={() => {
            setActiveTab('mine');
            setSearch('');
          }}
          className={`px-4 py-2 rounded font-semibold ${
            activeTab === 'mine'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          My Recipes
        </button>
      </div>

      <div className='flex justify-between items-center mb-6 gap-4 flex-col md:flex-row'>
        <input
          type='text'
          placeholder='Search recipes...'
          className='border border-gray-300 rounded px-3 py-2 w-full max-w-md'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {activeTab === 'mine' && (
          <button
            className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded'
            onClick={() => {
              setEditingRecipe(null);
              setModalOpen(true);
            }}
          >
            Add Recipe
          </button>
        )}
      </div>

      {loading && <div className='p-4'>Loading recipes...</div>}
      {error && <div className='p-4 text-red-600'>Failed to load recipes</div>}

      {!loading && !error && (
        <>
          {filteredRecipes.length === 0 ? (
            <div>No recipes found.</div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onEdit={() => handleEdit(recipe)}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
        </>
      )}

      <RecipeModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRecipe(null);
        }}
        onSubmit={async (data) => {
          try {
            if (editingRecipe) {
              await updateRecipe({ id: editingRecipe.id, ...data }).unwrap();
            } else {
              await createRecipe(data).unwrap();
            }
            setModalOpen(false);
            setEditingRecipe(null);
          } catch (error) {
            console.error('Error saving recipe:', error);
          }
        }}
        loading={isCreating || isUpdating}
        editingRecipe={editingRecipe}
      />
    </div>
  );
};

export default HomePage;
