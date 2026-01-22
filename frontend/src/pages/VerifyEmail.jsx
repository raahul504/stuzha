// frontend/src/pages/VerifyEmail.jsx - Already exists, UPDATE

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    apiClient.get(`/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus('success');
        setMessage('Email verified successfully!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.error?.message || 'Verification failed');
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        {status === 'verifying' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Verifying email...</p>
          </div>
        )}
        {status === 'success' && (
          <>
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <p className="text-green-600 text-xl mb-4">{message}</p>
            <button 
              onClick={() => navigate('/login')} 
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Login
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-red-600 text-5xl mb-4">✕</div>
            <p className="text-red-600 text-xl mb-4">{message}</p>
            <button 
              onClick={() => navigate('/register')} 
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Register Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}