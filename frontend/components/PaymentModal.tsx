import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { api } from '../services/api';
import { Assignment } from '../types';

// Replace with your actual publishable key or environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

interface CheckoutFormProps {
    assignment: Assignment;
    onSuccess: () => void;
    onCancel: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ assignment, onSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const result = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    // Make sure to change this to your payment completion page
                    return_url: window.location.href,
                },
                redirect: 'if_required',
            });

            if (result.error) {
                setError(result.error.message || 'Payment failed');
            } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
                onSuccess();
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 border rounded-md bg-slate-50">
                <PaymentElement />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex justify-end gap-3 mt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    disabled={processing}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!stripe || processing}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    {processing ? 'Processing...' : `Pay ₹${assignment.budget}`}
                </button>
            </div>
        </form>
    );
};

interface PaymentModalProps {
    assignment: Assignment;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ assignment, isOpen, onClose, onSuccess }) => {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && assignment) {
            setLoading(true);
            api.createPaymentIntent(assignment.id)
                .then(data => {
                    setClientSecret(data.clientSecret);
                })
                .catch(err => {
                    console.error("Failed to fetch payment intent:", err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [isOpen, assignment]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800">Secure Payment</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6">
                    <div className="mb-6">
                        <p className="text-sm text-slate-500 mb-1">Paying for</p>
                        <div className="font-medium text-slate-800">{assignment.title}</div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : clientSecret ? (
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <CheckoutForm
                                assignment={assignment}
                                onSuccess={() => {
                                    onSuccess();
                                    onClose();
                                }}
                                onCancel={onClose}
                            />
                        </Elements>
                    ) : (
                        <div className="text-center text-red-500 py-4">
                            Unable to initialize payment. Please try again.
                        </div>
                    )}
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                        Payments secured by Stripe (UPI, Cards, Netbanking)
                    </p>
                </div>
            </div>
        </div>
    );
};
