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
  CalendarIcon 
} from "lucide-react";
import Header from "../../components/Header";
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your shopping lists...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!shoppingList) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

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
                      <div className="ml-4 flex-1">
                        <span className={`text-base ${isChecked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {item.ingredient}
                        </span>
                        <span className={`ml-2 text-sm ${isChecked ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                          ({item.amount})
                        </span>
                      </div>
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
    </div>
  );
}