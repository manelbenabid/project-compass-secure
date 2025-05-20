
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-12 overflow-hidden bg-white rounded-lg shadow-md text-center max-w-md">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="mt-6 text-center">
          <h3 className="text-lg font-medium text-gray-900">Unauthorized Access</h3>
          <p className="mt-2 text-sm text-gray-500">
            You don't have permission to access this page. 
            Please contact your administrator if you believe this is an error.
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
