import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }
    authService.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        {status === 'verifying' && <p>Verifying email...</p>}
        {status === 'success' && (
          <>
            <p className="text-green-600 mb-4">✅ Email verified!</p>
            <button onClick={() => navigate('/login')} className="bg-blue-600 text-white px-6 py-2 rounded">
              Login
            </button>
          </>
        )}
        {status === 'error' && <p className="text-red-600">❌ Verification failed</p>}
      </div>
    </div>
  );
}