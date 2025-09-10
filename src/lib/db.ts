import Database from 'better-sqlite3';
import path from 'path';
import { User, UserWithPassword } from './auth';

// Database path - in production, use environment variable
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'users.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const fs = require('fs');
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    db = new Database(DB_PATH);
    
    // Create users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create user preferences table
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id TEXT PRIMARY KEY,
        dietary_restrictions TEXT DEFAULT '[]',
        budget_per_meal REAL DEFAULT 15.0,
        max_cooking_time INTEGER DEFAULT 30,
        complexity TEXT DEFAULT 'medium',
        allergens TEXT DEFAULT '[]',
        favorite_cuisines TEXT DEFAULT '[]',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);
    
    // Create meal plans table
    db.exec(`
      CREATE TABLE IF NOT EXISTS meal_plans (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT DEFAULT 'My Meal Plan',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);
    
    // Create meal plan items table
    db.exec(`
      CREATE TABLE IF NOT EXISTS meal_plan_items (
        id TEXT PRIMARY KEY,
        meal_plan_id TEXT NOT NULL,
        recipe_id INTEGER NOT NULL,
        recipe_title TEXT NOT NULL,
        day_of_week TEXT NOT NULL,
        meal_type TEXT DEFAULT 'dinner',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (meal_plan_id) REFERENCES meal_plans (id)
      )
    `);
    
    // Create shopping lists table
    db.exec(`
      CREATE TABLE IF NOT EXISTS shopping_lists (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        meal_plan_id TEXT,
        name TEXT DEFAULT 'Shopping List',
        items TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (meal_plan_id) REFERENCES meal_plans (id)
      )
    `);

    // Create recipe reactions table (love, like, vomit)
    db.exec(`
      CREATE TABLE IF NOT EXISTS recipe_reactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        recipe_id INTEGER NOT NULL,
        reaction_type TEXT NOT NULL CHECK (reaction_type IN ('love', 'like', 'vomit')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(user_id, recipe_id)
      )
    `);

    // Create recipe comments table with single-level replies
    db.exec(`
      CREATE TABLE IF NOT EXISTS recipe_comments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        recipe_id INTEGER NOT NULL,
        parent_comment_id TEXT,
        content TEXT NOT NULL,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (parent_comment_id) REFERENCES recipe_comments (id)
      )
    `);

    // Create user follows table
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_follows (
        id TEXT PRIMARY KEY,
        follower_id TEXT NOT NULL,
        following_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (follower_id) REFERENCES users (id),
        FOREIGN KEY (following_id) REFERENCES users (id),
        UNIQUE(follower_id, following_id)
      )
    `);

    // Create saved recipes table (Want to Make lists)
    db.exec(`
      CREATE TABLE IF NOT EXISTS saved_recipes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        recipe_id INTEGER NOT NULL,
        list_name TEXT DEFAULT 'Want to Make',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(user_id, recipe_id, list_name)
      )
    `);

    // Create activity feed table
    db.exec(`
      CREATE TABLE IF NOT EXISTS activity_feed (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        activity_type TEXT NOT NULL CHECK (activity_type IN ('reaction', 'comment', 'recipe_added')),
        recipe_id INTEGER NOT NULL,
        target_id TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Create notifications table
    db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        from_user_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('reaction', 'comment', 'follow')),
        recipe_id INTEGER,
        comment_id TEXT,
        message TEXT NOT NULL,
        read_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (from_user_id) REFERENCES users (id),
        FOREIGN KEY (comment_id) REFERENCES recipe_comments (id)
      )
    `);

    // Clean up duplicate activity feed entries for reactions
    try {
      db.exec(`
        DELETE FROM activity_feed WHERE rowid NOT IN (
          SELECT MIN(rowid)
          FROM activity_feed
          WHERE activity_type = 'reaction'
          GROUP BY user_id, recipe_id, activity_type
        ) AND activity_type = 'reaction'
      `);
    } catch (error) {
      // Ignore errors if cleanup fails
      console.log('Activity feed cleanup completed or skipped');
    }
  }
  
  return db;
}

// User operations
export function createUser(email: string, name: string, passwordHash: string): User {
  const userId = crypto.randomUUID();
  const db = getDb();
  
  const stmt = db.prepare(`
    INSERT INTO users (id, email, name, password_hash)
    VALUES (?, ?, ?, ?)
  `);
  
  stmt.run(userId, email, name, passwordHash);
  
  return {
    id: userId,
    email,
    name,
    created_at: new Date().toISOString()
  };
}

export function getUserByEmail(email: string): UserWithPassword | null {
  const db = getDb();
  
  const stmt = db.prepare(`
    SELECT * FROM users WHERE email = ?
  `);
  
  const user = stmt.get(email) as any;
  
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    password_hash: user.password_hash,
    created_at: user.created_at
  };
}

export function getUserById(id: string): User | null {
  const db = getDb();
  
  const stmt = db.prepare(`
    SELECT id, email, name, created_at FROM users WHERE id = ?
  `);
  
  const user = stmt.get(id) as any;
  
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    created_at: user.created_at
  };
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

export function saveUserPreferences(userId: string, preferences: Partial<UserPreferences>): void {
  const db = getDb();
  
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO user_preferences 
    (user_id, dietary_restrictions, budget_per_meal, max_cooking_time, complexity, allergens, favorite_cuisines, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);
  
  stmt.run(
    userId,
    JSON.stringify(preferences.dietary_restrictions || []),
    preferences.budget_per_meal || 15.0,
    preferences.max_cooking_time || 30,
    preferences.complexity || 'medium',
    JSON.stringify(preferences.allergens || []),
    JSON.stringify(preferences.favorite_cuisines || [])
  );
}

export function getUserPreferences(userId: string): UserPreferences | null {
  const db = getDb();
  
  const stmt = db.prepare(`
    SELECT * FROM user_preferences WHERE user_id = ?
  `);
  
  const prefs = stmt.get(userId) as any;
  
  if (!prefs) return null;
  
  return {
    user_id: prefs.user_id,
    dietary_restrictions: JSON.parse(prefs.dietary_restrictions),
    budget_per_meal: prefs.budget_per_meal,
    max_cooking_time: prefs.max_cooking_time,
    complexity: prefs.complexity,
    allergens: JSON.parse(prefs.allergens),
    favorite_cuisines: JSON.parse(prefs.favorite_cuisines)
  };
}

// Meal plan operations
export interface MealPlan {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  items: MealPlanItem[];
}

export interface MealPlanItem {
  id: string;
  meal_plan_id: string;
  recipe_id: number;
  recipe_title: string;
  day_of_week: string;
  meal_type: string;
}

export function createMealPlan(userId: string, name: string = 'My Meal Plan'): string {
  const mealPlanId = crypto.randomUUID();
  const db = getDb();
  
  const stmt = db.prepare(`
    INSERT INTO meal_plans (id, user_id, name)
    VALUES (?, ?, ?)
  `);
  
  stmt.run(mealPlanId, userId, name);
  
  return mealPlanId;
}

export function addRecipeToMealPlan(mealPlanId: string, recipeId: number, recipeTitle: string, dayOfWeek: string, mealType: string = 'dinner'): void {
  const itemId = crypto.randomUUID();
  const db = getDb();
  
  const stmt = db.prepare(`
    INSERT INTO meal_plan_items (id, meal_plan_id, recipe_id, recipe_title, day_of_week, meal_type)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(itemId, mealPlanId, recipeId, recipeTitle, dayOfWeek, mealType);
}

export function getUserMealPlan(userId: string): MealPlan | null {
  const db = getDb();
  
  // Get the most recent meal plan for the user
  const mealPlanStmt = db.prepare(`
    SELECT * FROM meal_plans 
    WHERE user_id = ? 
    ORDER BY updated_at DESC 
    LIMIT 1
  `);
  
  const mealPlan = mealPlanStmt.get(userId) as any;
  
  if (!mealPlan) return null;
  
  // Get all items for this meal plan
  const itemsStmt = db.prepare(`
    SELECT * FROM meal_plan_items 
    WHERE meal_plan_id = ?
    ORDER BY day_of_week
  `);
  
  const items = itemsStmt.all(mealPlan.id) as any[];
  
  return {
    id: mealPlan.id,
    user_id: mealPlan.user_id,
    name: mealPlan.name,
    created_at: mealPlan.created_at,
    updated_at: mealPlan.updated_at,
    items: items.map(item => ({
      id: item.id,
      meal_plan_id: item.meal_plan_id,
      recipe_id: item.recipe_id,
      recipe_title: item.recipe_title,
      day_of_week: item.day_of_week,
      meal_type: item.meal_type
    }))
  };
}

export function removeMealPlanItem(itemId: string): void {
  const db = getDb();
  
  const stmt = db.prepare(`
    DELETE FROM meal_plan_items WHERE id = ?
  `);
  
  stmt.run(itemId);
}

export function clearMealPlan(mealPlanId: string): void {
  const db = getDb();
  
  const stmt = db.prepare(`
    DELETE FROM meal_plan_items WHERE meal_plan_id = ?
  `);
  
  stmt.run(mealPlanId);
}

// Shopping list operations
export interface ShoppingList {
  id: string;
  user_id: string;
  meal_plan_id?: string;
  name: string;
  items: ShoppingItem[];
  created_at: string;
}

export interface ShoppingItem {
  ingredient: string;
  amount: string;
  category?: string;
}

export function createShoppingList(userId: string, mealPlanId: string, items: ShoppingItem[], name: string = 'Shopping List'): string {
  const db = getDb();
  
  // Delete any existing shopping list for this user first
  const deleteStmt = db.prepare('DELETE FROM shopping_lists WHERE user_id = ?');
  deleteStmt.run(userId);
  
  // Create new shopping list
  const shoppingListId = crypto.randomUUID();
  const insertStmt = db.prepare(`
    INSERT INTO shopping_lists (id, user_id, meal_plan_id, name, items)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  insertStmt.run(shoppingListId, userId, mealPlanId, name, JSON.stringify(items));
  
  return shoppingListId;
}

export function getUserShoppingList(userId: string): ShoppingList | null {
  const db = getDb();
  
  const stmt = db.prepare(`
    SELECT * FROM shopping_lists 
    WHERE user_id = ? 
    LIMIT 1
  `);
  
  const list = stmt.get(userId) as any;
  
  if (!list) return null;
  
  return {
    id: list.id,
    user_id: list.user_id,
    meal_plan_id: list.meal_plan_id,
    name: list.name,
    items: JSON.parse(list.items),
    created_at: list.created_at
  };
}

// Social feature interfaces and operations
export interface RecipeReaction {
  id: string;
  user_id: string;
  recipe_id: number;
  reaction_type: 'love' | 'like' | 'vomit';
  created_at: string;
}

export interface RecipeComment {
  id: string;
  user_id: string;
  user_name: string;
  recipe_id: number;
  parent_comment_id?: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  replies?: RecipeComment[];
}

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface SavedRecipe {
  id: string;
  user_id: string;
  recipe_id: number;
  list_name: string;
  created_at: string;
}

export interface ActivityFeedItem {
  id: string;
  user_id: string;
  user_name: string;
  activity_type: 'reaction' | 'comment' | 'recipe_added';
  recipe_id: number;
  recipe_title: string;
  target_id?: string;
  metadata?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  from_user_id: string;
  from_user_name: string;
  type: 'reaction' | 'comment' | 'follow';
  recipe_id?: number;
  comment_id?: string;
  message: string;
  read_at?: string;
  created_at: string;
}

// Recipe reaction operations
export function addOrUpdateReaction(userId: string, recipeId: number, reactionType: 'love' | 'like' | 'vomit'): void {
  const db = getDb();
  
  // Check if reaction exists
  const existingStmt = db.prepare(`
    SELECT id FROM recipe_reactions WHERE user_id = ? AND recipe_id = ?
  `);
  const existing = existingStmt.get(userId, recipeId);
  
  if (existing) {
    // Update existing reaction
    const updateStmt = db.prepare(`
      UPDATE recipe_reactions SET reaction_type = ?, created_at = CURRENT_TIMESTAMP WHERE user_id = ? AND recipe_id = ?
    `);
    updateStmt.run(reactionType, userId, recipeId);
    
    // Update existing activity feed entry instead of creating new one
    const updateActivityStmt = db.prepare(`
      UPDATE activity_feed 
      SET metadata = ?, created_at = CURRENT_TIMESTAMP 
      WHERE user_id = ? AND activity_type = 'reaction' AND recipe_id = ?
    `);
    updateActivityStmt.run(JSON.stringify({ reaction_type: reactionType }), userId, recipeId);
  } else {
    // Insert new reaction
    const reactionId = crypto.randomUUID();
    const insertStmt = db.prepare(`
      INSERT INTO recipe_reactions (id, user_id, recipe_id, reaction_type)
      VALUES (?, ?, ?, ?)
    `);
    insertStmt.run(reactionId, userId, recipeId, reactionType);
    
    // Add to activity feed only for new reactions
    addActivityFeedItem(userId, 'reaction', recipeId, reactionId, JSON.stringify({ reaction_type: reactionType }));
  }
}

export function removeReaction(userId: string, recipeId: number): void {
  const db = getDb();
  
  const stmt = db.prepare(`
    DELETE FROM recipe_reactions WHERE user_id = ? AND recipe_id = ?
  `);
  stmt.run(userId, recipeId);
  
  // Also remove from activity feed
  const activityStmt = db.prepare(`
    DELETE FROM activity_feed WHERE user_id = ? AND activity_type = 'reaction' AND recipe_id = ?
  `);
  activityStmt.run(userId, recipeId);
}

export function getRecipeReactions(recipeId: number): { love: number; like: number; vomit: number } {
  const db = getDb();
  
  const stmt = db.prepare(`
    SELECT reaction_type, COUNT(*) as count
    FROM recipe_reactions 
    WHERE recipe_id = ?
    GROUP BY reaction_type
  `);
  
  const results = stmt.all(recipeId) as any[];
  
  const reactions = { love: 0, like: 0, vomit: 0 };
  results.forEach(result => {
    reactions[result.reaction_type as keyof typeof reactions] = result.count;
  });
  
  return reactions;
}

export function getUserReactionForRecipe(userId: string, recipeId: number): 'love' | 'like' | 'vomit' | null {
  const db = getDb();
  
  const stmt = db.prepare(`
    SELECT reaction_type FROM recipe_reactions 
    WHERE user_id = ? AND recipe_id = ?
  `);
  
  const result = stmt.get(userId, recipeId) as any;
  return result ? result.reaction_type : null;
}

// Comment operations
export function addComment(userId: string, recipeId: number, content: string, imageUrl?: string, parentCommentId?: string): string {
  const db = getDb();
  
  const commentId = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO recipe_comments (id, user_id, recipe_id, parent_comment_id, content, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(commentId, userId, recipeId, parentCommentId || null, content, imageUrl || null);
  
  // Add to activity feed
  addActivityFeedItem(userId, 'comment', recipeId, commentId);
  
  return commentId;
}

export function getRecipeComments(recipeId: number): RecipeComment[] {
  const db = getDb();
  
  // Get parent comments first
  const parentStmt = db.prepare(`
    SELECT c.*, u.name as user_name
    FROM recipe_comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.recipe_id = ? AND c.parent_comment_id IS NULL
    ORDER BY c.created_at DESC
  `);
  
  const parentComments = parentStmt.all(recipeId) as any[];
  
  // Get replies for each parent comment
  const replyStmt = db.prepare(`
    SELECT c.*, u.name as user_name
    FROM recipe_comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.parent_comment_id = ?
    ORDER BY c.created_at ASC
  `);
  
  return parentComments.map(comment => ({
    id: comment.id,
    user_id: comment.user_id,
    user_name: comment.user_name,
    recipe_id: comment.recipe_id,
    parent_comment_id: comment.parent_comment_id,
    content: comment.content,
    image_url: comment.image_url,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    replies: replyStmt.all(comment.id).map((reply: any) => ({
      id: reply.id,
      user_id: reply.user_id,
      user_name: reply.user_name,
      recipe_id: reply.recipe_id,
      parent_comment_id: reply.parent_comment_id,
      content: reply.content,
      image_url: reply.image_url,
      created_at: reply.created_at,
      updated_at: reply.updated_at
    }))
  }));
}

// Follow operations
export function followUser(followerId: string, followingId: string): void {
  const db = getDb();
  
  const followId = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO user_follows (id, follower_id, following_id)
    VALUES (?, ?, ?)
  `);
  
  stmt.run(followId, followerId, followingId);
}

export function unfollowUser(followerId: string, followingId: string): void {
  const db = getDb();
  
  const stmt = db.prepare(`
    DELETE FROM user_follows WHERE follower_id = ? AND following_id = ?
  `);
  
  stmt.run(followerId, followingId);
}

export function isFollowing(followerId: string, followingId: string): boolean {
  const db = getDb();
  
  const stmt = db.prepare(`
    SELECT 1 FROM user_follows WHERE follower_id = ? AND following_id = ?
  `);
  
  return !!stmt.get(followerId, followingId);
}

export function getFollowers(userId: string): User[] {
  const db = getDb();
  
  const stmt = db.prepare(`
    SELECT u.* FROM users u
    JOIN user_follows f ON u.id = f.follower_id
    WHERE f.following_id = ?
    ORDER BY f.created_at DESC
  `);
  
  return stmt.all(userId) as User[];
}

export function getFollowing(userId: string): User[] {
  const db = getDb();
  
  const stmt = db.prepare(`
    SELECT u.* FROM users u
    JOIN user_follows f ON u.id = f.following_id
    WHERE f.follower_id = ?
    ORDER BY f.created_at DESC
  `);
  
  return stmt.all(userId) as User[];
}

// Saved recipes operations
export function saveRecipe(userId: string, recipeId: number, listName: string = 'Want to Make'): void {
  const db = getDb();
  
  const savedId = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO saved_recipes (id, user_id, recipe_id, list_name)
    VALUES (?, ?, ?, ?)
  `);
  
  stmt.run(savedId, userId, recipeId, listName);
}

export function unsaveRecipe(userId: string, recipeId: number, listName: string = 'Want to Make'): void {
  const db = getDb();
  
  const stmt = db.prepare(`
    DELETE FROM saved_recipes WHERE user_id = ? AND recipe_id = ? AND list_name = ?
  `);
  
  stmt.run(userId, recipeId, listName);
}

export function getUserSavedRecipes(userId: string, listName: string = 'Want to Make'): SavedRecipe[] {
  const db = getDb();
  
  const stmt = db.prepare(`
    SELECT * FROM saved_recipes 
    WHERE user_id = ? AND list_name = ?
    ORDER BY created_at DESC
  `);
  
  return stmt.all(userId, listName) as SavedRecipe[];
}

export function isRecipeSaved(userId: string, recipeId: number, listName: string = 'Want to Make'): boolean {
  const db = getDb();
  
  const stmt = db.prepare(`
    SELECT 1 FROM saved_recipes 
    WHERE user_id = ? AND recipe_id = ? AND list_name = ?
  `);
  
  return !!stmt.get(userId, recipeId, listName);
}

// Activity feed operations
export function addActivityFeedItem(userId: string, activityType: 'reaction' | 'comment' | 'recipe_added', recipeId: number, targetId?: string, metadata?: string): void {
  const db = getDb();
  
  // For reactions, check if one already exists and update it instead of creating new one
  if (activityType === 'reaction') {
    const existingStmt = db.prepare(`
      SELECT id FROM activity_feed 
      WHERE user_id = ? AND activity_type = 'reaction' AND recipe_id = ?
    `);
    const existing = existingStmt.get(userId, recipeId);
    
    if (existing) {
      // Update existing entry
      const updateStmt = db.prepare(`
        UPDATE activity_feed 
        SET metadata = ?, created_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
      updateStmt.run(metadata || null, existing.id);
      return;
    }
  }
  
  // Insert new activity item
  const activityId = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO activity_feed (id, user_id, activity_type, recipe_id, target_id, metadata)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(activityId, userId, activityType, recipeId, targetId || null, metadata || null);
}

export function getGlobalFeed(limit: number = 50, offset: number = 0): ActivityFeedItem[] {
  const db = getDb();
  
  const stmt = db.prepare(`
    SELECT a.*, u.name as user_name
    FROM activity_feed a
    JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `);
  
  return stmt.all(limit, offset).map((item: any) => ({
    ...item,
    recipe_title: `Recipe ${item.recipe_id}` // We'll get actual titles when we have recipe data
  })) as ActivityFeedItem[];
}

export function getFriendsFeed(userId: string, limit: number = 50, offset: number = 0): ActivityFeedItem[] {
  const db = getDb();
  
  const stmt = db.prepare(`
    SELECT a.*, u.name as user_name
    FROM activity_feed a
    JOIN users u ON a.user_id = u.id
    JOIN user_follows f ON a.user_id = f.following_id
    WHERE f.follower_id = ?
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `);
  
  return stmt.all(userId, limit, offset).map((item: any) => ({
    ...item,
    recipe_title: `Recipe ${item.recipe_id}` // We'll get actual titles when we have recipe data
  })) as ActivityFeedItem[];
}

// Notification operations
export function createNotification(userId: string, fromUserId: string, type: 'reaction' | 'comment' | 'follow', message: string, recipeId?: number, commentId?: string): void {
  const db = getDb();
  
  const notificationId = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO notifications (id, user_id, from_user_id, type, recipe_id, comment_id, message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(notificationId, userId, fromUserId, type, recipeId || null, commentId || null, message);
}

export function getUserNotifications(userId: string, limit: number = 50): Notification[] {
  const db = getDb();
  
  const stmt = db.prepare(`
    SELECT n.*, u.name as from_user_name
    FROM notifications n
    JOIN users u ON n.from_user_id = u.id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
    LIMIT ?
  `);
  
  return stmt.all(userId, limit) as Notification[];
}

export function markNotificationAsRead(notificationId: string): void {
  const db = getDb();
  
  const stmt = db.prepare(`
    UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = ?
  `);
  
  stmt.run(notificationId);
}