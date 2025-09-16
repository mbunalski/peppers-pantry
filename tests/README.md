# Testing Guide for Pepper's Pantry

This testing setup provides comprehensive coverage for your Next.js social cooking platform with regression testing capabilities.

## 🧪 Test Architecture

### Three-Tier Testing Strategy:
1. **Database Layer** (`tests/database/`) - Tests all 87 database functions
2. **API Layer** (`tests/api/`) - Tests all 18 API routes with mocking
3. **Frontend Layer** (`tests/frontend/`) - Tests React components and hooks

## 🚀 Running Tests

### Basic Commands:
```bash
npm test                 # Run all tests
npm run test:watch       # Run in watch mode for development
npm run test:coverage    # Run with coverage report
npm run test:database    # Run only database/API tests
npm run test:frontend    # Run only React component tests  
npm run test:ci          # CI-friendly run (no watch, with coverage)
```

### Specific Test Patterns:
```bash
npm test auth           # Run all auth-related tests
npm test social         # Run social features tests
npm test -- --verbose   # Run with detailed output
```

## 📁 Test Structure

```
tests/
├── database/          # Database function tests
│   ├── auth.test.ts      # User auth & password functions
│   ├── social.test.ts    # Reactions, comments, follows
│   ├── meal-plan.test.ts # Meal planning functions
│   └── preferences.test.ts # User preferences
├── api/               # API route tests  
│   ├── auth.test.ts      # Auth endpoints
│   ├── user.test.ts      # User management endpoints
│   ├── recipes.test.ts   # Recipe interaction endpoints
│   └── feed.test.ts      # Social feed endpoints
├── frontend/          # React component tests
│   ├── auth-context.test.tsx    # Authentication context
│   ├── social-feed.test.tsx     # Social feed component
│   ├── header.test.tsx          # Navigation header
│   └── pages/                   # Page component tests
├── utils/             # Test utilities
│   └── test-db.ts        # Database setup/cleanup helpers
└── README.md          # This file
```

## 🗄️ Database Testing

### Test Database Setup:
The tests use a separate test database to avoid affecting development data:

```bash
# Option 1: Use separate Neon test database (recommended)
export TEST_DATABASE_URL="postgresql://test_user:test_pass@ep-test-pool.neon.tech/test_db"

# Option 2: Use local PostgreSQL test database
export TEST_DATABASE_URL="postgresql://postgres:password@localhost:5432/pepper_pantry_test"
```

### Database Test Features:
- **Automatic cleanup** between tests
- **Test user creation** helpers
- **Mock data fallback** when database unavailable
- **Transaction isolation** to prevent test interference

### Example Database Test:
```typescript
describe('Recipe Reactions', () => {
  it('should add new reactions', async () => {
    const user = await createTestUser('test@example.com')
    await addOrUpdateReaction(user.id, 123, 'love')
    
    const reactions = await getRecipeReactions(123)
    expect(reactions.love).toBe(1)
  })
})
```

## 🌐 API Testing

API tests use **supertest** to test routes end-to-end with realistic HTTP requests:

### Example API Test:
```typescript
it('should login with valid credentials', async () => {
  const response = await request(app)
    .post('/api/auth/login')  
    .send({ email: 'test@example.com', password: 'password123' })
    .expect(200)
    
  expect(response.body.token).toBeDefined()
  expect(response.body.user.email).toBe('test@example.com')
})
```

## ⚛️ Frontend Testing

React component tests use **React Testing Library** for user-centric testing:

### Example Component Test:
```typescript
it('should handle login flow', async () => {
  render(<AuthProvider><LoginForm /></AuthProvider>)
  
  fireEvent.change(screen.getByLabelText(/email/i), { 
    target: { value: 'test@example.com' }
  })
  fireEvent.click(screen.getByRole('button', { name: /login/i }))
  
  await waitFor(() => {
    expect(screen.getByText(/welcome/i)).toBeInTheDocument()
  })
})
```

## 🎯 Regression Testing Strategy

### Critical Test Coverage:
1. **Authentication Flow** - Signup, login, password reset, token validation
2. **Social Features** - Reactions, comments, follows, activity feed
3. **Meal Planning** - Recipe saving, meal plan generation, shopping lists  
4. **User Management** - Profiles, preferences, data consistency

### Pre-Deployment Checklist:
```bash
# Full regression test suite
npm run test:ci

# Check test coverage (aim for >80%)
npm run test:coverage

# Test specific feature you changed
npm test -- --testNamePattern="social features"
```

## 🔧 Testing Utilities

### Database Helpers (`tests/utils/test-db.ts`):
- `setupTestDatabase()` - Initialize test database
- `cleanupTestDatabase()` - Clean all tables between tests
- `createTestUser()` - Create test user with known credentials
- `createTestReaction()` - Create test recipe reaction

### Mock Data:
When test database unavailable, tests fall back to mock data:
- `mockUsers` - Sample user objects
- `mockRecipes` - Sample recipe data  
- `mockReactions` - Sample reaction counts

## 📊 Coverage Reports

Generate detailed coverage reports to identify untested code:

```bash
npm run test:coverage
```

Coverage reports show:
- **Function coverage** - Which functions are tested
- **Branch coverage** - Which code paths are tested
- **Line coverage** - Which lines are executed
- **Statement coverage** - Which statements are tested

## 🚨 Continuous Integration

For automated testing in CI/CD pipelines:

```yaml
# Example GitHub Actions step
- name: Run Tests
  run: |
    npm ci
    npm run test:ci
  env:
    TEST_DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
    NODE_ENV: test
```

## 🐛 Debugging Tests

### Common Issues:
1. **Database connection failures** - Check TEST_DATABASE_URL
2. **Async timing issues** - Use `await waitFor()` for async operations
3. **Mock conflicts** - Clear mocks between tests with `jest.clearAllMocks()`
4. **Memory leaks** - Ensure database cleanup in `afterEach`

### Debug Commands:
```bash
npm test -- --verbose                    # Detailed test output
npm test -- --detectOpenHandles         # Find memory leaks
npm test -- --testNamePattern="specific" # Run specific tests
```

## ✅ Best Practices

### Test Writing Guidelines:
1. **Arrange, Act, Assert** pattern for clear test structure
2. **Descriptive test names** explaining what behavior is tested
3. **Independent tests** that don't rely on other test state
4. **Cleanup after tests** to prevent test pollution
5. **Mock external dependencies** (APIs, file system, etc.)

### Performance Tips:
1. Run database tests in parallel where possible
2. Use test database for isolation
3. Mock heavy operations in unit tests
4. Group related tests in describe blocks

This comprehensive testing setup ensures your codebase changes are safe and backwards compatible!