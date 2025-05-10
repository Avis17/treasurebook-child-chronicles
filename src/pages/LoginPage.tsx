
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import { VERIFICATION_STATUS, ADMIN_EMAIL } from '@/lib/constants';

const LoginPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      // Always allow admin to access dashboard regardless of verification status
      if (currentUser.email === ADMIN_EMAIL) {
        navigate('/dashboard');
        return;
      }
      
      if (currentUser.verificationStatus === VERIFICATION_STATUS.APPROVED) {
        navigate('/dashboard');
      } else {
        // Any non-admin user that isn't approved goes to verification pending page
        navigate('/verification-pending');
      }
    }
  }, [currentUser, navigate]);

  return (
    <div className="auth-container animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient-primary font-heading">TreasureBook</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Your child's journey, beautifully documented</p>
        </div>
        
        <div className="auth-card bg-white/90 dark:bg-gray-800/90">
          <LoginForm />
        </div>
        
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Need assistance? <a href="mailto:support@treasurebook.app" className="text-treasure-blue dark:text-blue-400 hover:underline">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
