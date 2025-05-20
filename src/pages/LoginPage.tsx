
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, User } from 'lucide-react';

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Card className="w-[350px] shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <User className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-center">POC Manager</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your projects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Click the button below to sign in
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700" 
            onClick={login}
            disabled={isLoading}
          >
            <LogIn className="w-4 h-4 mr-2" />
            {isLoading ? 'Loading...' : 'Sign in'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
