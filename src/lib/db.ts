import Database from 'better-sqlite3';
import path from 'path';
import { User, UserWithPassword } from './auth';

// Database path - in production, use environment variable
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'users.db');

let db: Database.Database | null = null;

function getDb(): Database.Database {
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