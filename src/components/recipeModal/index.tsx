import React, { useEffect, useState } from 'react';
import type { RecipeFormData } from '../../type';
import { initialFormData } from '../../utils';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: RecipeFormData) => Promise<void>;
  loading: boolean;
  editingRecipe: (RecipeFormData & { id: number }) | null;
}

const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  editingRecipe,
}) => {
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
    } else {
      setFormData(initialFormData);
    }
    setNewIngredient('');
  }, [editingRecipe]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.ingredients.length === 0) {
      alert('Please add at least one ingredient.');
      return;
    }
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
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
              onClick={onClose}
              className='px-4 py-2 rounded border border-gray-400 hover:bg-gray-100'
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded'
            >
              {loading
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
  );
};

export default RecipeModal;
