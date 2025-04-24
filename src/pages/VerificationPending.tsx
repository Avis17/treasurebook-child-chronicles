import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VERIFICATION_STATUS, ADMIN_EMAIL } from '@/lib/constants';
import { useToast } from '@/components/ui/use-toast';

const VerificationPending = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log("VerificationPending component mounted", {
      currentUser: currentUser?.email,
      isAdmin: currentUser?.email === ADMIN_EMAIL,
      verificationStatus: currentUser?.verificationStatus,
      adminEmail: ADMIN_EMAIL
    });

    if (!currentUser) {
      console.log("No current user, redirecting to login");
      navigate('/login');
      return;
    }

    // Allow admin to bypass verification check - critical check
    if (currentUser.email === ADMIN_EMAIL) {
      console.log("Admin detected in VerificationPending, redirecting to dashboard");
      navigate('/dashboard');
      return;
    }

    if (currentUser.verificationStatus === VERIFICATION_STATUS.APPROVED) {
      console.log("User is approved, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out"
      });
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!currentUser) {
    return null; // Will redirect in the useEffect
  }

  // An additional safety check to prevent admin from seeing this page
  if (currentUser.email === ADMIN_EMAIL) {
    return null; // Will redirect in the useEffect
  }

  const isPending = currentUser.verificationStatus === VERIFICATION_STATUS.PENDING;
  const isRejected = currentUser.verificationStatus === VERIFICATION_STATUS.REJECTED;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-treasure-blue">TreasureBook</h1>
          <p className="mt-2 text-gray-600">Your child's journey, beautifully documented</p>
        </div>
        
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className={`h-2 ${isPending ? 'bg-yellow-400' : 'bg-red-500'}`}></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-center">
              {isPending ? 'Verification Pending' : 'Access Denied'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-6 py-4">
              {isPending ? (
                <>
                  <div className="rounded-full bg-yellow-100 p-6">
                    <svg className="h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="space-y-2 text-center">
                    <p className="text-lg">Your account is awaiting verification</p>
                    <p className="text-gray-500">
                      Our administrators are reviewing your account. This process typically takes 24-48 hours.
                    </p>
                    <p className="font-medium text-blue-600 mt-4">
                      Please contact admin at <a href="mailto:ashrav.siva@gmail.com" className="underline">ashrav.siva@gmail.com</a> for approval
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-full bg-red-100 p-6">
                    <svg className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="space-y-2 text-center">
                    <p className="text-lg font-medium">Your account verification was denied</p>
                    <p className="text-gray-500">
                      Unfortunately, your account registration has been rejected. Please contact our administrator for more information.
                    </p>
                    <p className="font-medium text-blue-600 mt-4">
                      Please contact admin at <a href="mailto:ashrav.siva@gmail.com" className="underline">ashrav.siva@gmail.com</a> for assistance
                    </p>
                  </div>
                </>
              )}
              
              <Button onClick={handleLogout} variant="outline" className="mt-6">
                Return to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerificationPending;
