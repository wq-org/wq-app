import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setError('Invalid verification link');
        setIsVerifying(false);
        return;
      }

      try {
        // TODO: Implement email verification API call
        console.log('Verify email with token:', token);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
        setIsSuccess(true);
      } catch (err) {
        setError('Verification failed. Please try again.');
      } finally {
        setIsVerifying(false);
      }
    }

    verifyEmail();
  }, [token]);

  return (
    <div className="w-full container mx-auto max-w-lg h-screen flex items-center justify-center">
      <div className="border p-8 rounded-3xl shadow-lg text-center max-w-md">
        {isVerifying ? (
          <>
            <h1 className="text-2xl font-light mb-4">Verifying Email...</h1>
            <p className="text-muted-foreground">Please wait while we verify your email address.</p>
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h1 className="text-2xl font-light mb-4">Email Verified!</h1>
            <p className="text-muted-foreground mb-6">
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <Button onClick={() => navigate('/auth/login')}>
              Go to Login
            </Button>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-light mb-4">Verification Failed</h1>
            <p className="text-muted-foreground mb-6">
              {error || 'Unable to verify your email. The link may be invalid or expired.'}
            </p>
            <Button onClick={() => navigate('/auth/signup')}>
              Back to Sign Up
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

