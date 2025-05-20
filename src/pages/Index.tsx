
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 p-6">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">POC Manager</span>
            <span className="block mt-2 text-primary">Secure Project Management</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto">
            A secure, role-based platform for managing internal projects and proofs of concept with fine-grained access control.
          </p>
        </div>

        <div className="mt-8 space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:space-x-4">
          <Button 
            size="lg"
            className="text-base px-8"
            onClick={login}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Sign In to Continue'}
          </Button>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Role-Based Access</h3>
            <p className="text-gray-600">
              Fine-grained permissions based on user roles and project attributes.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Authentication</h3>
            <p className="text-gray-600">
              Built with Keycloak for enterprise-grade security and SSO capabilities.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Collaboration</h3>
            <p className="text-gray-600">
              Streamlined workflows for managing projects and team communication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
