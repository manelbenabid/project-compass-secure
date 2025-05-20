
// Define a type for our database connection interface
// This will allow us to have a consistent interface whether we're using
// a real PostgreSQL connection or a mock
export interface DbConnection {
  query: (text: string, params?: any[]) => Promise<{ rows: any[] }>;
  connect: () => Promise<any>;
}

// Create a mock database implementation that's safe for browser environments
const mockDatabase: DbConnection = {
  query: async (text: string, params?: any[]) => {
    console.log('Mock database query executed:', text, params);
    return { rows: [] };
  },
  connect: async () => {
    console.log('Mock database connection established');
    return {};
  }
};

// Export the mock database for browser environments
const dbConnection: DbConnection = mockDatabase;

// Log that we're using the mock implementation
console.warn('Running in browser environment. Using mock database functionality.');

export default dbConnection;
