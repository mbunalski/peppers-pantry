// API and database test setup

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only'
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/pepper_pantry_test'

// Mock AWS SES for email tests
jest.mock('@aws-sdk/client-ses', () => ({
  SESClient: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({ MessageId: 'test-message-id' })
  })),
  SendEmailCommand: jest.fn().mockImplementation((params) => params)
}))

// Global test timeout for database operations
jest.setTimeout(15000)

// Clean up function to be used in tests
global.testCleanup = []

// Add cleanup function that tests can use
global.addCleanup = (fn) => {
  global.testCleanup.push(fn)
}

// Run cleanup after each test
afterEach(async () => {
  // Run all cleanup functions
  for (const cleanup of global.testCleanup) {
    try {
      await cleanup()
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  }
  global.testCleanup = []
})