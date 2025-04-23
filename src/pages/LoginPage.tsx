
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import { VERIFICATION_STATUS } from '@/lib/constants';

const LoginPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      if (currentUser.verificationStatus === VERIFICATION_STATUS.APPROVED) {
        navigate('/dashboard');
      } else {
        // Any user that isn't approved goes to verification pending page
        navigate('/verification-pending');
      }
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-treasure-blue">TreasureBook</h1>
          <p className="mt-2 text-gray-600">Your child's journey, beautifully documented</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
