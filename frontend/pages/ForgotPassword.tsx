import React, { useState } from 'react';
import { api } from '../services/api';
import Logo from '../components/Logo';

interface ForgotPasswordProps {
    onNavigate: (view: 'LOGIN') => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        try {
            await api.requestPasswordReset(email);
            setMessage({ type: 'success', text: `OTP sent to ${email}. Check your email (or console for demo).` });
            setStep(2);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to send OTP.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        try {
            if (newPassword.length < 8) throw new Error("Password must be at least 8 characters.");
            await api.resetPassword(email, otp, newPassword);
            setMessage({ type: 'success', text: 'Password reset successfully. Redirecting to login...' });
            setTimeout(() => onNavigate('LOGIN'), 2000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to reset password.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
                <div className="p-8">
                    <div className="text-center mb-8 flex flex-col items-center">
                        <div className="p-2 cursor-pointer hover:scale-105 transition-transform" onClick={() => onNavigate('LOGIN')}>
                            <Logo className="w-20 h-20" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">
                            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            {step === 1 ? 'Enter your email to receive a reset code.' : 'Enter the code sent to your email.'}
                        </p>
                    </div>

                    {message && (
                        <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                            {message.text}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleRequestOTP} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                            >
                                {isLoading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email</label>
                                <input
                                    type="email"
                                    disabled
                                    value={email}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                                />
                            </div>
                            <div className="flex gap-3">
                                {/* 6 Digit OTP Input - Simplistic implementation */}
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">OTP Code</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none tracking-widest text-center font-mono text-lg transition-colors"
                                        placeholder="000000"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                                    placeholder="Min 8 chars"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                            >
                                {isLoading ? 'Resetting...' : 'Set New Password'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-slate-400 text-sm font-bold hover:text-slate-600"
                            >
                                Change Email
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center pt-6 border-t border-slate-50 dark:border-slate-800">
                        <button onClick={() => onNavigate('LOGIN')} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
