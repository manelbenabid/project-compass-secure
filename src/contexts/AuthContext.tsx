
import React, { createContext, useState, useContext, useEffect } from 'react';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import Keycloak from 'keycloak-js';

// Keycloak configuration
const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080/auth',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'poc-manager',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'poc-manager-client',
};

// Initialize Keycloak instance
const keycloak = new Keycloak(keycloakConfig);

// User role types
export type UserRole = 'admin' | 'lead' | 'developer' | 'account_manager';

// User context type
interface AuthContextType {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    roles: UserRole[];
  } | null;
  login: () => void;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<AuthContextType['user']>(null);

  const login = () => {
    keycloak.login();
  };

  const logout = () => {
    keycloak.logout();
  };

  // Check if user has a specific role or one of multiple roles
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;

    if (Array.isArray(role)) {
      return role.some(r => user.roles.includes(r));
    }
    
    return user.roles.includes(role);
  };

  // Check if user has permission for a specific resource and action
  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.roles.includes('admin')) return true;
    
    // Example permission checks - in a real application, these would be more sophisticated
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
    
    return false;
  };

  const onKeycloakEvent = (event: string) => {
    if (event === 'onReady') {
      setIsLoading(false);
    }
    if (event === 'onAuthSuccess') {
      setIsAuthenticated(true);
      const profile = keycloak.tokenParsed as any;
      
      if (profile) {
        setUser({
          id: profile.sub,
          name: profile.name || profile.preferred_username,
          email: profile.email,
          roles: (profile.realm_access?.roles || []).filter((role: string) => 
            ['admin', 'lead', 'developer', 'account_manager'].includes(role)
          ) as UserRole[],
        });
      }
    }
  };

  const onKeycloakTokens = () => {
    // Token refresh handling if needed
  };

  return (
    <ReactKeycloakProvider 
      authClient={keycloak}
      onEvent={onKeycloakEvent}
      onTokens={onKeycloakTokens}
    >
      <AuthContext.Provider 
        value={{ 
          isAuthenticated, 
          user, 
          login, 
          logout, 
          hasRole, 
          hasPermission,
          isLoading 
        }}
      >
        {children}
      </AuthContext.Provider>
    </ReactKeycloakProvider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
