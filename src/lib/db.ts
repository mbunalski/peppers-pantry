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
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
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
    const result = await db.query(`
      INSERT INTO users (email, name, password_hash, phone, tz, meals_per_week)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, name, created_at
    `, [email, name, passwordHash, 'web-user', 'America/New_York', 4]);
    
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
}

export async function saveUserPreferences(userId: string | number, preferences: Partial<UserPreferences>): Promise<void> {
  const db = await getDb();
  
  console.log('Saving preferences for user:', userId, preferences);
  
  try {
    await pool.query(`
      INSERT INTO user_preferences 
      (user_id, dietary_restrictions, budget_per_meal, max_cooking_time, complexity, allergens, favorite_cuisines, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        dietary_restrictions = $2,
        budget_per_meal = $3,
        max_cooking_time = $4,
        complexity = $5,
        allergens = $6,
        favorite_cuisines = $7,
        updated_at = CURRENT_TIMESTAMP
    `, [
      userId,
      JSON.stringify(preferences.dietary_restrictions || []),
      preferences.budget_per_meal || 15.0,
      preferences.max_cooking_time || 30,
      preferences.complexity || 'medium',
      JSON.stringify(preferences.allergens || []),
      JSON.stringify(preferences.favorite_cuisines || [])
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
      favorite_cuisines: prefs.favorite_cuisines
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
    
    // Update or insert activity feed entry
    await pool.query(`
      INSERT INTO activity_feed (user_id, activity_type, recipe_id, metadata)
      VALUES ($1, 'reaction', $2, $3)
      ON CONFLICT (user_id, recipe_id, activity_type) DO UPDATE SET
        metadata = $3,
        created_at = CURRENT_TIMESTAMP
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
    if (activityType === 'reaction') {
      // For reactions, use upsert to avoid duplicates
      await pool.query(`
        INSERT INTO activity_feed (user_id, activity_type, recipe_id, target_id, metadata)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, recipe_id, activity_type) DO UPDATE SET
          metadata = $5,
          created_at = CURRENT_TIMESTAMP
      `, [userId, activityType, recipeId, targetId || null, metadata || null]);
    } else {
      // For comments and other activities, always insert new
      await pool.query(`
        INSERT INTO activity_feed (user_id, activity_type, recipe_id, target_id, metadata)
        VALUES ($1, $2, $3, $4, $5)
      `, [userId, activityType, recipeId, targetId || null, metadata || null]);
    }
  } catch (error) {
    console.error('Error adding activity feed item:', error);
    throw error;
  }
}

// Export the db connection for use in other files
export { getDb };

// Placeholder functions that need to be implemented
export function createMealPlan(userId: string, name: string = 'My Meal Plan'): Promise<string> {
  // TODO: Implement PostgreSQL version
  return Promise.resolve('placeholder-id');
}

export function getUserMealPlan(userId: string): Promise<any | null> {
  // TODO: Implement PostgreSQL version  
  return Promise.resolve(null);
}

export function getUserSavedRecipes(userId: string, listName: string = 'Want to Make'): Promise<any[]> {
  // TODO: Implement PostgreSQL version
  return Promise.resolve([]);
}

// More functions will be added as needed...