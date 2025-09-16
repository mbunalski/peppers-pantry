// Test database utilities for setting up clean test environment
import { Pool } from 'pg'
import { getDb } from '../../src/lib/db'

let testPool: Pool | null = null
let originalDatabaseUrl: string | undefined

export async function setupTestDatabase() {
  // Store original DATABASE_URL
  originalDatabaseUrl = process.env.DATABASE_URL
  
  // Use test database URL or create in-memory/temporary database
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 
    'postgresql://test:test@localhost:5432/pepper_pantry_test'
  
  try {
    testPool = await getDb()
    console.log('✅ Test database connected')
    return testPool
  } catch (error) {
    console.warn('⚠️  Test database not available, using mock data')
    return null
  }
}

export async function cleanupTestDatabase() {
  if (testPool) {
    try {
      // Clean all tables in reverse dependency order
      await testPool.query('TRUNCATE TABLE password_reset_tokens CASCADE')
      await testPool.query('TRUNCATE TABLE notifications CASCADE')
      await testPool.query('TRUNCATE TABLE activity_feed CASCADE')
      await testPool.query('TRUNCATE TABLE saved_recipes CASCADE')
      await testPool.query('TRUNCATE TABLE user_follows CASCADE')
      await testPool.query('TRUNCATE TABLE recipe_comments CASCADE')
      await testPool.query('TRUNCATE TABLE recipe_reactions CASCADE')
      await testPool.query('TRUNCATE TABLE shopping_lists CASCADE')
      await testPool.query('TRUNCATE TABLE meal_plan_items CASCADE')
      await testPool.query('TRUNCATE TABLE meal_plans CASCADE')
      await testPool.query('TRUNCATE TABLE user_preferences CASCADE')
      await testPool.query('TRUNCATE TABLE users CASCADE')
    } catch (error) {
      console.warn('Test database cleanup failed:', error)
    }
  }
}

export async function teardownTestDatabase() {
  if (testPool) {
    await testPool.end()
    testPool = null
  }
  // Restore original DATABASE_URL
  if (originalDatabaseUrl) {
    process.env.DATABASE_URL = originalDatabaseUrl
  }
}

// Helper function to create test user
export async function createTestUser(email: string = 'test@example.com', name: string = 'Test User') {
  if (!testPool) return null
  
  try {
    const result = await testPool.query(`
      INSERT INTO users (email, name, password_hash, phone, tz, meals_per_week)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, name, created_at
    `, [email, name, 'test-hash', `test-${Date.now()}`, 'America/New_York', 4])
    
    return result.rows[0]
  } catch (error) {
    console.error('Failed to create test user:', error)
    return null
  }
}

// Helper function to create test recipe reaction
export async function createTestReaction(userId: string, recipeId: number, reactionType: 'love' | 'like' | 'vomit') {
  if (!testPool) return null
  
  try {
    await testPool.query(`
      INSERT INTO recipe_reactions (user_id, recipe_id, reaction_type)
      VALUES ($1, $2, $3)
    `, [userId, recipeId, reactionType])
    
    return { userId, recipeId, reactionType }
  } catch (error) {
    console.error('Failed to create test reaction:', error)
    return null
  }
}

// Mock data for when database is not available
export const mockUsers = [
  { id: '1', email: 'test1@example.com', name: 'Test User 1', created_at: '2024-01-01T00:00:00Z' },
  { id: '2', email: 'test2@example.com', name: 'Test User 2', created_at: '2024-01-01T00:00:00Z' }
]

export const mockRecipes = [
  { id: 1, title: 'Test Recipe 1', summary: 'A test recipe' },
  { id: 2, title: 'Test Recipe 2', summary: 'Another test recipe' }
]

export const mockReactions = {
  1: { love: 5, like: 3, vomit: 0 },
  2: { love: 2, like: 8, vomit: 1 }
}