
import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import Logo from '../components/Logo';

import { User } from '../types';
import { api } from '../services/api';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSocialLoginSuccess?: (user: User) => Promise<void>;
  onNavigate: (view: 'LANDING' | 'REGISTER' | 'FORGOT_PASSWORD') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSocialLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showSocialPicker, setShowSocialPicker] = useState<'google' | 'apple' | null>(null);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading('google');
      try {
        console.log("Google Token:", tokenResponse.access_token);
        // Call backend to verify token and get user
        const user = await api.socialLogin('google', tokenResponse.access_token);

        if (onSocialLoginSuccess) {
          await onSocialLoginSuccess(user);
        } else {
          // Fallback if prop not provided (shouldn't happen with updated App.tsx)
          console.error("onSocialLoginSuccess definition missing");
          setError("Login configuration error");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Google login failed');
      } finally {
        setIsLoading(null);
      }
    },
    onError: () => setError('Google login Failed'),
  });

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading('email');
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
        <div className="p-8">
          <div className="text-center mb-8 flex flex-col items-center">
            <div className="p-2 cursor-pointer hover:scale-105 transition-transform" onClick={() => onNavigate('LANDING')}>
              <Logo className="w-24 h-24" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">Welcome Back</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sign in to Paperly</p>
          </div>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => loginWithGoogle()}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              {isLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
            </button>
            <button
              onClick={() => { }} // Placeholder logic
              className="w-full flex items-center justify-center gap-3 bg-black text-white py-3 rounded-xl hover:bg-gray-900 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06.35C2.79 20.18 0 14.83 0 10.5c0-4.08 2.65-6.61 5.37-6.61 1.09 0 2.2.5 2.87.97.74.5 1.5.5 2.22 0 .91-.56 2.05-1.06 3.41-1.06 1.09 0 2.25.31 3.03.88-1.55 1.02-2.3 2.86-2.12 4.9.23 2.5 2.45 4.31 4.98 4.31.06 0 .12 0 .18-.01-.39 2.53-1.63 4.98-3.32 6.4h.42zM12.03 3.75c-.24-1.7 1.1-3.27 2.62-3.75.31 1.77-1.15 3.52-2.62 3.75z" />
              </svg>
              Continue with Apple
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1"></div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Or continue with email</span>
            <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1"></div>
          </div>

          <form onSubmit={handleStandardSubmit} className="space-y-5">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium border border-red-100">{error}</div>}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                placeholder="alice@student.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
            <div className="text-right mb-4">
              <button type="button" onClick={() => onNavigate('FORGOT_PASSWORD')} className="text-sm text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                Forgot password?
              </button>
            </div>
            <button
              type="submit"
              disabled={!!isLoading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg"
            >
              {isLoading === 'email' ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              New to Paperly?{' '}
              <button onClick={() => onNavigate('REGISTER')} className="font-bold text-indigo-600 hover:underline">Create an account</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
