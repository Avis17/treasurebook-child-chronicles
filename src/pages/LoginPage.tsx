
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
      } else if (
        currentUser.verificationStatus === VERIFICATION_STATUS.PENDING ||
        currentUser.verificationStatus === VERIFICATION_STATUS.REJECTED
      ) {
        navigate('/verification-pending');
      } else {
        // For users without a verification status yet (legacy users)
        navigate('/dashboard');
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
