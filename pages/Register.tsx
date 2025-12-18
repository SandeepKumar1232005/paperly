
import React, { useState } from 'react';
import { UserRole } from '../types';
import Logo from '../components/Logo';

interface RegisterProps {
  onRegister: (name: string, email: string, role: UserRole) => Promise<void>;
  onNavigate: (view: 'LANDING' | 'LOGIN') => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('email');
    await onRegister(name, email, role);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8 flex flex-col items-center">
            <div className="p-2 cursor-pointer hover:scale-105 transition-transform" onClick={() => onNavigate('LANDING')}>
              <Logo className="w-24 h-24" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-4">Join Paperly</h2>
            <p className="text-slate-500 text-sm mt-1">Select your account type to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${role === 'STUDENT' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                I'm a Student
              </button>
              <button
                type="button"
                onClick={() => setRole('WRITER')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${role === 'WRITER' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                I'm a Writer
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="john@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={!!isLoading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              {isLoading === 'email' ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <button onClick={() => onNavigate('LOGIN')} className="font-bold text-indigo-600 hover:underline">Sign in instead</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
