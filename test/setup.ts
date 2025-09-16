import { beforeAll, vi } from 'vitest'

// Mock environment variables
beforeAll(() => {
  vi.stubEnv('DATABASE_URL', 'postgresql://test:test@localhost:5432/test_db')
  vi.stubEnv('CLERK_SECRET_KEY', 'test_clerk_secret')
  vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123')
  vi.stubEnv('MEDIA_META_API_KEY', 'test_meta_key')
  vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')
})

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  auth: vi.fn(() => ({ userId: 'test_user_id' })),
  useAuth: vi.fn(() => ({ isSignedIn: true, userId: 'test_user_id' })),
  SignIn: vi.fn(() => null),
  SignUp: vi.fn(() => null),
  ClerkProvider: vi.fn(({ children }) => children),
}))

// Mock Prisma
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    parseRecord: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    subscription: {
      findFirst: vi.fn(),
      upsert: vi.fn(),
    },
    usage: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  })),
}))

// Mock Next.js
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
}))

// Mock fetch
global.fetch = vi.fn()