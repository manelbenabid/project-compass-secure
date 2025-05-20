
import React, { createContext, useState, useContext, useEffect } from 'react';
// import { ReactKeycloakProvider } from '@react-keycloak/web';
// import Keycloak from 'keycloak-js';

// Keycloak configuration - commented out as requested
// const keycloakConfig = {
//   url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080/auth',
//   realm: import.meta.env.VITE_KEYCLOAK_REALM || 'poc-manager',
//   clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'poc-manager-client',
// };

// Initialize Keycloak instance
// const keycloak = new Keycloak(keycloakConfig);

// User role types
export type UserRole = 'admin' | 'lead' | 'developer' | 'account_manager';

// Mock user data
const mockUser = {
  id: '1',
  name: 'Jane Smith',
  email: 'jane.smith@company.com',
  phone: '555-123-4567',
  workExtension: '1234',
  roles: ['admin'] as UserRole[],
  skills: ['React', 'TypeScript', 'Node.js'],
  certificates: ['AWS Certified Developer', 'Scrum Master'],
  location: 'in-office',
  status: 'active',
  jobTitle: 'Senior Developer',
  department: 'Engineering',
};

// User context type
interface AuthContextType {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    workExtension?: string;
    roles: UserRole[];
    skills?: string[];
    certificates?: string[];
    location?: 'remote' | 'in-office' | 'on-site' | 'off-site';
    status?: 'active' | 'on leave' | 'other';
    jobTitle?: string;
    department?: string;
  } | null;
  login: () => void;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
  isLoading: boolean;
  updateUserInfo: (data: Partial<typeof mockUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<AuthContextType['user']>(null);

  // Auto login for development
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = () => {
    // Mock login
    setIsAuthenticated(true);
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const logout = () => {
    // Mock logout
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('user');
  };

  // Check if user has a specific role or one of multiple roles
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;

    if (Array.isArray(role)) {
      return role.some(r => user.roles.includes(r));
    }
    
    return user.roles.includes(role);
  };

  // Update user information
  const updateUserInfo = (data: Partial<typeof mockUser>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Check if user has permission for a specific resource and action
  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.roles.includes('admin')) return true;
    
    // Example permission checks
    if (resource === 'poc') {
      if (action === 'view') return true; // Everyone can view POCs
      if (action === 'create' || action === 'edit') return hasRole(['admin', 'lead']);
      if (action === 'delete') return hasRole('admin');
    }
    
    if (resource === 'employee') {
      if (action === 'view') return hasRole(['admin', 'lead', 'account_manager']);
      if (action === 'manage') return hasRole(['admin', 'lead']);
    }
    
    if (resource === 'comment') {
      if (action === 'add') return true; // Everyone can add comments
      if (action === 'delete') return hasRole(['admin', 'lead']);
    }

    if (resource === 'customer') {
      if (action === 'view') return true; // Everyone can view customers
      if (action === 'edit') return hasRole(['admin', 'lead', 'account_manager']);
    }
    
    return false;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        user, 
        login, 
        logout, 
        hasRole, 
        hasPermission,
        isLoading,
        updateUserInfo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
