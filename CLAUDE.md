# Pepper's Pantry - Social Cooking Platform

## Collaboration Workflow
**IMPORTANT**: Before implementing any feature requests:
1. Create a detailed TodoWrite list of all planned changes
2. Present the implementation plan to the user for approval
3. Wait for user confirmation before starting work
4. This prevents over-engineering and ensures alignment with user expectations

## Project Overview
Next.js 15 social cooking platform with meal planning, recipe management, and social features. Successfully migrated from SQLite to Neon PostgreSQL for production reliability.

## Database
- **Provider**: Neon PostgreSQL
- **Connection**: `DATABASE_URL` environment variable
- **Schema**: Auto-initialized on first connection via `src/lib/db.ts`
- **Key Tables**: users, user_preferences, recipe_reactions, recipe_comments, user_follows, saved_recipes, activity_feed, meal_plans, shopping_lists

## Development Commands
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks (if available)
```

## Testing & Debugging Strategy
**IMPORTANT**: When fixing issues or implementing features:
1. Make the code changes first
2. Deploy to local development server (`npm run dev`)
3. Let the user test the changes directly in browser
4. If debugging is needed, add console.log statements to relevant files
5. **DO NOT** spend time creating test scripts, authorization tokens, or API testing via curl
6. User will verify functionality and provide feedback for next steps

## Development Server Troubleshooting
If `npm run dev` doesn't start properly or ports are occupied:

1. **Check for existing processes:**
   ```bash
   ps aux | grep node        # Find existing Node processes
   lsof -i :3000            # Check what's using port 3000
   ```

2. **Kill stuck processes:**
   ```bash
   kill [PID]               # Replace [PID] with process ID
   # Or kill all Next.js processes:
   pkill -f "next dev"
   ```

3. **Start fresh:**
   ```bash
   npm run dev              # Should now start on port 3000
   ```

4. **Verify server is responding:**
   ```bash
   curl -I http://localhost:3000    # Should return HTTP headers
   ```

## Deployment
- **Platform**: Vercel
- **Command**: `vercel --prod`
- **Environment**: Production environment variables set via `vercel env add`
- **URL**: https://frontend-bh307ea91-mbunalskis-projects.vercel.app

## Key Architecture

### Database Layer (`src/lib/db.ts`)
- PostgreSQL connection pooling
- Auto schema initialization
- All database operations as async functions
- Key functions: createUser, getUserById, saveUserPreferences, addOrUpdateReaction

### Authentication (`src/lib/auth.ts`)
- JWT-based authentication
- bcrypt password hashing
- User context via AuthContext

### API Routes
- `/api/auth/login` - User authentication
- `/api/auth/signup` - User registration (email temporarily disabled)
- `/api/user/[id]` - User profile data
- `/api/preferences` - User dietary preferences

## Known Issues & Fixes Applied

### ✅ Fixed: Database Persistence
- **Issue**: SQLite files in `/tmp` getting wiped in serverless environment
- **Solution**: Migrated to Neon PostgreSQL
- **Status**: Complete

### ✅ Fixed: Signup Constraint Error
- **Issue**: Duplicate phone constraint violation for web users
- **Solution**: Generate unique phone identifiers using timestamp + random string
- **Location**: `src/lib/db.ts:209`

### ✅ Fixed: User Profile API
- **Issue**: API using SQLite syntax instead of PostgreSQL
- **Solution**: Converted to async PostgreSQL functions
- **Location**: `src/app/api/user/[id]/route.ts`

### 🔄 Temporarily Disabled: Email Functionality
- **Status**: Commented out in signup route for debugging
- **Location**: `src/app/api/auth/signup/route.ts:40-54`
- **Next**: Re-enable when core features stable

## Testing
- **Local**: Use existing users (e.g., user ID 65: "Local Test User 2")
- **Production**: Use bypass token for testing protected routes
- **Auth Flow**: signup → login → preferences → user profile ✅ Working

## Social Features (Implemented)
- User reactions (love, like, vomit)
- Recipe comments with replies
- User following/followers
- Activity feed
- Recipe saving ("Want to Make" lists)
- Meal planning and shopping lists

## Next Steps
1. Re-enable email functionality (AWS SES with peppers-pantry.com domain)
2. Fix global feed display issues
3. Test and fix reaction/like functionality on production
4. Implement dark mode toggle
5. Fix text visibility issues (light gray on white background)

## Environment Variables
```bash
DATABASE_URL=postgresql://neondb_owner:npg_67DItWScqmfz@ep-crimson-lab-aesmpdt3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your-jwt-secret
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
```

## Complete Function Documentation

### Database Functions (`src/lib/db.ts`)

#### Core Database Operations
- **getDb()** → Promise<Pool> - Creates PostgreSQL connection pool, ensures schema initialization
- **initializeSchema()** → Promise<void> - Creates all tables, indexes, constraints

#### User Management
- **createUser(email, name, passwordHash)** → Promise<User> - Creates new user account
- **getUserByEmail(email)** → Promise<UserWithPassword | null> - Retrieves user for authentication
- **getUserById(id)** → Promise<User | null> - Gets user profile data
- **saveUserPreferences(userId, preferences)** → Promise<void> - Saves dietary preferences
- **getUserPreferences(userId)** → Promise<UserPreferences | null> - Gets dietary preferences

#### Social Features
- **addOrUpdateReaction(userId, recipeId, reactionType)** → Promise<void> - Adds/updates recipe reaction
- **getRecipeReactions(recipeId)** → Promise<{love, like, vomit}> - Gets reaction counts
- **getUserReactionForRecipe(userId, recipeId)** → Promise<reaction | null> - Gets user's specific reaction
- **removeReaction(userId, recipeId)** → Promise<void> - Removes user's reaction
- **addComment(userId, recipeId, content, imageUrl?, parentId?)** → Promise<string> - Adds recipe comment
- **getRecipeComments(recipeId)** → Promise<Comment[]> - Gets all comments for recipe
- **followUser(followerId, followingId)** → Promise<void> - Creates follow relationship
- **unfollowUser(followerId, followingId)** → Promise<void> - Removes follow relationship
- **isUserFollowing(followerId, followingId)** → Promise<boolean> - Checks follow status
- **getFollowers(userId)** → Promise<User[]> - Gets user's followers
- **getFollowing(userId)** → Promise<User[]> - Gets users being followed

#### Activity & Content
- **addActivityFeedItem(userId, type, recipeId, targetId?, metadata?)** → Promise<void> - Records activity
- **getActivityFeed(userId?, limit, offset)** → Promise<Activity[]> - Gets activity feed
- **saveRecipe(userId, recipeId, listName?)** → Promise<void> - Saves recipe to list
- **unsaveRecipe(userId, recipeId, listName?)** → Promise<void> - Removes from saved list
- **isRecipeSaved(userId, recipeId, listName?)** → Promise<boolean> - Checks if recipe saved
- **getUserSavedRecipes(userId, listName?)** → Promise<Recipe[]> - Gets saved recipes
- **getUserLovedRecipes(userId)** → Promise<Recipe[]> - Gets loved recipes

#### Meal Planning
- **createMealPlan(userId, name?)** → Promise<string> - Creates meal plan
- **getUserMealPlan(userId)** → Promise<MealPlan | null> - Gets user's meal plan
- **addRecipeToMealPlan(planId, recipeId, title, day, mealType?)** → Promise<void> - Adds recipe to plan
- **clearMealPlan(planId)** → Promise<void> - Clears all meal plan items
- **removeMealPlanItem(itemId)** → Promise<void> - Removes specific meal plan item

#### Shopping Lists
- **getUserShoppingList(userId, mealPlanId?)** → Promise<ShoppingList | null> - Gets shopping list
- **createShoppingList(userId, items, mealPlanId?, name?)** → Promise<string> - Creates shopping list

#### Notifications
- **createNotification(userId, fromUserId, type, recipeId?, commentId?, message?)** → Promise<void> - Creates notification

### Authentication Functions (`src/lib/auth.ts`)

- **hashPassword(password)** → Promise<string> - Bcrypt password hashing
- **verifyPassword(password, hash)** → Promise<boolean> - Verifies password against hash
- **createToken(user)** → string - Creates JWT token (7-day expiry)
- **verifyToken(token)** → User | null - Verifies and decodes JWT
- **getUserFromRequest(req)** → User | null - Extracts user from Authorization header

### Email Functions (`src/lib/email.ts`)

- **sendEmail({to, subject, htmlContent, textContent?})** → Promise<boolean> - Sends email via AWS SES
- **getWelcomeEmailTemplate(userName)** → {subject, html, text} - Welcome email template
- **getPasswordResetEmailTemplate(userName, resetToken)** → {subject, html, text} - Reset email template

### React Context Functions

#### AuthContext (`src/contexts/AuthContext.tsx`)
- **AuthProvider({children})** - Provides auth state to entire app
- **login(email, password)** → Promise<{success, error?}> - Authenticates user
- **signup(name, email, password)** → Promise<{success, error?}> - Creates account
- **logout()** → void - Clears auth state and redirects
- **useAuth()** → AuthContextType - Hook to access auth context

#### ThemeContext (`src/contexts/ThemeContext.tsx`)
- **ThemeProvider({children})** - Provides theme state management
- **useTheme()** → ThemeContextType - Hook to access theme context

### API Routes

#### Authentication APIs
- **POST /api/auth/login** - User authentication
- **POST /api/auth/signup** - User registration  
- **POST /api/auth/forgot-password** - Initiates password reset
- **POST /api/auth/reset-password** - Completes password reset

#### User Management APIs
- **GET /api/user/preferences** - Gets user preferences
- **POST /api/user/preferences** - Saves user preferences
- **GET /api/user/dashboard** - Gets complete dashboard data
- **GET /api/user/saved-recipes** - Gets user's saved recipes
- **GET /api/user/loved-recipes** - Gets user's loved recipes
- **GET /api/user/[id]** - Gets user profile data
- **POST /api/user/[id]/follow** - Follows user
- **DELETE /api/user/[id]/follow** - Unfollows user
- **GET /api/user/[id]/follow** - Checks follow status

#### Recipe Interaction APIs
- **POST /api/recipes/[id]/reactions** - Adds/updates reaction
- **DELETE /api/recipes/[id]/reactions** - Removes reaction
- **GET /api/recipes/[id]/reactions** - Gets reaction data
- **POST /api/recipes/[id]/comments** - Adds comment
- **GET /api/recipes/[id]/comments** - Gets comments
- **POST /api/recipes/[id]/save** - Saves recipe
- **DELETE /api/recipes/[id]/save** - Unsaves recipe
- **GET /api/recipes/[id]/save** - Checks if saved

#### Meal Planning APIs
- **GET /api/meal-plan** - Gets user's meal plan
- **POST /api/meal-plan** - Generates/updates meal plan
- **POST /api/meal-plan/add-recipe** - Adds recipe to plan
- **POST /api/meal-plan/remove-item** - Removes item from plan

#### Shopping List APIs
- **GET /api/shopping-list** - Gets user's shopping list
- **POST /api/shopping-list** - Generates shopping list

#### Social Feed APIs
- **GET /api/feed** - Gets social activity feed

### React Components

#### Core Components
- **Header()** - Navigation header with auth/theme controls
- **SocialFeed({feedType?})** - Social recipe activity feed with interactions

#### Page Components
- **Home()** - Home page (marketing for guests, feed for users)
- **Dashboard()** - User's personal dashboard
- **Login()** - Login form page
- **Signup()** - Registration form page
- **Preferences()** - User preferences form
- **UserProfile({params})** - User profile page
- **MealPlan()** - Meal planning interface
- **ShoppingList()** - Shopping list management
- **RecipeDetail({params})** - Individual recipe page

### TypeScript Interfaces

#### Core Data Types
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

interface UserWithPassword extends User {
  password_hash: string;
}

interface UserPreferences {
  user_id: string;
  dietary_restrictions: string[];
  budget_per_meal: number;
  max_cooking_time: number;
  complexity: string;
  allergens: string[];
  favorite_cuisines: string[];
}

interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{success: boolean; error?: string}>;
  signup: (name: string, email: string, password: string) => Promise<{success: boolean; error?: string}>;
  logout: () => void;
  isLoading: boolean;
}
```

### Function Dependency Map

#### Critical Dependencies (changing these affects multiple places):

**Database Core:**
- `getDb()` → Used by ALL database functions
- `getUserFromRequest()` → Used by ALL protected API routes

**Authentication Flow:**
- `createToken()` ← `login API`, `signup API`
- `verifyToken()` ← `getUserFromRequest()` ← All protected APIs
- `getUserByEmail()` ← `login API`, `forgot-password API`

**Social Features Chain:**
- `addOrUpdateReaction()` → triggers `addActivityFeedItem()`
- `addComment()` → triggers `addActivityFeedItem()`
- `getActivityFeed()` ← `feed API` ← `SocialFeed component`

**User Profile Dependencies:**
- `getUserById()`, `getFollowers()`, `getFollowing()` ← `user profile API`
- `getUserSavedRecipes()`, `getUserLovedRecipes()` ← `dashboard API`, `profile API`

**Cross-Component Impact:**
- Changing `User` interface affects: `auth.ts`, `AuthContext`, all user-related APIs
- Changing database schema affects: `initializeSchema()`, all related functions
- Changing API response formats affects: frontend components, all callers

#### High-Impact Functions (changes ripple through many files):
1. **Database schema functions** - affect all related operations
2. **Authentication functions** - affect all protected routes and components
3. **Core user functions** - affect profile, dashboard, social features
4. **Activity feed functions** - affect social interactions across the app

#### When changing functions, check these dependents:
- **Database functions** → Check all API routes that import them
- **API routes** → Check all React components that call them
- **Auth functions** → Check all protected routes and AuthContext
- **React context** → Check all components that use the hooks
- **TypeScript interfaces** → Check all files that import/use them

## File Structure Notes
- `src/lib/db.ts` - Core database layer with all PostgreSQL operations (87 functions)
- `src/lib/auth.ts` - Authentication utilities (5 core functions)
- `src/lib/email.ts` - Email sending and templates (3 functions)
- `src/contexts/AuthContext.tsx` - React auth context (4 methods)
- `src/contexts/ThemeContext.tsx` - Theme management context
- `src/app/api/` - Next.js API routes (18 route files)
- `src/components/` - Reusable React components (Header, SocialFeed)
- `src/app/` - Page components (13 page files)
- `tests/` - Comprehensive test suite with database, API, and frontend tests

## Testing & Regression Testing

### Test Setup
- **Framework**: Jest with React Testing Library
- **Database Testing**: Separate test database with cleanup utilities
- **API Testing**: Supertest for endpoint testing
- **Coverage**: Comprehensive coverage reporting

### Test Commands
```bash
npm test                 # Run all tests
npm run test:watch       # Development mode with file watching
npm run test:coverage    # Generate coverage report
npm run test:database    # Database & API tests only
npm run test:frontend    # React component tests only
npm run test:ci          # CI-friendly (no watch, with coverage)
```

### Test Structure
```
tests/
├── database/            # Database function tests (auth, social, meal-plan)
├── api/                # API route endpoint tests
├── frontend/           # React component tests
└── utils/              # Test utilities and helpers
```

### Critical Test Coverage
- **Authentication Flow**: Signup, login, password validation, JWT tokens
- **Social Features**: Reactions, comments, follows, activity feed
- **Database Operations**: All 87 database functions with edge cases
- **API Routes**: All 18 API endpoints with error handling
- **React Components**: User interactions and state management

### Regression Testing Strategy
1. **Pre-deployment**: Run `npm run test:ci` before any deployment
2. **Feature changes**: Test affected areas with `npm test [pattern]`
3. **Database changes**: Run `npm run test:database` to verify schema compatibility
4. **UI changes**: Run `npm run test:frontend` to verify component behavior

### Test Database Setup
```bash
# Set test database URL (separate from development)
export TEST_DATABASE_URL="postgresql://test:test@localhost:5432/pepper_pantry_test"
```

### Mock Data Fallback
When test database unavailable, tests use comprehensive mock data covering:
- Users, recipes, reactions, comments, follows, meal plans, shopping lists