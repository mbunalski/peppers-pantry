"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChefHatIcon,
  ShoppingCartIcon,
  CheckIcon,
  CopyIcon,
  ShareIcon,
  PrinterIcon,
  CalendarIcon,
  EditIcon,
  TrashIcon,
  SaveIcon,
  XIcon
} from "lucide-react";
import Layout from "../../components/Layout";
import { useAuth } from "../../contexts/AuthContext";

interface ShoppingItem {
  ingredient: string;
  amount: string;
  category: string;
}

interface ShoppingList {
  id: string;
  name: string;
  created_at: string;
  items: ShoppingItem[];
}

export default function ShoppingList() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [copySuccess, setCopySuccess] = useState(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ ingredient: '', amount: '', category: '' });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !token) {
      router.push('/login?redirect=/shopping-list');
    }
  }, [user, token, router]);

  // Load shopping list
  useEffect(() => {
    if (user && token) {
      loadShoppingList();
    }
  }, [user, token]);

  const loadShoppingList = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/shopping-list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setShoppingList(data.shoppingList);
        
        // Initialize checked state if shopping list exists
        if (data.shoppingList) {
          const checkedState: { [key: string]: boolean } = {};
          data.shoppingList.items.forEach((_: any, index: number) => {
            checkedState[`${data.shoppingList.id}-${index}`] = false;
          });
          setCheckedItems(checkedState);
        }
      }
    } catch (error) {
      console.error('Error loading shopping list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemCheck = (listId: string, itemIndex: number) => {
    const key = `${listId}-${itemIndex}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getCheckedItemsCount = (listId: string, totalItems: number) => {
    let checkedCount = 0;
    for (let i = 0; i < totalItems; i++) {
      if (checkedItems[`${listId}-${i}`]) {
        checkedCount++;
      }
    }
    return checkedCount;
  };

  const getItemsByCategory = (items: ShoppingItem[]) => {
    const categories: { [key: string]: ShoppingItem[] } = {};
    items.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });
    return categories;
  };

  const copyToClipboard = () => {
    if (!shoppingList) return;
    
    const listText = `${shoppingList.name}\n\n` +
      Object.entries(getItemsByCategory(shoppingList.items))
        .map(([category, items]) => `${category}:\n${items.map(item => `• ${item.amount} ${item.ingredient}`).join('\n')}`)
        .join('\n\n');
    
    navigator.clipboard.writeText(listText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleShare = () => {
    if (!shoppingList) return;
    
    const shareText = `Shopping List - ${shoppingList.name}\n\n` +
      shoppingList.items.map(item => `• ${item.amount} ${item.ingredient}`).join('\n');
    
    if (navigator.share) {
      navigator.share({
        title: shoppingList.name,
        text: shareText,
      });
    } else {
      copyToClipboard();
      alert('Shopping list copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEditItem = (itemIndex: number) => {
    if (!shoppingList) return;
    const item = shoppingList.items[itemIndex];
    setEditForm({
      ingredient: item.ingredient,
      amount: item.amount,
      category: item.category
    });
    setEditingItem(itemIndex);
  };

  const handleSaveEdit = async () => {
    if (!shoppingList || editingItem === null) return;

    try {
      const response = await fetch('/api/shopping-list', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shoppingListId: shoppingList.id,
          itemIndex: editingItem,
          updatedItem: editForm
        })
      });

      if (response.ok) {
        // Update local state
        const updatedItems = [...shoppingList.items];
        updatedItems[editingItem] = editForm;
        setShoppingList({ ...shoppingList, items: updatedItems });
        setEditingItem(null);
        setEditForm({ ingredient: '', amount: '', category: '' });
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditForm({ ingredient: '', amount: '', category: '' });
  };

  const handleDeleteItem = async (itemIndex: number) => {
    if (!shoppingList) return;

    if (!confirm('Delete this item from your shopping list?')) return;

    try {
      const response = await fetch('/api/shopping-list', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shoppingListId: shoppingList.id,
          itemIndex: itemIndex
        })
      });

      if (response.ok) {
        // Update local state
        const updatedItems = shoppingList.items.filter((_, index) => index !== itemIndex);
        setShoppingList({ ...shoppingList, items: updatedItems });

        // Update checked items state
        const newCheckedItems: { [key: string]: boolean } = {};
        updatedItems.forEach((_, index) => {
          const oldKey = `${shoppingList.id}-${index >= itemIndex ? index + 1 : index}`;
          const newKey = `${shoppingList.id}-${index}`;
          newCheckedItems[newKey] = checkedItems[oldKey] || false;
        });
        setCheckedItems(newCheckedItems);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your shopping lists...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!shoppingList) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingCartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Shopping List Yet</h1>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              You haven't generated a shopping list yet. Create a meal plan first, then generate your shopping list from there.
            </p>
            <div className="space-x-4">
              <Link
                href="/meal-plan"
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 inline-block"
              >
                Create Meal Plan
              </Link>
              <Link
                href="/recipes"
                className="text-red-600 hover:text-red-700 inline-block"
              >
                Browse Recipes
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ShoppingCartIcon className="h-8 w-8 text-red-600 mr-3" />
                Shopping List
              </h1>
              <p className="text-gray-600 mt-1">
                Created {new Date(shoppingList.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-3">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <CopyIcon className="h-4 w-4 mr-2" />
                  {copySuccess ? 'Copied!' : 'Copy List'}
                </button>
                <button 
                  onClick={handleShare}
                  className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Share
                </button>
                <button 
                  onClick={handlePrint}
                  className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <PrinterIcon className="h-4 w-4 mr-2" />
                  Print
                </button>
              </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Shopping Progress</h2>
            <span className="text-sm text-gray-600">
              {getCheckedItemsCount(shoppingList.id, shoppingList.items.length)} of {shoppingList.items.length} items collected
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(getCheckedItemsCount(shoppingList.id, shoppingList.items.length) / shoppingList.items.length) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-gray-500">{shoppingList.name}</span>
            <span className="text-sm text-green-600 font-medium">
              {Math.round((getCheckedItemsCount(shoppingList.id, shoppingList.items.length) / shoppingList.items.length) * 100)}% complete
            </span>
          </div>
        </div>

        {/* Shopping List Categories */}
        <div className="space-y-6">
          {Object.entries(getItemsByCategory(shoppingList.items)).map(([category, items]) => (
            <div key={category} className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                {category}
              </h3>
              <div className="space-y-3">
                {items.map((item, itemIndex) => {
                  const originalIndex = shoppingList.items.findIndex(
                    originalItem => originalItem.ingredient === item.ingredient && originalItem.category === category
                  );
                  const isChecked = checkedItems[`${shoppingList.id}-${originalIndex}`];
                  
                  return (
                    <div key={itemIndex} className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
                      <button
                        onClick={() => handleItemCheck(shoppingList.id, originalIndex)}
                        className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors ${
                          isChecked
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {isChecked && <CheckIcon className="h-4 w-4" />}
                      </button>

                      {editingItem === originalIndex ? (
                        // Edit mode
                        <div className="ml-4 flex-1 flex items-center space-x-2">
                          <input
                            type="text"
                            value={editForm.ingredient}
                            onChange={(e) => setEditForm({ ...editForm, ingredient: e.target.value })}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Ingredient"
                          />
                          <input
                            type="text"
                            value={editForm.amount}
                            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Amount"
                          />
                          <select
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="Produce">Produce</option>
                            <option value="Meat & Protein">Meat & Protein</option>
                            <option value="Dairy">Dairy</option>
                            <option value="Pantry">Pantry</option>
                          </select>
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 text-green-600 hover:text-green-700"
                          >
                            <SaveIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-gray-600 hover:text-gray-700"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        // View mode
                        <>
                          <div className="ml-4 flex-1">
                            <span className={`text-base ${isChecked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {item.ingredient}
                            </span>
                            <span className={`ml-2 text-sm ${isChecked ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                              ({item.amount})
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            <button
                              onClick={() => handleEditItem(originalIndex)}
                              className="p-1 text-blue-600 hover:text-blue-700"
                              title="Edit item"
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(originalIndex)}
                              className="p-1 text-red-600 hover:text-red-700"
                              title="Delete item"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Action Footer */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/meal-plan"
                className="flex items-center text-red-600 hover:text-red-700"
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                Back to Meal Plan
              </Link>
              <Link
                href="/recipes"
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <ChefHatIcon className="h-4 w-4 mr-1" />
                Browse Recipes
              </Link>
            </div>
            <button
              onClick={() => {
                if (confirm('Generate a new shopping list? This will create a fresh list from your current meal plan.')) {
                  router.push('/meal-plan');
                }
              }}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              Generate New List
            </button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          
          body {
            background: white !important;
          }
          
          .bg-gray-50 {
            background: white !important;
          }
          
          .shadow-sm {
            box-shadow: none !important;
          }
          
          .rounded-lg {
            border-radius: 0 !important;
          }
          
          button {
            display: none !important;
          }
        }
      `}</style>
    </Layout>
  );
}