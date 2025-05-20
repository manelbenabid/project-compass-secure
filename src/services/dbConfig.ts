
import { Pool } from 'pg';

// Check if we're in a Node.js environment
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

// Create a Pool if we're in Node.js, otherwise create a mock
let pool: Pool;

if (isNode) {
  // Configure PostgreSQL connection
  // Note: You'll need to replace these values with your actual database configuration
  pool = new Pool({
    host: process.env.VITE_PG_HOST || 'localhost',
    port: parseInt(process.env.VITE_PG_PORT || '5432'),
    database: process.env.VITE_PG_DATABASE || 'poc_management',
    user: process.env.VITE_PG_USER || 'postgres',
    password: process.env.VITE_PG_PASSWORD || 'postgres',
  });

  // Test the connection
  pool.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Error connecting to PostgreSQL:', err));
} else {
  // Create a mock pool for browser environments
  console.warn('Running in browser environment. Using mock database functionality.');
  
  // Mock implementation of Pool for browser environment
  pool = {
    query: async () => {
      console.log('Mock database query executed');
      return { rows: [] };
    },
    connect: async () => {
      console.log('Mock database connection established');
      return {};
    },
    // Add other methods as needed
  } as unknown as Pool;
}

export default pool;
