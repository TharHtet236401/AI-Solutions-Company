import { vi } from 'vitest';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/AI_SOLUTION_TEST';

// Mock fs module
vi.mock('fs', () => ({
    default: {
        existsSync: vi.fn(() => true),
        mkdirSync: vi.fn(),
        unlink: vi.fn(),
        rmSync: vi.fn()
    },
    existsSync: vi.fn(() => true),
    mkdirSync: vi.fn(),
    unlink: vi.fn(),
    rmSync: vi.fn()
}));

// Mock path module
vi.mock('path', () => ({
    default: {
        join: vi.fn((...args) => args.join('/')),
        dirname: vi.fn()
    },
    join: vi.fn((...args) => args.join('/')),
    dirname: vi.fn()
})); 