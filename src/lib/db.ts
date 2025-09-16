import { Pool } from 'pg';
import { User, UserWithPassword } from './auth';

// Create connection pool
let pool: Pool | null = null;
let schemaInitialized = false;

export async function getDb(): Promise<Pool> {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    console.log('PostgreSQL connection pool created');
  }
  
  // Ensure schema is initialized before returning
  if (!schemaInitialized) {
    await initializeSchema();
    schemaInitialized = true;
  }
  
  return pool;
}

async function initializeSchema(): Promise<void> {
  if (!pool) {
    console.error('Cannot initialize schema: no database pool available');
    return;
  }
  
  try {
    console.log('Initializing database schema...');
    
    // Enable UUID extension
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    
    // Add missing columns to existing users table for web authentication
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS name TEXT,
      ADD COLUMN IF NOT EXISTS password_hash TEXT
    `);
    
    // Create user preferences table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        dietary_restrictions JSONB DEFAULT '[]',
        budget_per_meal DECIMAL DEFAULT 15.0,
        max_cooking_time INTEGER DEFAULT 30,
        complexity TEXT DEFAULT 'medium',
        allergens JSONB DEFAULT '[]',
        favorite_cuisines JSONB DEFAULT '[]',
        meals_per_week INTEGER DEFAULT 7,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add meals_per_week column if it doesn't exist (migration)
    await pool.query(`
      ALTER TABLE user_preferences
      ADD COLUMN IF NOT EXISTS meals_per_week INTEGER DEFAULT 7
    `);
    
    // Create meal plans table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meal_plans (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT DEFAULT 'My Meal Plan',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create meal plan items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meal_plan_items (
        id BIGSERIAL PRIMARY KEY,
        meal_plan_id BIGINT NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
        recipe_id INTEGER NOT NULL,
        recipe_title TEXT NOT NULL,
        day_of_week TEXT NOT NULL,
        meal_type TEXT DEFAULT 'dinner',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create shopping lists table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shopping_lists (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        meal_plan_id BIGINT REFERENCES meal_plans(id) ON DELETE SET NULL,
        name TEXT DEFAULT 'Shopping List',
        items JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create recipe reactions table (love, like, vomit)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recipe_reactions (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipe_id INTEGER NOT NULL,
        reaction_type TEXT NOT NULL CHECK (reaction_type IN ('love', 'like', 'vomit')),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, recipe_id)
      )
    `);

    // Create recipe comments table with single-level replies
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recipe_comments (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipe_id INTEGER NOT NULL,
        parent_comment_id BIGINT REFERENCES recipe_comments(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        image_url TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user follows table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_follows (
        id BIGSERIAL PRIMARY KEY,
        follower_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        following_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_id, following_id)
      )
    `);

    // Create saved recipes table (Want to Make lists)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS saved_recipes (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipe_id INTEGER NOT NULL,
        list_name TEXT DEFAULT 'Want to Make',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, recipe_id, list_name)
      )
    `);

    // Create activity feed table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_feed (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        activity_type TEXT NOT NULL CHECK (activity_type IN ('reaction', 'comment', 'recipe_added')),
        recipe_id INTEGER NOT NULL,
        target_id BIGINT,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        from_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK (type IN ('reaction', 'comment', 'follow')),
        recipe_id INTEGER,
        comment_id BIGINT REFERENCES recipe_comments(id) ON DELETE SET NULL,
        message TEXT NOT NULL,
        read_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create password reset tokens table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await pool.query('CREATE INDEX IF NOT EXISTS idx_recipe_reactions_recipe_id ON recipe_reactions(recipe_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_recipe_comments_recipe_id ON recipe_comments(recipe_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON activity_feed(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_activity_feed_recipe_id ON activity_feed(recipe_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id)');
    
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Database schema initialization error:', error);
    throw error;
  }
}

// User operations
export async function createUser(email: string, name: string, passwordHash: string): Promise<User> {
  const db = await getDb();
  
  console.log('Creating user in database:', { email, name });
  
  try {
    // Generate a unique phone identifier for web users
    const webUserPhone = `web-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await db.query(`
      INSERT INTO users (email, name, password_hash, phone, tz, meals_per_week)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, name, created_at
    `, [email, name, passwordHash, webUserPhone, 'America/New_York', 4]);
    
    const user = result.rows[0];
    console.log('User created successfully:', { id: user.id, email: user.email, name: user.name });
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string): Promise<UserWithPassword | null> {
  const db = await getDb();
  
  console.log('Looking up user by email:', email);
  
  try {
    const result = await db.query(`
      SELECT * FROM users WHERE email = $1
    `, [email]);
    
    if (result.rows.length === 0) {
      console.log('User not found');
      return null;
    }
    
    const user = result.rows[0];
    console.log('User found:', { id: user.id, email: user.email, name: user.name, hasPassword: !!user.password_hash });
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password_hash: user.password_hash,
      created_at: user.created_at
    };
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

export async function getUserById(id: string | number): Promise<User | null> {
  const db = await getDb();
  
  try {
    const result = await db.query(`
      SELECT id, email, name, created_at FROM users WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at
    };
  } catch (error) {
    console.error('Error getting user by id:', error);
    throw error;
  }
}

// User preferences operations
export interface UserPreferences {
  user_id: string;
  dietary_restrictions: string[];
  budget_per_meal: number;
  max_cooking_time: number;
  complexity: string;
  allergens: string[];
  favorite_cuisines: string[];
  meals_per_week: number;
}

export async function saveUserPreferences(userId: string | number, preferences: Partial<UserPreferences>): Promise<void> {
  const db = await getDb();
  
  console.log('Saving preferences for user:', userId, preferences);
  
  try {
    await pool.query(`
      INSERT INTO user_preferences 
      (user_id, dietary_restrictions, budget_per_meal, max_cooking_time, complexity, allergens, favorite_cuisines, meals_per_week, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        dietary_restrictions = $2,
        budget_per_meal = $3,
        max_cooking_time = $4,
        complexity = $5,
        allergens = $6,
        favorite_cuisines = $7,
        meals_per_week = $8,
        updated_at = CURRENT_TIMESTAMP
    `, [
      userId,
      JSON.stringify(preferences.dietary_restrictions || []),
      preferences.budget_per_meal || 15.0,
      preferences.max_cooking_time || 30,
      preferences.complexity || 'medium',
      JSON.stringify(preferences.allergens || []),
      JSON.stringify(preferences.favorite_cuisines || []),
      preferences.meals_per_week || 7
    ]);
    
    console.log('Preferences saved successfully');
  } catch (error) {
    console.error('Error saving preferences:', error);
    throw error;
  }
}

export async function getUserPreferences(userId: string | number): Promise<UserPreferences | null> {
  const db = await getDb();
  
  try {
    const result = await db.query(`
      SELECT * FROM user_preferences WHERE user_id = $1
    `, [userId]);
    
    if (result.rows.length === 0) return null;
    
    const prefs = result.rows[0];
    return {
      user_id: prefs.user_id,
      dietary_restrictions: prefs.dietary_restrictions,
      budget_per_meal: prefs.budget_per_meal,
      max_cooking_time: prefs.max_cooking_time,
      complexity: prefs.complexity,
      allergens: prefs.allergens,
      favorite_cuisines: prefs.favorite_cuisines,
      meals_per_week: prefs.meals_per_week || 7
    };
  } catch (error) {
    console.error('Error getting preferences:', error);
    throw error;
  }
}

// Social feature operations
export async function addOrUpdateReaction(userId: string, recipeId: number, reactionType: 'love' | 'like' | 'vomit'): Promise<void> {
  const db = await getDb();
  
  try {
    // Upsert reaction
    await pool.query(`
      INSERT INTO recipe_reactions (user_id, recipe_id, reaction_type)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, recipe_id) DO UPDATE SET
        reaction_type = $3,
        created_at = CURRENT_TIMESTAMP
    `, [userId, recipeId, reactionType]);
    
    // Add activity feed entry (allow duplicates since reactions can change)
    await pool.query(`
      INSERT INTO activity_feed (user_id, activity_type, recipe_id, metadata)
      VALUES ($1, 'reaction', $2, $3)
    `, [userId, recipeId, JSON.stringify({ reaction_type: reactionType })]);
    
    console.log('Reaction updated successfully');
  } catch (error) {
    console.error('Error updating reaction:', error);
    throw error;
  }
}

export async function getRecipeReactions(recipeId: number): Promise<{ love: number; like: number; vomit: number }> {
  const db = await getDb();
  
  try {
    const result = await db.query(`
      SELECT reaction_type, COUNT(*) as count
      FROM recipe_reactions 
      WHERE recipe_id = $1
      GROUP BY reaction_type
    `, [recipeId]);
    
    const reactions = { love: 0, like: 0, vomit: 0 };
    result.rows.forEach(row => {
      reactions[row.reaction_type as keyof typeof reactions] = parseInt(row.count);
    });
    
    return reactions;
  } catch (error) {
    console.error('Error getting recipe reactions:', error);
    throw error;
  }
}

export async function getUserReactionForRecipe(userId: string, recipeId: number): Promise<'love' | 'like' | 'vomit' | null> {
  const db = await getDb();
  
  try {
    const result = await db.query(`
      SELECT reaction_type FROM recipe_reactions 
      WHERE user_id = $1 AND recipe_id = $2
    `, [userId, recipeId]);
    
    return result.rows.length > 0 ? result.rows[0].reaction_type : null;
  } catch (error) {
    console.error('Error getting user reaction:', error);
    throw error;
  }
}

export async function getRecentReactionsForRecipe(recipeId: number, limit: number = 5): Promise<any[]> {
  const db = await getDb();
  
  try {
    const result = await db.query(`
      SELECT 
        rr.reaction_type,
        rr.created_at,
        u.name
      FROM recipe_reactions rr
      JOIN users u ON rr.user_id = u.id
      WHERE rr.recipe_id = $1
      ORDER BY rr.created_at DESC
      LIMIT $2
    `, [recipeId, limit]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting recent reactions:', error);
    throw error;
  }
}

// Comment operations
export async function addComment(userId: string, recipeId: number, content: string, imageUrl?: string, parentCommentId?: string): Promise<string> {
  const db = await getDb();
  
  try {
    const result = await db.query(`
      INSERT INTO recipe_comments (user_id, recipe_id, parent_comment_id, content, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [userId, recipeId, parentCommentId || null, content, imageUrl || null]);
    
    const commentId = result.rows[0].id;
    
    // Add to activity feed
    await addActivityFeedItem(userId, 'comment', recipeId, commentId);
    
    return commentId;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

export async function getRecipeComments(recipeId: number): Promise<any[]> {
  const db = await getDb();
  
  try {
    const result = await db.query(`
      SELECT c.*, u.name as user_name
      FROM recipe_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.recipe_id = $1 AND c.parent_comment_id IS NULL
      ORDER BY c.created_at DESC
    `, [recipeId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
}

// Activity feed operations
export async function addActivityFeedItem(userId: string, activityType: 'reaction' | 'comment' | 'recipe_added', recipeId: number, targetId?: string, metadata?: string): Promise<void> {
  const db = await getDb();
  
  try {
    // Always insert new activity - duplicates are allowed since activities can change over time
    await pool.query(`
      INSERT INTO activity_feed (user_id, activity_type, recipe_id, target_id, metadata)
      VALUES ($1, $2, $3, $4, $5)
    `, [userId, activityType, recipeId, targetId || null, metadata || null]);
  } catch (error) {
    console.error('Error adding activity feed item:', error);
    throw error;
  }
}

// Export the db connection for use in other files
export { getDb };

// Meal plan operations
export async function createMealPlan(userId: string | number, name: string = 'My Meal Plan'): Promise<string> {
  const db = await getDb();
  
  try {
    const result = await db.query(`
      INSERT INTO meal_plans (user_id, name)
      VALUES ($1, $2)
      RETURNING id
    `, [userId, name]);
    
    return result.rows[0].id.toString();
  } catch (error) {
    console.error('Error creating meal plan:', error);
    throw error;
  }
}

export async function getUserMealPlan(userId: string | number): Promise<any | null> {
  const db = await getDb();
  
  try {
    const result = await db.query(`
      SELECT mp.*, mpi.id as item_id, mpi.recipe_id, mpi.recipe_title, mpi.day_of_week, mpi.meal_type
      FROM meal_plans mp
      LEFT JOIN meal_plan_items mpi ON mp.id = mpi.meal_plan_id
      WHERE mp.user_id = $1 AND mp.id = (
        SELECT id FROM meal_plans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1
      )
      ORDER BY mpi.created_at
    `, [userId]);
    
    if (result.rows.length === 0) return null;
    
    const mealPlan = {
      id: result.rows[0].id.toString(),
      name: result.rows[0].name,
      created_at: result.rows[0].created_at,
      items: result.rows.filter(row => row.item_id).map(row => ({
        id: row.item_id.toString(),
        recipe_id: row.recipe_id,
        recipe_title: row.recipe_title,
        day_of_week: row.day_of_week,
        meal_type: row.meal_type
      }))
    };
    
    return mealPlan;
  } catch (error) {
    console.error('Error getting meal plan:', error);
    throw error;
  }
}

export async function addRecipeToMealPlan(mealPlanId: string | number, recipeId: number, recipeTitle: string, dayOfWeek: string, mealType: string = 'dinner'): Promise<void> {
  const db = await getDb();
  
  try {
    await db.query(`
      INSERT INTO meal_plan_items (meal_plan_id, recipe_id, recipe_title, day_of_week, meal_type)
      VALUES ($1, $2, $3, $4, $5)
    `, [mealPlanId, recipeId, recipeTitle, dayOfWeek, mealType]);
  } catch (error) {
    console.error('Error adding recipe to meal plan:', error);
    throw error;
  }
}

export async function clearMealPlan(mealPlanId: string | number): Promise<void> {
  const db = await getDb();
  
  try {
    await db.query(`
      DELETE FROM meal_plan_items WHERE meal_plan_id = $1
    `, [mealPlanId]);
  } catch (error) {
    console.error('Error clearing meal plan:', error);
    throw error;
  }
}

export async function updateMealPlanItemDay(itemId: string | number, newDay: string): Promise<void> {
  const db = await getDb();
  
  try {
    await db.query(`
      UPDATE meal_plan_items
      SET day_of_week = $1
      WHERE id = $2
    `, [newDay, itemId]);
  } catch (error) {
    console.error('Error updating meal plan item day:', error);
    throw error;
  }
}

export async function getMealPlanItemsByDay(mealPlanId: string | number, day: string): Promise<any[]> {
  const db = await getDb();
  
  try {
    const result = await db.query(`
      SELECT * FROM meal_plan_items
      WHERE meal_plan_id = $1 AND day_of_week = $2
      ORDER BY created_at
    `, [mealPlanId, day]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting meal plan items by day:', error);
    throw error;
  }
}

export async function removeMealPlanItem(itemId: string | number): Promise<void> {
  const db = await getDb();
  
  try {
    await db.query(`
      DELETE FROM meal_plan_items WHERE id = $1
    `, [itemId]);
  } catch (error) {
    console.error('Error removing meal plan item:', error);
    throw error;
  }
}

// Recipe saving operations
export async function saveRecipe(userId: string | number, recipeId: number, listName: string = 'Want to Make'): Promise<void> {
  const db = await getDb();
  
  try {
    await db.query(`
      INSERT INTO saved_recipes (user_id, recipe_id, list_name)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, recipe_id, list_name) DO NOTHING
    `, [userId, recipeId, listName]);
  } catch (error) {
    console.error('Error saving recipe:', error);
    throw error;
  }
}

export async function unsaveRecipe(userId: string | number, recipeId: number, listName: string = 'Want to Make'): Promise<void> {
  const db = await getDb();
  
  try {
    await db.query(`
      DELETE FROM saved_recipes 
      WHERE user_id = $1 AND recipe_id = $2 AND list_name = $3
    `, [userId, recipeId, listName]);
  } catch (error) {
    console.error('Error unsaving recipe:', error);
    throw error;
  }
}

export async function isRecipeSaved(userId: string | number, recipeId: number, listName: string = 'Want to Make'): Promise<boolean> {
  const db = await getDb();
  
  try {
    const result = await db.query(`
      SELECT 1 FROM saved_recipes 
      WHERE user_id = $1 AND recipe_id = $2 AND list_name = $3
    `, [userId, recipeId, listName]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking if recipe is saved:', error);
    throw error;
  }
}

export async function getUserSavedRecipes(userId: string | number, listName: string = 'Want to Make'): Promise<any[]> {
  const db = await getDb();
  
  try {
    const result = await db.query(`
      SELECT * FROM saved_recipes 
      WHERE user_id = $1 AND list_name = $2
      ORDER BY created_at DESC
    `, [userId, listName]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting saved recipes:', error);
    throw error;
  }
}

export async function getUserLovedRecipes(userId: string | number): Promise<any[]> {
  const db = await getDb();
  
  try {
    const result = await db.query(`
      SELECT recipe_id, created_at FROM recipe_reactions 
      WHERE user_id = $1 AND reaction_type = 'love'
      ORDER BY created_at DESC
    `, [userId]);
    
    return result.rows.map(row => ({
      recipe_id: row.recipe_id,
      created_at: row.created_at
    }));
  } catch (error) {
    console.error('Error getting loved recipes:', error);
    throw error;
  }
}

// Recipe database functions
export async function getAllRecipes(limit?: number, offset?: number): Promise<any[]> {
  const db = await getDb();

  try {
    let query = `
      SELECT
        id,
        title,
        source_url,
        source_domain,
        summary,
        total_time_minutes,
        servings,
        calories,
        macros,
        tags,
        author,
        image_url
      FROM recipes
      ORDER BY id ASC
    `;

    const params = [];
    if (limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
    }
    if (offset) {
      query += ` OFFSET $${params.length + 1}`;
      params.push(offset);
    }

    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error getting all recipes:', error);
    throw error;
  }
}

export async function searchRecipes(searchTerm: string, filters?: {
  cuisine?: string[];
  tags?: string[];
  maxTime?: number;
  minTime?: number;
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  const db = await getDb();

  try {
    let query = `
      SELECT
        id,
        title,
        source_url,
        source_domain,
        summary,
        total_time_minutes,
        servings,
        calories,
        macros,
        tags,
        author,
        image_url
      FROM recipes
      WHERE 1=1
    `;

    const params = [];

    // Search term filter
    if (searchTerm && searchTerm.trim()) {
      params.push(`%${searchTerm.toLowerCase()}%`);
      query += ` AND (
        LOWER(title) LIKE $${params.length}
        OR LOWER(summary) LIKE $${params.length}
        OR EXISTS (
          SELECT 1 FROM unnest(tags) AS tag
          WHERE LOWER(tag) LIKE $${params.length}
        )
      )`;
    }

    // Tags filter (dietary restrictions, cuisine, etc.)
    if (filters?.tags && filters.tags.length > 0) {
      const tagConditions = filters.tags.map((tag, index) => {
        params.push(tag.toLowerCase());
        return `EXISTS (
          SELECT 1 FROM unnest(tags) AS tag
          WHERE LOWER(tag) = $${params.length}
        )`;
      });
      query += ` AND (${tagConditions.join(' OR ')})`;
    }

    // Time range filters
    if (filters?.maxTime) {
      params.push(filters.maxTime);
      query += ` AND total_time_minutes <= $${params.length}`;
    }

    if (filters?.minTime) {
      params.push(filters.minTime);
      query += ` AND total_time_minutes >= $${params.length}`;
    }

    query += ` ORDER BY id ASC`;

    // Pagination
    if (filters?.limit) {
      params.push(filters.limit);
      query += ` LIMIT $${params.length}`;
    }
    if (filters?.offset) {
      params.push(filters.offset);
      query += ` OFFSET $${params.length}`;
    }

    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error searching recipes:', error);
    throw error;
  }
}

export async function getRecipeById(id: number): Promise<any | null> {
  const db = await getDb();

  try {
    const result = await db.query(`
      SELECT
        id,
        title,
        source_url,
        source_domain,
        summary,
        total_time_minutes,
        servings,
        calories,
        macros,
        tags,
        author,
        image_url
      FROM recipes
      WHERE id = $1
    `, [id]);

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting recipe by ID:', error);
    throw error;
  }
}

export async function getRecipeIngredients(recipeId: number): Promise<any[]> {
  const db = await getDb();

  try {
    const result = await db.query(`
      SELECT
        name,
        raw,
        qty,
        unit,
        notes
      FROM recipe_ingredients
      WHERE recipe_id = $1
      ORDER BY id
    `, [recipeId]);

    return result.rows || [];
  } catch (error) {
    console.error('Error getting recipe ingredients:', error);
    throw error;
  }
}

export async function getRecipeSteps(recipeId: number): Promise<any[]> {
  const db = await getDb();

  try {
    const result = await db.query(`
      SELECT
        step_no,
        text
      FROM recipe_steps
      WHERE recipe_id = $1
      ORDER BY step_no
    `, [recipeId]);

    return result.rows || [];
  } catch (error) {
    console.error('Error getting recipe steps:', error);
    throw error;
  }
}

// User following operations
export async function followUser(followerId: string | number, followingId: string | number): Promise<void> {
  const db = await getDb();
  
  try {
    await db.query(`
      INSERT INTO user_follows (follower_id, following_id)
      VALUES ($1, $2)
      ON CONFLICT (follower_id, following_id) DO NOTHING
    `, [followerId, followingId]);
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
}

export async function unfollowUser(followerId: string | number, followingId: string | number): Promise<void> {
  const db = await getDb();
  
  try {
    await db.query(`
      DELETE FROM user_follows 
      WHERE follower_id = $1 AND following_id = $2
    `, [followerId, followingId]);
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
}

export async function isUserFollowing(followerId: string | number, followingId: string | number): Promise<boolean> {
  const db = await getDb();
  
  try {
    const result = await db.query(`
      SELECT 1 FROM user_follows 
      WHERE follower_id = $1 AND following_id = $2
    `, [followerId, followingId]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking if user is following:', error);
    throw error;
  }
}

// Activity feed operations
export async function getActivityFeed(userId?: string | number, limit: number = 20, offset: number = 0): Promise<any[]> {
  const db = await getDb();
  
  try {
    let params: any[] = [];
    let whereClause = '';
    
    if (userId) {
      whereClause = ' WHERE af.user_id = $1';
      params.push(userId);
    }
    
    // Get aggregated activity feed - group by recipe and show most recent activity per recipe
    const query = `
      WITH latest_activities AS (
        SELECT DISTINCT
          af.recipe_id,
          FIRST_VALUE(af.user_id) OVER (PARTITION BY af.recipe_id ORDER BY af.created_at DESC) as recent_user_id,
          FIRST_VALUE(af.activity_type) OVER (PARTITION BY af.recipe_id ORDER BY af.created_at DESC) as recent_activity_type,
          FIRST_VALUE(af.metadata) OVER (PARTITION BY af.recipe_id ORDER BY af.created_at DESC) as recent_metadata,
          MAX(af.created_at) OVER (PARTITION BY af.recipe_id) as latest_activity
        FROM activity_feed af${whereClause}
      ),
      recipe_stats AS (
        SELECT 
          af.recipe_id,
          COUNT(CASE WHEN af.activity_type = 'reaction' THEN 1 END) as reaction_count,
          COUNT(CASE WHEN af.activity_type = 'comment' THEN 1 END) as comment_count,
          COUNT(*) as total_activities,
          ARRAY_AGG(DISTINCT u.name) FILTER (WHERE u.name IS NOT NULL) as participating_users,
          ARRAY_AGG(DISTINCT af.activity_type) as activity_types
        FROM activity_feed af
        JOIN users u ON af.user_id = u.id${whereClause}
        GROUP BY af.recipe_id
      )
      SELECT 
        la.recipe_id,
        la.latest_activity as created_at,
        rs.reaction_count,
        rs.comment_count,
        rs.total_activities,
        rs.participating_users,
        rs.activity_types,
        la.recent_activity_type as activity_type,
        la.recent_metadata as metadata,
        u.name as user_name
      FROM latest_activities la
      JOIN recipe_stats rs ON la.recipe_id = rs.recipe_id
      JOIN users u ON la.recent_user_id = u.id
      ORDER BY la.latest_activity DESC
      LIMIT ${userId ? '$2' : '$1'} OFFSET ${userId ? '$3' : '$2'}
    `;
    
    params.push(limit, offset);
    
    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error getting activity feed:', error);
    throw error;
  }
}

// Shopping list operations
export async function getUserShoppingList(userId: string | number, mealPlanId?: string | number): Promise<any | null> {
  const db = await getDb();
  
  try {
    let query = `
      SELECT * FROM shopping_lists 
      WHERE user_id = $1
    `;
    let params: any[] = [userId];
    
    if (mealPlanId) {
      query += ` AND meal_plan_id = $2`;
      params.push(mealPlanId);
    }
    
    query += ` ORDER BY created_at DESC LIMIT 1`;
    
    const result = await db.query(query, params);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error getting shopping list:', error);
    throw error;
  }
}

export async function createShoppingList(userId: string | number, items: any[], mealPlanId?: string | number, name: string = 'Shopping List'): Promise<string> {
  const db = await getDb();
  
  try {
    const result = await db.query(`
      INSERT INTO shopping_lists (user_id, meal_plan_id, name, items)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [userId, mealPlanId || null, name, JSON.stringify(items)]);
    
    return result.rows[0].id.toString();
  } catch (error) {
    console.error('Error creating shopping list:', error);
    throw error;
  }
}

// Additional missing functions
export async function getFollowers(userId: string | number): Promise<any[]> {
  const db = await getDb();
  
  try {
    const result = await db.query(`
      SELECT u.id, u.name, u.email, uf.created_at as followed_at
      FROM user_follows uf
      JOIN users u ON uf.follower_id = u.id
      WHERE uf.following_id = $1
      ORDER BY uf.created_at DESC
    `, [userId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting followers:', error);
    throw error;
  }
}

export async function getFollowing(userId: string | number): Promise<any[]> {
  const db = await getDb();
  
  try {
    const result = await db.query(`
      SELECT u.id, u.name, u.email, uf.created_at as followed_at
      FROM user_follows uf
      JOIN users u ON uf.following_id = u.id
      WHERE uf.follower_id = $1
      ORDER BY uf.created_at DESC
    `, [userId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting following:', error);
    throw error;
  }
}

export async function isFollowing(followerId: string | number, followingId: string | number): Promise<boolean> {
  return await isUserFollowing(followerId, followingId);
}

export async function getGlobalFeed(limit: number = 20, offset: number = 0): Promise<any[]> {
  return await getActivityFeed(undefined, limit, offset);
}

export async function removeReaction(userId: string | number, recipeId: number): Promise<void> {
  const db = await getDb();
  
  try {
    await db.query(`
      DELETE FROM recipe_reactions 
      WHERE user_id = $1 AND recipe_id = $2
    `, [userId, recipeId]);
    
    // Also remove from activity feed
    await db.query(`
      DELETE FROM activity_feed 
      WHERE user_id = $1 AND recipe_id = $2 AND activity_type = 'reaction'
    `, [userId, recipeId]);
  } catch (error) {
    console.error('Error removing reaction:', error);
    throw error;
  }
}

export async function createNotification(userId: string | number, fromUserId: string | number, type: string, recipeId?: number, commentId?: string, message: string = ''): Promise<void> {
  const db = await getDb();
  
  try {
    await db.query(`
      INSERT INTO notifications (user_id, from_user_id, type, recipe_id, comment_id, message)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [userId, fromUserId, type, recipeId || null, commentId || null, message]);
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}