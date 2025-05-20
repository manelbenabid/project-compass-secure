
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const LoginPage: React.FC = () => {
  const { isAuthenticated, login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">POC Manager</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your projects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Click the button below to authenticate with Keycloak
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={login}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Sign in with Keycloak'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
