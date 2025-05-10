
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import LoginForm from '@/components/auth/LoginForm';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-treasure-blue dark:text-blue-400 font-heading">TreasureBook</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Your child's journey, beautifully documented</p>
        </div>
        
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="pt-6">
            <LoginForm />
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Need help? <Link to="/help" className="text-treasure-blue dark:text-blue-400 hover:underline">Contact support</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
