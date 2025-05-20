
import { Pool } from 'pg';

// Configure PostgreSQL connection
// Note: You'll need to replace these values with your actual database configuration
const pool = new Pool({
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

export default pool;
