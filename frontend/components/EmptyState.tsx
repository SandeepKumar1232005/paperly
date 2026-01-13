import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-4">
                <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">{description}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
