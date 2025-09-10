"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ChefHatIcon, 
  ClockIcon, 
  UsersIcon, 
  PrinterIcon, 
  ShareIcon, 
  HeartIcon, 
  BookmarkIcon,
  CalendarPlusIcon,
  ShoppingCartIcon,
  ExternalLinkIcon,
  LockIcon
} from "lucide-react";
import Header from "../../../components/Header";
import { useAuth } from "../../../contexts/AuthContext";

// Mock recipe data - in a real app, this would be fetched from an API
const mockRecipeData: { [key: string]: any } = {
  "245": {
    id: 245,
    title: "Tofu Stir-fry",
    time: 30,
    servings: 4,
    difficulty: "Easy",
    cuisine: "Asian",
    dietary: ["vegetarian", "vegan"],
    summary: "Quick and healthy vegetarian stir-fry with tofu and fresh vegetables. Perfect for weeknight dinners when you want something nutritious and delicious.",
    description: "This colorful tofu stir-fry brings together crisp vegetables and protein-rich tofu in a savory sauce. It's an excellent way to get your daily vegetables while enjoying the satisfying textures and flavors of Asian cuisine.",
    source: "BBC Good Food",
    url: "https://www.bbcgoodfood.com/recipes/tofu-stir-fry",
    nutrition: {
      calories: 320,
      protein: 18,
      carbs: 28,
      fat: 16,
      fiber: 6
    },
    ingredients: [
      { item: "Extra firm tofu", amount: "1 block (14 oz)", notes: "drained and cubed" },
      { item: "Soy sauce", amount: "3 tablespoons", notes: "low sodium preferred" },
      { item: "Honey", amount: "2 tablespoons", notes: "or maple syrup for vegan" },
      { item: "Fresh broccoli", amount: "2 cups", notes: "cut into florets" },
      { item: "Carrots", amount: "2 medium", notes: "sliced diagonally" },
      { item: "Fresh ginger", amount: "1 inch piece", notes: "minced" },
      { item: "Garlic", amount: "3 cloves", notes: "minced" },
      { item: "Vegetable oil", amount: "2 tablespoons", notes: "for cooking" },
      { item: "Sesame oil", amount: "1 teaspoon", notes: "for flavor" },
      { item: "Green onions", amount: "2 stalks", notes: "sliced" },
      { item: "Sesame seeds", amount: "1 tablespoon", notes: "for garnish" }
    ],
    instructions: [
      "Press tofu between paper towels to remove excess moisture. Cut into 1-inch cubes.",
      "Heat vegetable oil in a large skillet or wok over medium-high heat.",
      "Add tofu cubes and cook for 3-4 minutes per side until golden brown. Remove and set aside.",
      "In the same pan, add broccoli and carrots. Stir-fry for 3-4 minutes until crisp-tender.",
      "Add minced ginger and garlic, cook for another 30 seconds until fragrant.",
      "In a small bowl, whisk together soy sauce, honey, and sesame oil.",
      "Return tofu to the pan, pour sauce over everything, and toss to combine.",
      "Cook for 2-3 more minutes until sauce thickens slightly.",
      "Garnish with green onions and sesame seeds before serving.",
      "Serve immediately over rice or noodles."
    ],
    tips: [
      "Press tofu for at least 15 minutes for best texture",
      "Don't overcrowd the pan - cook in batches if necessary",
      "Keep vegetables crisp for better texture and nutrition",
      "Substitute vegetables based on what you have available"
    ]
  },
  "194": {
    id: 194,
    title: "Bolognese Sauce",
    time: 120,
    servings: 6,
    difficulty: "Medium",
    cuisine: "Italian",
    dietary: [],
    summary: "Classic Italian meat sauce perfect for pasta dishes. Rich, hearty, and full of flavor.",
    description: "A traditional Bolognese sauce that's simmered for hours to develop deep, complex flavors. This sauce is perfect for pasta, lasagna, or any dish that needs a robust meat sauce.",
    source: "Serious Eats",
    url: "https://www.seriouseats.com/best-slow-cooked-bolognese-sauce",
    nutrition: { calories: 280, protein: 22, carbs: 12, fat: 18, fiber: 3 },
    ingredients: [
      { item: "Ground beef", amount: "1 lb", notes: "80/20 blend" },
      { item: "Crushed tomatoes", amount: "28 oz can", notes: "" },
      { item: "Yellow onion", amount: "1 large", notes: "diced" },
      { item: "Garlic", amount: "4 cloves", notes: "minced" },
      { item: "Red wine", amount: "1/2 cup", notes: "optional" },
      { item: "Fresh herbs", amount: "2 tbsp", notes: "basil and oregano" }
    ],
    instructions: [
      "Brown the ground beef in a large pot over medium-high heat.",
      "Add diced onion and cook until softened, about 5 minutes.",
      "Add minced garlic and cook for 1 minute until fragrant.",
      "Pour in red wine and let it reduce by half.",
      "Add crushed tomatoes and herbs, bring to a simmer.",
      "Reduce heat to low and simmer for 1.5-2 hours, stirring occasionally.",
      "Season with salt and pepper to taste.",
      "Serve over your favorite pasta."
    ],
    tips: [
      "Use a mix of ground beef and pork for more flavor",
      "Let the sauce simmer low and slow for best results",
      "Add a splash of milk for creaminess",
      "This sauce freezes well for up to 3 months"
    ]
  },
  "43": {
    id: 43,
    title: "Chicken Alfredo",
    time: 25,
    servings: 4,
    difficulty: "Easy",
    cuisine: "Italian",
    dietary: [],
    summary: "Creamy pasta dish with tender chicken and rich alfredo sauce.",
    description: "A restaurant-quality chicken alfredo made at home with a silky, rich cream sauce that coats every strand of pasta perfectly.",
    source: "AllRecipes",
    url: "#",
    nutrition: { calories: 650, protein: 35, carbs: 45, fat: 38, fiber: 2 },
    ingredients: [
      { item: "Chicken breast", amount: "1 lb", notes: "sliced thin" },
      { item: "Fettuccine pasta", amount: "12 oz", notes: "" },
      { item: "Heavy cream", amount: "1 cup", notes: "" },
      { item: "Parmesan cheese", amount: "1 cup", notes: "freshly grated" },
      { item: "Garlic", amount: "3 cloves", notes: "minced" },
      { item: "Butter", amount: "4 tbsp", notes: "" }
    ],
    instructions: [
      "Cook pasta according to package directions until al dente.",
      "Season chicken with salt and pepper, cook in butter until golden.",
      "Remove chicken and set aside.",
      "In same pan, add garlic and cook for 30 seconds.",
      "Pour in cream and bring to a gentle simmer.",
      "Gradually whisk in Parmesan cheese until smooth.",
      "Return chicken to pan and toss with drained pasta.",
      "Serve immediately with extra Parmesan."
    ],
    tips: [
      "Don't let the cream boil or it may curdle",
      "Use freshly grated Parmesan for best results",
      "Add pasta water if sauce gets too thick",
      "Serve immediately while hot"
    ]
  },
  "129": {
    id: 129,
    title: "World's Best Lasagna",
    time: 90,
    servings: 8,
    difficulty: "Hard",
    cuisine: "Italian",
    dietary: [],
    summary: "Layered pasta dish with meat sauce, cheese, and bechamel. A true labor of love.",
    description: "This epic lasagna features layers of pasta, rich meat sauce, creamy ricotta, and melted cheese. It's worth the effort for special occasions.",
    source: "AllRecipes",
    url: "#",
    nutrition: { calories: 520, protein: 28, carbs: 42, fat: 28, fiber: 4 },
    ingredients: [
      { item: "Ground beef", amount: "1 lb", notes: "" },
      { item: "Lasagna noodles", amount: "12 sheets", notes: "" },
      { item: "Ricotta cheese", amount: "15 oz", notes: "" },
      { item: "Mozzarella cheese", amount: "2 cups", notes: "shredded" },
      { item: "Tomato sauce", amount: "24 oz jar", notes: "" }
    ],
    instructions: [
      "Preheat oven to 375°F.",
      "Cook lasagna noodles according to package directions.",
      "Brown ground beef and mix with tomato sauce.",
      "Layer noodles, meat sauce, ricotta, and mozzarella.",
      "Repeat layers twice more.",
      "Cover with foil and bake for 45 minutes.",
      "Remove foil and bake 15 more minutes until golden.",
      "Let rest 15 minutes before serving."
    ],
    tips: [
      "Let it rest before cutting for clean slices",
      "Can be assembled ahead and refrigerated",
      "Freezes well for up to 3 months",
      "Cover with foil to prevent over-browning"
    ]
  },
  "76": {
    id: 76,
    title: "Thai Green Curry",
    time: 45,
    servings: 4,
    difficulty: "Medium",
    cuisine: "Thai",
    dietary: ["vegetarian"],
    summary: "Aromatic curry with coconut milk and fresh vegetables.",
    description: "An authentic Thai green curry that's creamy, spicy, and full of fresh vegetables. Perfectly balanced with coconut milk and aromatic spices.",
    source: "Thai Kitchen",
    url: "#",
    nutrition: { calories: 280, protein: 8, carbs: 24, fat: 18, fiber: 6 },
    ingredients: [
      { item: "Green curry paste", amount: "3 tbsp", notes: "" },
      { item: "Coconut milk", amount: "14 oz can", notes: "" },
      { item: "Mixed vegetables", amount: "3 cups", notes: "bell peppers, eggplant, bamboo shoots" },
      { item: "Thai basil", amount: "1/4 cup", notes: "fresh leaves" },
      { item: "Lime juice", amount: "2 tbsp", notes: "" }
    ],
    instructions: [
      "Heat 1/4 cup coconut cream in a large pan.",
      "Add curry paste and fry until fragrant.",
      "Add remaining coconut milk and bring to simmer.",
      "Add vegetables and cook until tender.",
      "Stir in Thai basil and lime juice.",
      "Serve over jasmine rice."
    ],
    tips: [
      "Use thick coconut cream for frying curry paste",
      "Don't overcook vegetables - keep them crisp",
      "Adjust spice level with more or less curry paste",
      "Fresh Thai basil makes a big difference"
    ]
  },
  "88": {
    id: 88,
    title: "Greek Salad Bowl",
    time: 15,
    servings: 2,
    difficulty: "Easy",
    cuisine: "Mediterranean",
    dietary: ["vegetarian"],
    summary: "Fresh Mediterranean salad with feta and olives.",
    description: "A vibrant Greek salad with crisp vegetables, creamy feta, and a tangy olive oil dressing. Light, healthy, and full of Mediterranean flavors.",
    source: "Mediterranean Diet",
    url: "#",
    nutrition: { calories: 220, protein: 8, carbs: 12, fat: 18, fiber: 5 },
    ingredients: [
      { item: "Cucumber", amount: "1 large", notes: "diced" },
      { item: "Cherry tomatoes", amount: "2 cups", notes: "halved" },
      { item: "Feta cheese", amount: "4 oz", notes: "crumbled" },
      { item: "Kalamata olives", amount: "1/2 cup", notes: "pitted" },
      { item: "Red onion", amount: "1/4 cup", notes: "sliced thin" },
      { item: "Olive oil", amount: "3 tbsp", notes: "extra virgin" }
    ],
    instructions: [
      "Combine cucumber, tomatoes, and red onion in a bowl.",
      "Add olives and crumbled feta cheese.",
      "Drizzle with olive oil and lemon juice.",
      "Season with oregano, salt, and pepper.",
      "Toss gently to combine.",
      "Let sit for 10 minutes before serving."
    ],
    tips: [
      "Use the best quality olive oil you can find",
      "Don't overdress the salad",
      "Add herbs like oregano and parsley",
      "Serve at room temperature for best flavor"
    ]
  },
  "102": {
    id: 102,
    title: "Beef Tacos",
    time: 35,
    servings: 4,
    difficulty: "Easy",
    cuisine: "Mexican",
    dietary: [],
    summary: "Seasoned ground beef tacos with fresh toppings.",
    description: "Classic beef tacos with perfectly seasoned ground beef and all your favorite toppings. A family-friendly meal that's quick and delicious.",
    source: "Mexican Cooking",
    url: "#",
    nutrition: { calories: 380, protein: 24, carbs: 28, fat: 20, fiber: 4 },
    ingredients: [
      { item: "Ground beef", amount: "1 lb", notes: "80/20" },
      { item: "Taco seasoning", amount: "1 packet", notes: "or homemade" },
      { item: "Corn tortillas", amount: "8 small", notes: "" },
      { item: "Lettuce", amount: "2 cups", notes: "shredded" },
      { item: "Cheddar cheese", amount: "1 cup", notes: "shredded" },
      { item: "Tomatoes", amount: "2 medium", notes: "diced" }
    ],
    instructions: [
      "Brown ground beef in a large skillet.",
      "Drain fat and add taco seasoning with water.",
      "Simmer until sauce thickens.",
      "Warm tortillas in microwave or pan.",
      "Fill tortillas with meat and toppings.",
      "Serve with salsa and sour cream."
    ],
    tips: [
      "Make your own taco seasoning for better flavor",
      "Warm tortillas for better texture",
      "Set up a taco bar for family dinners",
      "Try different toppings like avocado or cilantro"
    ]
  },
  "156": {
    id: 156,
    title: "Quinoa Buddha Bowl",
    time: 40,
    servings: 2,
    difficulty: "Medium",
    cuisine: "American",
    dietary: ["vegetarian", "vegan"],
    summary: "Nutritious bowl with quinoa, roasted vegetables, and tahini dressing.",
    description: "A colorful, nutrient-packed bowl featuring protein-rich quinoa, roasted vegetables, and a creamy tahini dressing. Perfect for healthy eating.",
    source: "Healthy Eats",
    url: "#",
    nutrition: { calories: 420, protein: 16, carbs: 58, fat: 16, fiber: 12 },
    ingredients: [
      { item: "Quinoa", amount: "1 cup", notes: "uncooked" },
      { item: "Sweet potato", amount: "1 large", notes: "cubed" },
      { item: "Chickpeas", amount: "1 can", notes: "drained and rinsed" },
      { item: "Baby spinach", amount: "2 cups", notes: "" },
      { item: "Tahini", amount: "3 tbsp", notes: "" },
      { item: "Lemon juice", amount: "2 tbsp", notes: "" }
    ],
    instructions: [
      "Cook quinoa according to package directions.",
      "Roast sweet potato cubes at 400°F for 25 minutes.",
      "Toss chickpeas with oil and roast for 20 minutes.",
      "Make dressing by whisking tahini with lemon juice.",
      "Assemble bowls with quinoa, vegetables, and chickpeas.",
      "Drizzle with tahini dressing and serve."
    ],
    tips: [
      "Rinse quinoa before cooking to remove bitterness",
      "Roast vegetables until golden for best flavor",
      "Add water to tahini dressing if too thick",
      "Customize with your favorite vegetables"
    ]
  }
};

export default function RecipePage() {
  const { user, token } = useAuth();
  const params = useParams();
  const recipeId = params.id as string;
  const [reactions, setReactions] = useState({ love: 0, like: 0, vomit: 0 });
  const [userReaction, setUserReaction] = useState<'love' | 'like' | 'vomit' | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoadingReactions, setIsLoadingReactions] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  const recipe = mockRecipeData[recipeId];

  // Load reactions when component mounts
  useEffect(() => {
    if (recipe) {
      loadReactions();
      loadComments();
      if (user) {
        checkIfSaved();
      }
    }
  }, [recipe, user]);

  const loadReactions = async () => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/reactions`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        setReactions(data.reactions);
        setUserReaction(data.userReaction);
      }
    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  };

  const checkIfSaved = async () => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/save`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.isSaved);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleReaction = async (reactionType: 'love' | 'like' | 'vomit') => {
    if (!user) {
      alert('Sign up to react to recipes!');
      window.location.href = '/signup';
      return;
    }

    if (isLoadingReactions) return;

    setIsLoadingReactions(true);
    try {
      const response = await fetch(`/api/recipes/${recipeId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reactionType })
      });

      if (response.ok) {
        const data = await response.json();
        setReactions(data.reactions);
        setUserReaction(data.userReaction);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    } finally {
      setIsLoadingReactions(false);
    }
  };

  const handleRemoveReaction = async () => {
    if (!user || isLoadingReactions) return;

    setIsLoadingReactions(true);
    try {
      const response = await fetch(`/api/recipes/${recipeId}/reactions`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setReactions(data.reactions);
        setUserReaction(null);
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
    } finally {
      setIsLoadingReactions(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!user) {
      alert('Sign up to save recipes!');
      window.location.href = '/signup';
      return;
    }

    try {
      if (isSaved) {
        // Unsave recipe
        const response = await fetch(`/api/recipes/${recipeId}/save`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ listName: 'Want to Make' })
        });

        if (response.ok) {
          setIsSaved(false);
          alert('Recipe removed from Want to Make list!');
        }
      } else {
        // Save recipe
        const response = await fetch(`/api/recipes/${recipeId}/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ listName: 'Want to Make' })
        });

        if (response.ok) {
          setIsSaved(true);
          alert('Recipe saved to Want to Make list!');
        }
      }
    } catch (error) {
      console.error('Error saving/unsaving recipe:', error);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmitComment = async (parentCommentId?: string) => {
    if (!user) {
      alert('Sign up to leave comments!');
      window.location.href = '/signup';
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/recipes/${recipeId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          content: newComment.trim(),
          parentCommentId: parentCommentId || replyTo
        })
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
        setNewComment('');
        setReplyTo(null);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  // If recipe not found, show error
  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Recipe Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find the recipe you're looking for.</p>
          <Link href="/recipes" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">
            Browse All Recipes
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.summary,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Recipe URL copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Recipe Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <Link href="/recipes" className="text-red-600 hover:text-red-700 text-sm font-medium">
                  ← Back to Recipes
                </Link>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{recipe.summary}</p>
              <p className="text-gray-700 leading-relaxed">{recipe.description}</p>
            </div>
          </div>

          {/* Recipe Meta Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 p-6 bg-gray-50 rounded-lg">
            <div className="text-center">
              <ClockIcon className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Total Time</div>
              <div className="text-lg font-semibold text-gray-900">{recipe.time} min</div>
            </div>
            <div className="text-center">
              <UsersIcon className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Servings</div>
              <div className="text-lg font-semibold text-gray-900">{recipe.servings}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Difficulty</div>
              <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {recipe.difficulty}
              </span>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Cuisine</div>
              <div className="text-lg font-semibold text-gray-900">{recipe.cuisine}</div>
            </div>
          </div>

          {/* Dietary Tags & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {recipe.dietary.length > 0 && (
                <div className="flex space-x-2">
                  {recipe.dietary.map((diet: string, index: number) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded">
                      {diet}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-6">
              {/* Reaction Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => userReaction === 'love' ? handleRemoveReaction() : handleReaction('love')}
                  disabled={isLoadingReactions}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    userReaction === 'love' 
                      ? 'bg-red-100 text-red-700 border-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                  } ${isLoadingReactions ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-lg">❤️</span>
                  <span className="font-medium">{reactions.love}</span>
                </button>
                <button
                  onClick={() => userReaction === 'like' ? handleRemoveReaction() : handleReaction('like')}
                  disabled={isLoadingReactions}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    userReaction === 'like' 
                      ? 'bg-blue-100 text-blue-700 border-blue-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  } ${isLoadingReactions ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-lg">👍</span>
                  <span className="font-medium">{reactions.like}</span>
                </button>
                <button
                  onClick={() => userReaction === 'vomit' ? handleRemoveReaction() : handleReaction('vomit')}
                  disabled={isLoadingReactions}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    userReaction === 'vomit' 
                      ? 'bg-yellow-100 text-yellow-700 border-yellow-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600'
                  } ${isLoadingReactions ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-lg">🤮</span>
                  <span className="font-medium">{reactions.vomit}</span>
                </button>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveRecipe}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  isSaved 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
                }`}
              >
                <BookmarkIcon className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">
                  {isSaved ? 'Saved' : 'Save'}
                </span>
              </button>

              {/* Share & Print */}
              <div className="flex space-x-2">
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  <ShareIcon className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">
                  <PrinterIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Ingredients</h2>
                <button 
                  onClick={() => {
                    if (!user) {
                      alert('Sign up to add ingredients to your shopping list!');
                      window.location.href = '/signup';
                    } else {
                      alert('Ingredients added to your shopping list!');
                    }
                  }}
                  className={`flex items-center text-sm ${
                    user ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'
                  }`}
                >
                  <ShoppingCartIcon className="h-4 w-4 mr-1" />
                  {user ? 'Add to List' : 'Sign up to Add'}
                </button>
              </div>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient: any, index: number) => (
                  <li key={index} className="flex items-start">
                    <input 
                      type="checkbox" 
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <span className="font-medium text-gray-900">{ingredient.amount}</span>
                      <span className="text-gray-700"> {ingredient.item}</span>
                      {ingredient.notes && (
                        <div className="text-sm text-gray-500 italic">({ingredient.notes})</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nutrition Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrition per serving</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Calories</span>
                  <span className="font-medium">{recipe.nutrition.calories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Protein</span>
                  <span className="font-medium">{recipe.nutrition.protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Carbs</span>
                  <span className="font-medium">{recipe.nutrition.carbs}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fat</span>
                  <span className="font-medium">{recipe.nutrition.fat}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fiber</span>
                  <span className="font-medium">{recipe.nutrition.fiber}g</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Instructions</h2>
                <button
                  onClick={async () => {
                    if (!user) {
                      alert('Sign up to add recipes to your meal plan!');
                      window.location.href = '/signup';
                    } else {
                      try {
                        const response = await fetch('/api/meal-plan/add-recipe', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                          },
                          body: JSON.stringify({ recipeId: recipe.id })
                        });

                        if (response.ok) {
                          const data = await response.json();
                          if (data.success) {
                            alert(data.message + ' Changes are automatically saved.');
                          }
                        } else {
                          const errorData = await response.json();
                          alert(errorData.error || 'Error adding recipe to meal plan.');
                        }
                      } catch (error) {
                        console.error('Error adding recipe to meal plan:', error);
                        alert('Error adding recipe to meal plan. Please try again.');
                      }
                    }
                  }}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm ${
                    user 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  <CalendarPlusIcon className="h-4 w-4 mr-2" />
                  {user ? 'Add to Meal Plan' : 'Sign up to Plan'}
                </button>
              </div>
              <ol className="space-y-6">
                {recipe.instructions.map((step: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="ml-4 text-gray-700 leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>

              {/* Cooking Tips */}
              <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">💡 Chef's Tips</h3>
                <ul className="space-y-1 text-sm text-yellow-800">
                  {recipe.tips.map((tip: string, index: number) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>

              {/* Source */}
              <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-500">Recipe from {recipe.source}</span>
                {recipe.url !== "#" && (
                  <a
                    href={recipe.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-red-600 hover:text-red-700 text-sm"
                  >
                    <ExternalLinkIcon className="h-4 w-4 mr-1" />
                    Original Recipe
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            Comments ({comments.length})
          </h3>

          {/* Add Comment Form */}
          <div className="mb-8">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                {user ? (
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={user ? "Share your thoughts about this recipe..." : "Sign up to leave a comment"}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  rows={3}
                  maxLength={1000}
                  disabled={!user}
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {newComment.length}/1000 characters
                  </span>
                  <div className="flex space-x-2">
                    {replyTo && (
                      <button
                        onClick={() => {
                          setReplyTo(null);
                          setNewComment('');
                        }}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                      >
                        Cancel Reply
                      </button>
                    )}
                    <button
                      onClick={() => handleSubmitComment()}
                      disabled={!user || !newComment.trim() || isSubmittingComment}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isSubmittingComment ? 'Posting...' : replyTo ? 'Reply' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {comment.user_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {comment.user_name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                    {comment.image_url && (
                      <img
                        src={comment.image_url}
                        alt="Comment image"
                        className="mt-3 rounded-lg max-w-sm"
                      />
                    )}
                  </div>

                  <div className="mt-2 flex items-center space-x-4">
                    <button
                      onClick={() => {
                        if (!user) {
                          alert('Sign up to reply to comments!');
                          window.location.href = '/signup';
                          return;
                        }
                        setReplyTo(comment.id);
                        setNewComment(`@${comment.user_name} `);
                      }}
                      className="text-sm text-gray-500 hover:text-red-600"
                    >
                      Reply
                    </button>
                  </div>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 ml-4 space-y-4">
                      {comment.replies.map((reply: any) => (
                        <div key={reply.id} className="flex space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {reply.user_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="bg-blue-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-gray-900 text-sm">
                                  {reply.user_name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatTimeAgo(reply.created_at)}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm">{reply.content}</p>
                              {reply.image_url && (
                                <img
                                  src={reply.image_url}
                                  alt="Reply image"
                                  className="mt-2 rounded-lg max-w-xs"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {comments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}