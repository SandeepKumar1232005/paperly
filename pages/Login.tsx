
import React, { useState } from 'react';
import Logo from '../components/Logo';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onNavigate: (view: 'LANDING' | 'REGISTER') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showSocialPicker, setShowSocialPicker] = useState<'google' | 'apple' | null>(null);

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
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8 flex flex-col items-center">
            <div className="p-2 cursor-pointer hover:scale-105 transition-transform" onClick={() => onNavigate('LANDING')}>
              <Logo className="w-24 h-24" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-4">Welcome Back</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to Paperly</p>
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
              />
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
